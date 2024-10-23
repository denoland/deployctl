import { lessThan as semverLessThan, parse as semverParse } from "@std/semver";
import { assert } from "@std/assert/assert";
import { MINIMUM_DENO_VERSION } from "../src/version.ts";

export interface Permissions {
  net: boolean;
  read: boolean;
  write: boolean;
  env: boolean;
  run: boolean;
  sys: boolean;
}

export function deployctl(
  args: string[],
  permissions: Permissions = {
    net: true,
    read: true,
    write: true,
    env: true,
    run: true,
    sys: true,
  },
): Deno.ChildProcess {
  const deno = [
    Deno.execPath(),
    "run",
  ];

  if (permissions?.net) deno.push("--allow-net");
  if (permissions?.read) deno.push("--allow-read");
  if (permissions?.write) deno.push("--allow-write");
  if (permissions?.env) deno.push("--allow-env");
  if (permissions?.run) deno.push("--allow-run");
  if (permissions?.sys) deno.push("--allow-sys");

  deno.push("--quiet");

  // Deno 1.x does not support lockfile v4. To work around this, we append
  // `--no-lock` in this case.
  const v2 = semverParse("2.0.0");
  assert(
    semverLessThan(semverParse(MINIMUM_DENO_VERSION), v2),
    "We do not support Deno 1.x anymore. Please remove the `isDeno1` check below in the source code.",
  );
  const isDeno1 = semverLessThan(semverParse(Deno.version.deno), v2);
  if (isDeno1) {
    deno.push("--no-lock");
  }

  deno.push(new URL("../deployctl.ts", import.meta.url).toString());

  const cmd = Deno.build.os == "linux"
    ? ["bash", "-c", [...deno, ...args].join(" ")]
    : [...deno, ...args];

  return new Deno.Command(cmd[0], {
    args: cmd.slice(1),
    stdin: "null",
    stdout: "piped",
    stderr: "piped",
  }).spawn();
}

export interface TestOptions {
  args: string[];
  name?: string;
  permissions?: Permissions;
}

export function test(
  opts: TestOptions,
  fn: (proc: Deno.ChildProcess) => void | Promise<void>,
) {
  const name = opts.name ?? ["deployctl", ...opts.args].join(" ");
  Deno.test(name, async () => {
    const proc = deployctl(opts.args, opts.permissions);
    await fn(proc);
  });
}

export async function output(
  proc: Deno.ChildProcess,
): Promise<[string, string, Deno.CommandStatus]> {
  const [status, { stdout, stderr }] = await Promise.all([
    proc.status,
    proc.output(),
  ]);
  return [
    new TextDecoder().decode(stdout),
    new TextDecoder().decode(stderr),
    status,
  ];
}
