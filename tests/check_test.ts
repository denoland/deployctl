// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.
import { assertEquals, assertStringIncludes } from "./deps.ts";
import { output, test } from "./utils.ts";

test({ args: ["check", "examples/hello.ts"] }, async (proc) => {
  const [stdout, _stderr, { code }] = await output(proc);
  assertStringIncludes(stdout, "OK");
  assertEquals(code, 0);
});

test({ args: ["check", "examples/has_type_error.ts"] }, async (proc) => {
  const [stdout, stderr, { code }] = await output(proc);
  assertStringIncludes(stderr, "TS2339"); // Property 'foo' does not exist on type 'Console'.
  assertEquals(stdout, "");
  assertEquals(code, 1);
});

test(
  { args: ["check", "./examples/with_nonexistent_dep.js"] },
  async (proc) => {
    const [stdout, stderr, { code }] = await output(proc);
    assertEquals(code, 1);
    assertEquals(stdout, "");
    assertStringIncludes(stderr, "Cannot resolve module");
  },
);
