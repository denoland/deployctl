import { join } from "../../deps.ts";
import { ManifestEntry } from "./api_types.ts";

/** Calculate git object hash, like `git hash-object` does. */
export async function calculateGitSha1(bytes: Uint8Array) {
  const prefix = `blob ${bytes.byteLength}\0`;
  const prefixBytes = new TextEncoder().encode(prefix);
  const fullBytes = new Uint8Array(prefixBytes.byteLength + bytes.byteLength);
  fullBytes.set(prefixBytes);
  fullBytes.set(bytes, prefixBytes.byteLength);
  const hashBytes = await crypto.subtle.digest("SHA-1", fullBytes);
  const hashHex = Array.from(new Uint8Array(hashBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

function include(
  path: string,
  include: string[],
  exclude: string[],
): boolean {
  if (
    include.length &&
    !include.some((pattern): boolean => path.startsWith(pattern))
  ) {
    return false;
  }
  if (
    exclude.length &&
    exclude.some((pattern): boolean => path.startsWith(pattern))
  ) {
    return false;
  }
  return true;
}

export async function walk(
  cwd: string,
  dir: string,
  files: Map<string, string>,
  options: { include: string[]; exclude: string[] },
): Promise<Record<string, ManifestEntry>> {
  const entries: Record<string, ManifestEntry> = {};
  for await (const file of Deno.readDir(dir)) {
    const path = join(dir, file.name);
    const relative = path.slice(cwd.length);
    if (
      !include(
        path.slice(cwd.length + 1),
        options.include,
        options.exclude,
      )
    ) {
      continue;
    }
    let entry: ManifestEntry;
    if (file.isFile) {
      const data = await Deno.readFile(path);
      const gitSha1 = await calculateGitSha1(data);
      entry = {
        kind: "file",
        gitSha1,
        size: data.byteLength,
      };
      files.set(gitSha1, path);
    } else if (file.isDirectory) {
      if (relative === "/.git") continue;
      entry = {
        kind: "directory",
        entries: await walk(cwd, path, files, options),
      };
    } else if (file.isSymlink) {
      const target = await Deno.readLink(path);
      entry = {
        kind: "symlink",
        target,
      };
    } else {
      throw new Error(`Unreachable`);
    }
    entries[file.name] = entry;
  }
  return entries;
}
