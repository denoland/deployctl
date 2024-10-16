import { resolve, toFileUrl } from "@std/path";

/**
 * Parses the entrypoint to a URL.
 * Ensures the file exists when the entrypoint is a local file.
 */
export async function parseEntrypoint(
  entrypoint: string,
  root?: string,
  diagnosticName = "entrypoint",
): Promise<URL> {
  let entrypointSpecifier: URL;
  try {
    if (isURL(entrypoint)) {
      entrypointSpecifier = new URL(entrypoint);
    } else {
      entrypointSpecifier = toFileUrl(resolve(root ?? Deno.cwd(), entrypoint));
    }
  } catch (err) {
    throw `Failed to parse ${diagnosticName} specifier '${entrypoint}': ${err.message}`;
  }

  if (entrypointSpecifier.protocol == "file:") {
    try {
      await Deno.lstat(entrypointSpecifier);
    } catch (err) {
      throw `Failed to open ${diagnosticName} file at '${entrypointSpecifier}': ${err.message}`;
    }
  }

  return entrypointSpecifier;
}

export function isURL(entrypoint: string): boolean {
  return entrypoint.startsWith("https://") ||
    entrypoint.startsWith("http://") ||
    entrypoint.startsWith("file://");
}
