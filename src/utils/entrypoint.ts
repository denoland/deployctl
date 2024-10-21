import { resolve, toFileUrl } from "@std/path";
import { stringify as stringifyError } from "../error.ts";

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
    throw `Failed to parse ${diagnosticName} specifier '${entrypoint}': ${
      stringifyError(err)
    }`;
  }

  if (entrypointSpecifier.protocol === "file:") {
    try {
      await Deno.lstat(entrypointSpecifier);
    } catch (err) {
      throw `Failed to open ${diagnosticName} file at '${entrypointSpecifier}': ${
        stringifyError(err)
      }`;
    }
  }

  return entrypointSpecifier;
}

export function isURL(entrypoint: string): boolean {
  return entrypoint.startsWith("https://") ||
    entrypoint.startsWith("http://") ||
    entrypoint.startsWith("file://") ||
    entrypoint.startsWith("data:");
}
