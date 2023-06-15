export interface Permissions {
  net: boolean;
  read: boolean;
  write: boolean;
  env: boolean;
  run: boolean;
}

export function deployctl(
  args: string[],
  permissions: Permissions = {
    net: true,
    read: true,
    write: true,
    env: true,
    run: true,
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
