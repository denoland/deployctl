import { assert } from "@std/assert/assert";
import { assertEquals } from "@std/assert/assert_equals";
import { join } from "@std/path/join";
import { VERSION } from "../src/version.ts";

// Install the current script, then upgrade it to 1.12.0 (effectively downgrade)
// to see if the upgrade command works as expected.
Deno.test("upgrade", async () => {
  const decoder = new TextDecoder();

  const tempDir = await Deno.makeTempDir();
  console.log(tempDir);

  const exe = Deno.build.os === "windows" ? "deployctl.cmd" : "deployctl";

  // Install the current `deployctl.ts`
  {
    const installCmd = await new Deno.Command(Deno.execPath(), {
      args: [
        "install",
        "-A",
        "--reload",
        "--force",
        "--global",
        "--config",
        join(Deno.cwd(), "deno.jsonc"),
        "--root",
        tempDir,
        join(Deno.cwd(), "deployctl.ts"),
      ],
      stdout: "inherit",
      stderr: "inherit",
    }).output();
    assert(installCmd.success);
  }

  // Check the version of the installed `deployctl`
  {
    const versionCmd = await new Deno.Command(`${tempDir}/bin/${exe}`, {
      args: ["--version"],
    }).output();
    const stdout = decoder.decode(versionCmd.stdout).trim();
    const stderr = decoder.decode(versionCmd.stderr).trim();
    assert(versionCmd.success, `stdout: ${stdout}\nstderr: ${stderr}`);
    assertEquals(
      stdout,
      `deployctl ${VERSION}`,
      `stdout: ${stdout}\nstderr: ${stderr}`,
    );
  }

  const UPGRADE_VERSION = "1.12.0";

  // "Upgrade" the installed `deployctl` to 1.12.0
  {
    const upgradeCmd = await new Deno.Command(`${tempDir}/bin/${exe}`, {
      args: [
        "upgrade",
        "--root",
        tempDir,
        UPGRADE_VERSION,
      ],
      stdout: "inherit",
      stderr: "inherit",
    }).output();
    assert(upgradeCmd.success);
  }

  // Check the version of the "upgraded" `deployctl`
  {
    const versionCmd = await new Deno.Command(`${tempDir}/bin/${exe}`, {
      args: ["--version"],
    }).output();
    const stdout = decoder.decode(versionCmd.stdout).trim();
    const stderr = decoder.decode(versionCmd.stderr).trim();
    assert(versionCmd.success);
    assertEquals(
      stdout,
      `deployctl ${UPGRADE_VERSION}`,
      `stdout: ${stdout}\nstderr: ${stderr}`,
    );
  }
});
