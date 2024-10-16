// Copyright 2024 Deno Land Inc. All rights reserved. MIT license.

import { stringify } from "./error.ts";
import { assert, assertEquals } from "@std/assert";

Deno.test("stringify string", () => {
    assertEquals(stringify("test"), "test");
});

Deno.test("stringify number", () => {
    assertEquals(stringify(42), "42");
});

Deno.test("stringify object", () => {
    assertEquals(stringify({ foo: 42 }), `{\n  "foo": 42\n}`);
});

Deno.test("stringify Error", () => {
    const got = stringify(new Error("boom"));
    assert(got.startsWith("Error: boom\n"), `assert failed: ${got}`);
});

Deno.test("stringify Error with cause (cause is also Error)", () => {
    const e1 = new TypeError("e1");
    const e2 = new SyntaxError("e2", { cause: e1 });
    const got = stringify(e2);

    assert(
        got.startsWith("SyntaxError: e2\n"),
        `assert failed: ${got}`,
    );
    assert(
        got.includes("Caused by TypeError: e1\n"),
        `assert failed: ${got}`,
    );
});

Deno.test("stringify Error with cause (cause is number)", () => {
    const e = new Error("e", { cause: 42 });
    const got = stringify(e);

    assert(
        got.startsWith("Error: e\n"),
        `assert failed: ${got}`,
    );

    assert(
        got.endsWith("Caused by 42"),
        `assert failed: ${got}`,
    );
});
