import { assert, assertEquals, assertStringIncludes } from "./deps.ts";
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

test({ args: ["run", "./examples/echo.js"] }, async (proc) => {
  await waitReady(proc);

  const req = await fetch("http://127.0.0.1:8080", {
    method: "POST",
    body: "Foobar!",
  });
  assertEquals(req.status, 200);
  assertEquals(req.headers.get("server"), "denosr");
  const body = await req.text();
  assertEquals(body, "Foobar!");

  await kill(proc);

  await proc.status();
  proc.stdout?.close();
  proc.stderr?.close();
});

test({ args: ["run", "./examples/with_nonexistent_dep.js"] }, async (proc) => {
  const [stdout, stderr, { code }] = await output(proc);
  assertEquals(code, 1);
  assertEquals(stdout, "");
  assertStringIncludes(stderr, "Cannot resolve module");
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

test(
  { args: ["run", "./tests/testdata/syntax_error_dot_js"] },
  async (proc) => {
    const [stdout, stderr, { code }] = await output(proc);
    assertEquals(code, 1);
    assertEquals(stdout, "");
    assertStringIncludes(stderr, "Unexpected eof at");
    assertStringIncludes(stderr, "Failed to analyze");
  },
);

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
  name: "deployctl no errors on timer methods",
  args: ["run", "./tests/testdata/timers.js"],
}, async (proc) => {
  await waitReady(proc);

  const response = await fetch("http://127.0.0.1:8080");

  assertEquals(await response.json(), { errors: [] });

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

  const resp = await fetch("http://127.0.0.1:8080");
  await resp.text();

  await kill(proc);

  const [stdout, stderr, { code }] = await output(proc);
  assert(code !== 0);
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
