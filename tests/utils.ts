import { BufReader } from "./deps.ts";

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
  const deno = [
    Deno.execPath(),
    "run",
    "--no-check",
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

  return Deno.run({
    cmd,
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
  const [status, stdout, stderr] = await Promise.all([
    proc.status(),
    proc.output(),
    proc.stderrOutput(),
  ]);
  return [
    new TextDecoder().decode(stdout),
    new TextDecoder().decode(stderr),
    status,
  ];
}

export async function waitReady(proc: Deno.Process) {
  const stderr = new BufReader(proc.stderr!);
  const lines = [];
  while (true) {
    const line = await stderr.readString("\n");
    lines.push(line);
    if (line?.includes("Listening on")) {
      return;
    }
    if (line?.includes("error")) {
      throw new Error("deployctl failed: " + lines);
    }
  }
}

export async function kill(proc: Deno.Process) {
  if (Deno.build.os == "linux" || Deno.build.os == "darwin") {
    const pkill = Deno.run({ cmd: ["pkill", "-2", "-P", String(proc.pid)] });
    await pkill.status();
    pkill.close();
    proc.kill(2);
  } else {
    const pkill = Deno.run({
      cmd: ["taskkill", "/t", "/pid", String(proc.pid)],
    });
    await pkill.status();
    pkill.close();
  }
}
