import { assertEquals } from "./deps.ts";
import { kill, test, waitReady } from "./utils.ts";

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
