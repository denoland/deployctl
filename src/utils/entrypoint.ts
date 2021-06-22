import { resolve, toFileUrl } from "../../deps.ts";
import { error } from "../error.ts";

/**
 * Parses the entrypoint to a URL.
 * Ensures the file exists when the entrypoint is a local file.
 */
export async function parseEntrypoint(entrypoint: string): Promise<URL> {
  let entrypointSpecifier: URL;
  try {
    entrypointSpecifier =
      (entrypoint.startsWith("https://") || entrypoint.startsWith("http://"))
        ? new URL(entrypoint)
        : toFileUrl(resolve(Deno.cwd(), entrypoint));
  } catch (err) {
    error(
      `Failed to parse entrypoint specifier '${entrypoint}': ${err.message}`,
    );
  }

  if (entrypointSpecifier.protocol == "file:") {
    try {
      await Deno.lstat(entrypointSpecifier);
    } catch (err) {
      error(
        `Failed to open entrypoint file at '${entrypointSpecifier}': ${err.message}`,
      );
    }
  }

  return entrypointSpecifier;
}
