import { assertEquals, assertStringIncludes } from "./deps.ts";
import { output, test } from "./utils.ts";

test({ args: ["types"] }, async (proc) => {
  const [stdout, stderr, { code }] = await output(proc);
  assertEquals(stderr, "");
  assertEquals(code, 0);
  assertStringIncludes(stdout, `/// <reference no-default-lib="true" />`);
});
