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
): Deno.Process {
  const cmd = [
    Deno.execPath(),
    "run",
    "--no-check",
  ];

  if (permissions?.net) cmd.push("--allow-net");
  if (permissions?.read) cmd.push("--allow-read");
  if (permissions?.write) cmd.push("--allow-write");
  if (permissions?.env) cmd.push("--allow-env");
  if (permissions?.run) cmd.push("--allow-run");

  cmd.push(new URL("../deployctl.ts", import.meta.url).toString());

  return Deno.run({
    cmd: [...cmd, ...args],
    stdin: "null",
    stdout: "piped",
    stderr: "piped",
  });
}

export interface TestOptions {
  args: string[];
  name?: string;
  permissions?: Permissions;
}

export function test(
  opts: TestOptions,
  fn: (proc: Deno.Process) => void | Promise<void>,
) {
  const name = opts.name ?? ["deployctl", ...opts.args].join(" ");
  Deno.test(name, async () => {
    const proc = deployctl(opts.args, opts.permissions);
    try {
      await fn(proc);
    } finally {
      proc.close();
    }
  });
}

export async function output(
  proc: Deno.Process,
): Promise<[string, string, Deno.ProcessStatus]> {
  const stdout = await proc.output();
  const stderr = await proc.stderrOutput();
  const status = await proc.status();
  return [
    new TextDecoder().decode(stdout),
    new TextDecoder().decode(stderr),
    status,
  ];
}
