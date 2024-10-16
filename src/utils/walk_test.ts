import { assertEquals } from "@std/assert/assert_equals";
import { convertPatternToRegExp } from "./walk.ts";

Deno.test({
  name: "convertPatternToRegExp",
  ignore: Deno.build.os === "windows",
  fn: () => {
    assertEquals(convertPatternToRegExp("foo"), new RegExp("^foo"));
    assertEquals(convertPatternToRegExp(".././foo"), new RegExp("^../foo"));
    assertEquals(convertPatternToRegExp("*.ts"), new RegExp("^[^/]*\\.ts/*"));
  },
});
