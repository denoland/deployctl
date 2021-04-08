import { assertEquals, assertStringIncludes } from "./deps.ts";
import { kill, output, test, waitReady } from "./utils.ts";

test({ args: ["run", "./examples/hello.js"] }, async (proc) => {
  await waitReady(proc);

  const req = await fetch("http://127.0.0.1:8080");
  assertEquals(req.status, 200);
  assertEquals(req.headers.get("server"), "denosr");
  const body = await req.text();
  assertEquals(body, "Hello world!");

  await kill(proc);

  await proc.status();
  proc.stdout?.close();
  proc.stderr?.close();
});

const tmp = await Deno.makeTempFile({ suffix: ".js" });
await Deno.copyFile("./examples/hello.js", tmp);

test({
  name: "deployctl run --watch ./examples/hello.js",
  args: ["run", "--watch", tmp],
}, async (proc) => {
  await waitReady(proc);

  const req1 = await fetch("http://127.0.0.1:8080");
  assertEquals(req1.status, 200);
  assertEquals(req1.headers.get("server"), "denosr");
  const body1 = await req1.text();
  assertEquals(body1, "Hello world!");

  let contents = await Deno.readTextFile(tmp);
  contents = contents.replace("Hello world!", "Hi :-)");
  await Deno.writeTextFile(tmp, contents);

  await waitReady(proc);

  const req2 = await fetch("http://127.0.0.1:8080");
  assertEquals(req2.status, 200);
  assertEquals(req2.headers.get("server"), "denosr");
  const body2 = await req2.text();
  assertEquals(body2, "Hi :-)");

  await kill(proc);

  await proc.status();
  proc.stdout?.close();
  proc.stderr?.close();
});

test({ args: ["run", "https://%"] }, async (proc) => {
  const [stdout, stderr, { code }] = await output(proc);
  assertEquals(code, 1);
  assertEquals(stdout, "");
  assertStringIncludes(stderr, "Failed to parse entrypoint specifier");
});

test({ args: ["run", "./examples/wrong_file_name.js"] }, async (proc) => {
  const [stdout, stderr, { code }] = await output(proc);
  assertEquals(code, 1);
  assertEquals(stdout, "");
  assertStringIncludes(stderr, "Failed to open entrypoint file");
});

test({
  name: "deployctl run ./examples/env.ts --env .env",
  args: ["run", "./examples/env.ts", "--env", "./tests/testdata/example.env"],
}, async (proc) => {
  await waitReady(proc);
  const response = await fetch("http://127.0.0.1:8080");
  const json = await response.json();

  assertEquals(json, { secret: "asecrettoken" });

  await kill(proc);
  await proc.status();
  proc.stdout?.close();
  proc.stderr?.close();
});

test({
  name: "deployctl errors on usage of unsupported timer methods",
  args: ["run", "./tests/testdata/timers.js"],
}, async (proc) => {
  await waitReady(proc);

  const response = await fetch("http://127.0.0.1:8080");
  const expectedErrors = [
    "setInterval is not defined",
    "clearInterval is not defined",
    "setTimeout is not defined",
    "clearTimeout is not defined",
  ].sort();

  assertEquals(await response.json(), { errors: expectedErrors });

  await kill(proc);
  await proc.status();
  proc.stdout?.close();
  proc.stderr?.close();
});

test({
  name: "deployctl errors on multiple event.respondWith calls",
  args: ["run", "./tests/testdata/respond_twice.js"],
}, async (proc) => {
  await waitReady(proc);
  try {
    await fetch("http://127.0.0.1:8080");
    // deno-lint-ignore no-empty
  } catch {}

  const [stdout, stderr, { code }] = await output(proc);
  assertEquals(code, 1);
  assertEquals(stdout, "");
  assertStringIncludes(
    stderr,
    "TypeError: Already responded to this FetchEvent",
  );
});

test({
  name: "serve local files",
  args: ["run", "./examples/serve_local.ts"],
}, async (proc) => {
  await waitReady(proc);
  const response = await fetch("http://127.0.0.1:8080");
  const json = await response.json();

  assertEquals(json, { hello: "world" });

  await kill(proc);
  await proc.status();
  proc.stdout?.close();
  proc.stderr?.close();
});
