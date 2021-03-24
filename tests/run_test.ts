import { assertEquals } from "./deps.ts";
import { kill, test, waitReady } from "./utils.ts";

test({ args: ["run", "./examples/hello.js"] }, async (proc) => {
  await waitReady(proc);

  const req = await fetch("http://127.0.0.1:8080");
  assertEquals(req.status, 200);
  assertEquals(req.headers.get("server"), "denosr");
  const body = await req.text();
  assertEquals(body, "Hello world!");

  kill(proc);

  await proc.status();
  proc.stdout?.close();
  proc.stderr?.close();
});
