import { fromFileUrl } from "../../deps.ts";

export class ModuleGraphError extends Error {
  name = "ModuleGraphError";
  constructor(message: string) {
    super(message);
  }
}

/**
 * Analyzes the given specifier and returns all code or type dependencies of
 * that module (remote and local), as fully qualified module specifiers.
 */
export async function analyzeDeps(
  specifier: URL,
): Promise<{ deps: string[]; errors: string[] }> {
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
  const raw = await proc.output();
  const status = await proc.status();
  if (!status) throw new Error("Failed to analyze dependencies.");
  const modules: Array<{ specifier: string; error?: string }> =
    JSON.parse(new TextDecoder().decode(raw)).modules;

  const deps = modules.filter((module) => module.error === undefined)
    .map((module) => module.specifier)
    .filter((file) => file.startsWith("file://"))
    .map((file) => fromFileUrl(file));
  const errors = modules.filter((module) => module.error !== undefined)
    .map((module) => module.error!);

  return { deps, errors };
}
