// Copyright 2024 Deno Land Inc. All rights reserved. MIT license.

import { stringify } from "./error.ts";
import { assert, assertEquals, assertStringIncludes } from "@std/assert";

Deno.test("stringify string", () => {
  assertEquals(stringify("test"), "test");
});

Deno.test("stringify number", () => {
  assertEquals(stringify(42), "42");
});

Deno.test("stringify object", () => {
  assertEquals(stringify({ foo: 42 }), '{"foo":42}');
});

Deno.test("stringify Error (verbose: false)", () => {
  const got = stringify(new Error("boom"));
  assertEquals(got, "Error: boom");
});

Deno.test("stringify Error (verbose: true)", () => {
  const got = stringify(new Error("boom"), { verbose: true });
  assert(got.startsWith("Error: boom\n    at "), `assert failed: ${got}`);
});

Deno.test("stringify Error with cause (cause is also Error) (verbose: false)", () => {
  const e1 = new TypeError("e1");
  const e2 = new SyntaxError("e2", { cause: e1 });
  const got = stringify(e2);
  assertEquals(got, "SyntaxError: e2");
});

Deno.test("stringify Error with cause (cause is also Error) (verbose: true)", () => {
  const e1 = new TypeError("e1");
  const e2 = new SyntaxError("e2", { cause: e1 });
  const got = stringify(e2, { verbose: true });

  assert(
    got.startsWith("SyntaxError: e2\n    at "),
    `assert failed: ${got}`,
  );
  assertStringIncludes(got, "Caused by TypeError: e1\n    at ");
});

Deno.test("stringify Error with cause (cause is number) (verbose: false)", () => {
  const e = new Error("e", { cause: 42 });
  const got = stringify(e);
  assertEquals(got, "Error: e");
});

Deno.test("stringify Error with cause (cause is number) (verbose: true)", () => {
  const e = new Error("e", { cause: 42 });
  const got = stringify(e, { verbose: true });

  assert(
    got.startsWith("Error: e\n    at "),
    `assert failed: ${got}`,
  );

  assert(
    got.endsWith("Caused by 42"),
    `assert failed: ${got}`,
  );
});
