import { join } from "@std/path/join";
import { getVersions } from "../subcommands/upgrade.ts";

export function getConfigPaths() {
  const homeDir = Deno.build.os == "windows"
    ? Deno.env.get("USERPROFILE")!
    : Deno.env.get("HOME")!;
  const xdgCacheDir = Deno.env.get("XDG_CACHE_HOME");

  const denoDir = Deno.env.get("DENO_DIR");
  const cacheDir = join(
    denoDir ||
      (xdgCacheDir ? join(xdgCacheDir, "deno") : join(homeDir, ".deno")),
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
    const { updatePath, cacheDir } = getConfigPaths();
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
