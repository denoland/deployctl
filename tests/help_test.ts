import { assert, assertEquals, assertStringIncludes } from "./deps.ts";
import { output, test } from "./utils.ts";

test({ args: [] }, async (proc) => {
  const [stdout, stderr, { code }] = await output(proc);
  assertStringIncludes(stderr, "SUBCOMMANDS:");
  assertStringIncludes(stderr, "run ");
  assertStringIncludes(stderr, "types ");
  assertEquals(code, 1);
  assertEquals(stdout, "");
});

test({ args: ["-V"] }, async (proc) => {
  const [stdout, stderr, { code }] = await output(proc);
  assertEquals(stderr, "");
  assertEquals(code, 0);
  assert(stdout.startsWith("deployctl "));
});

test({ args: ["--version"] }, async (proc) => {
  const [stdout, stderr, { code }] = await output(proc);
  assertEquals(stderr, "");
  assertEquals(code, 0);
  assert(stdout.startsWith("deployctl "));
});

test({ args: ["-h"] }, async (proc) => {
  const [stdout, stderr, { code }] = await output(proc);
  assertStringIncludes(stdout, "SUBCOMMANDS:");
  assertStringIncludes(stdout, "run ");
  assertStringIncludes(stdout, "types ");
  assertEquals(code, 0);
  assertEquals(stderr, "");
});

test({ args: ["run", "-h"] }, async (proc) => {
  const [stdout, stderr, { code }] = await output(proc);
  assertStringIncludes(stdout, "USAGE:");
  assertStringIncludes(stdout, "deployctl run");
  assertEquals(code, 0);
  assertEquals(stderr, "");
});

test({ args: ["types", "-h"] }, async (proc) => {
  const [stdout, stderr, { code }] = await output(proc);
  assertStringIncludes(stdout, "USAGE:");
  assertStringIncludes(stdout, "deployctl types");
  assertEquals(code, 0);
  assertEquals(stderr, "");
});

test({ args: ["check", "-h"] }, async (proc) => {
  const [stdout, stderr, { code }] = await output(proc);
  assertStringIncludes(stdout, "USAGE:");
  assertStringIncludes(stdout, "deployctl check");
  assertEquals(code, 0);
  assertEquals(stderr, "");
});

test({ args: ["upgrade", "-h"] }, async (proc) => {
  const [stdout, stderr, { code }] = await output(proc);
  assertStringIncludes(stdout, "deployctl upgrade");
  assertStringIncludes(stdout, "USAGE:");
  assertStringIncludes(stdout, "ARGS:");
  assertEquals(code, 0);
  assertEquals(stderr, "");
});
