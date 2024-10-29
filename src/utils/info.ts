import { join } from "@std/path/join";
import { getVersions } from "../subcommands/upgrade.ts";

export function getConfigPaths() {
  const homeDir = Deno.build.os == "windows"
    ? Deno.env.get("USERPROFILE")!
    : Deno.env.get("HOME")!;
  const configDir = join(homeDir, ".deno", "deployctl");

  return {
    configDir,
    updatePath: join(configDir, "update.json"),
    credentialsPath: join(configDir, "credentials.json"),
  };
}

export async function fetchReleases() {
  try {
    const { latest } = await getVersions();
    const updateInfo = { lastFetched: Date.now(), latest };
    const { updatePath, configDir } = getConfigPaths();
    await Deno.mkdir(configDir, { recursive: true });
    await Deno.writeFile(
      updatePath,
      new TextEncoder().encode(JSON.stringify(updateInfo, null, 2)),
    );
  } catch (_) {
    // We will try again later when the fetch isn't successful,
    // so we shouldn't report errors.
  }
}
