import { join } from "@std/path/join";
import { getVersions } from "../subcommands/upgrade.ts";
import { DenoDir } from "@deno/cache-dir";

export function getCachePaths() {
  const denoCacheDir = new DenoDir().root;
  const cacheDir = join(
    denoCacheDir,
    "deployctl",
  );

  return {
    cacheDir,
    updatePath: join(cacheDir, "update.json"),
    credentialsPath: join(cacheDir, "credentials.json"),
  };
}

export async function fetchReleases() {
  try {
    const { latest } = await getVersions();
    const updateInfo = { lastFetched: Date.now(), latest };
    const { updatePath, cacheDir } = getCachePaths();
    await Deno.mkdir(cacheDir, { recursive: true });
    await Deno.writeFile(
      updatePath,
      new TextEncoder().encode(JSON.stringify(updateInfo, null, 2)),
    );
  } catch (_) {
    // We will try again later when the fetch isn't successful,
    // so we shouldn't report errors.
  }
}
