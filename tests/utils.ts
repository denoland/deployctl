export interface Permissions {
  net: boolean;
  read: boolean;
  write: boolean;
  env: boolean;
  run: boolean;
  sys: boolean;
}

interface DenoOptions extends Permissions {
  noLock: boolean;
}

const defaultDenoOptions = {
  net: true,
  read: true,
  write: true,
  env: true,
  run: true,
  sys: true,
  noLock: false,
} as const satisfies DenoOptions;

function deployctl(
  args: string[],
  denoOptions: DenoOptions,
): Deno.ChildProcess {
  const deno = [
    Deno.execPath(),
    "run",
  ];

  if (denoOptions?.net) deno.push("--allow-net");
  if (denoOptions?.read) deno.push("--allow-read");
  if (denoOptions?.write) deno.push("--allow-write");
  if (denoOptions?.env) deno.push("--allow-env");
  if (denoOptions?.run) deno.push("--allow-run");
  if (denoOptions?.sys) deno.push("--allow-sys");
  if (denoOptions?.noLock) deno.push("--no-lock");

  deno.push("--quiet");

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
  const forwardNoLock = Deno.args.includes("--no-lock");
  console.log("==============================");
  console.log(Deno.args);
  console.log("==============================");
  const denoOpts = opts.permissions === undefined ? defaultDenoOptions : {
    ...defaultDenoOptions,
    ...opts.permissions,
    noLock: forwardNoLock,
  };
  Deno.test(name, async () => {
    const proc = deployctl(opts.args, denoOpts);
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
