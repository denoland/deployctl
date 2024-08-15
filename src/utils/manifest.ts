import { globToRegExp, isGlob, join, normalize } from "../../deps.ts";
import { unreachable } from "../../tests/deps.ts";
import type { ManifestEntry } from "./api_types.ts";

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
  include: RegExp[],
  exclude: RegExp[],
): boolean {
  if (
    include.length &&
    !include.some((pattern): boolean => pattern.test(normalize(path)))
  ) {
    return false;
  }
  if (
    exclude.length &&
    exclude.some((pattern): boolean => pattern.test(normalize(path)))
  ) {
    return false;
  }
  return true;
}

export async function walk(
  cwd: string,
  dir: string,
  options: { include: RegExp[]; exclude: RegExp[] },
): Promise<
  {
    manifestEntries: Record<string, ManifestEntry>;
    hashPathMap: Map<string, string>;
  }
> {
  const hashPathMap = new Map<string, string>();
  const manifestEntries = await walkInner(cwd, dir, hashPathMap, options);
  return {
    manifestEntries,
    hashPathMap,
  };
}

async function walkInner(
  cwd: string,
  dir: string,
  hashPathMap: Map<string, string>,
  options: { include: RegExp[]; exclude: RegExp[] },
): Promise<Record<string, ManifestEntry>> {
  const entries: Record<string, ManifestEntry> = {};
  for await (const file of Deno.readDir(dir)) {
    const path = join(dir, file.name);
    const relative = path.slice(cwd.length);
    if (
      // Do not test directories, because --include=foo/bar must include the directory foo (same goes with --include=*/bar)
      !file.isDirectory &&
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
      hashPathMap.set(gitSha1, path);
    } else if (file.isDirectory) {
      if (relative === "/.git") continue;
      entry = {
        kind: "directory",
        entries: await walkInner(cwd, path, hashPathMap, options),
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

/**
 * Converts a file path pattern, which may be a glob, to a RegExp instance.
 *
 * @param pattern file path pattern which may be a glob
 * @returns a RegExp instance that is equivalent to the given pattern
 */
export function convertPatternToRegExp(pattern: string): RegExp {
  return isGlob(pattern)
    // slice is used to remove the end-of-string anchor '$'
    ? new RegExp(globToRegExp(normalize(pattern)).toString().slice(1, -2))
    : new RegExp(`^${normalize(pattern)}`);
}

/**
 * Determines if the manifest contains the entry at the given relative path.
 *
 * @param manifestEntries manifest entries to search
 * @param entryRelativePathToLookup a relative path to look up in the manifest
 * @returns `true` if the manifest contains the entry at the given relative path
 */
export function containsEntryInManifest(
  manifestEntries: Record<string, ManifestEntry>,
  entryRelativePathToLookup: string,
): boolean {
  for (const [entryName, entry] of Object.entries(manifestEntries)) {
    switch (entry.kind) {
      case "file":
      case "symlink": {
        if (entryName === entryRelativePathToLookup) {
          return true;
        }
        break;
      }
      case "directory": {
        if (!entryRelativePathToLookup.startsWith(entryName)) {
          break;
        }

        const relativePath = entryRelativePathToLookup.slice(
          entryName.length + 1,
        );
        return containsEntryInManifest(entry.entries, relativePath);
      }
      default:
        unreachable();
    }
  }

  return false;
}
