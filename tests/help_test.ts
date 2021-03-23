import { assertEquals, assertStringIncludes } from "./deps.ts";
import { output, test } from "./utils.ts";

test({ args: [] }, async (proc) => {
  const [stdout, stderr, { code }] = await output(proc);
  assertStringIncludes(stderr, "SUBCOMMANDS:");
  assertStringIncludes(stderr, "run ");
  assertStringIncludes(stderr, "types ");
  assertEquals(code, 1);
  assertEquals(stdout, "");
});

test({ args: ["-h"] }, async (proc) => {
  const [stdout, stderr, { code }] = await output(proc);
  assertStringIncludes(stderr, "SUBCOMMANDS:");
  assertStringIncludes(stderr, "run ");
  assertStringIncludes(stderr, "types ");
  assertEquals(code, 1);
  assertEquals(stdout, "");
});

test({ args: ["run", "-h"] }, async (proc) => {
  const [stdout, stderr, { code }] = await output(proc);
  assertStringIncludes(stderr, "USAGE:");
  assertStringIncludes(stderr, "deployctl run");
  assertEquals(code, 1);
  assertEquals(stdout, "");
});

test({ args: ["types", "-h"] }, async (proc) => {
  const [stdout, stderr, { code }] = await output(proc);
  assertStringIncludes(stderr, "USAGE:");
  assertStringIncludes(stderr, "deployctl types");
  assertEquals(code, 1);
  assertEquals(stdout, "");
});
