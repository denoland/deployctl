import { assertEquals } from "../../tests/deps.ts";
import { convertPatternToRegExp } from "./walk.ts";

Deno.test("convertPatternToRegExp", () => {
  assertEquals(convertPatternToRegExp("foo"), new RegExp("^foo"));
  assertEquals(convertPatternToRegExp(".././foo"), new RegExp("^../foo"));
  assertEquals(convertPatternToRegExp("*.ts"), new RegExp("^[^/]*\\.ts/*"));
});
