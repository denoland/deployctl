import { fromFileUrl } from "../../deps.ts";

/**
 * Analyzes the given specifier and returns all code or type dependencies of
 * that module (remote and local), as fully qualified module specifiers.
 */
export async function analyzeDeps(specifier: URL): Promise<string[]> {
  const proc = Deno.run({
    cmd: [
      Deno.execPath(),
      "info",
      "--json",
      "--unstable",
      specifier.toString(),
    ],
    stdout: "piped",
  });
  const status = await proc.status();
  if (!status) throw new Error("Failed to analyze dependencies.");
  const raw = await proc.output();
  const modules: Array<{ specifier: string }> =
    JSON.parse(new TextDecoder().decode(raw)).modules;
  return modules.map((module) => module.specifier)
    .filter((file) => file.startsWith("file://"))
    .map((file) => fromFileUrl(file));
}
