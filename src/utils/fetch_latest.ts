// The code in this file runs in a Web Worker to fetch and
// store the information about deployctl latest release.
import { getVersions } from "../subcommands/upgrade.ts";
import { getConfigPaths } from "../utils/info.ts";

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
