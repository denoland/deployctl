import { yellow } from "@std/fmt/colors";
import { assertEquals } from "@std/assert/assert_equals";
import { renderTimeDelta } from "./time.ts";

Deno.test("renderTimeDelta returns time in milliseconds if below 1 second", () => {
  const result1 = renderTimeDelta(1);
  assertEquals(result1, yellow("1 milli"));
  const result2 = renderTimeDelta(999);
  assertEquals(result2, yellow("999 millis"));
});
Deno.test("renderTimeDelta returns time only in seconds if above 1 second and below 1 minute", () => {
  const result1 = renderTimeDelta(1001);
  assertEquals(result1, yellow("1 second"));
  const result2 = renderTimeDelta(59000);
  assertEquals(result2, yellow("59 seconds"));
});

Deno.test("renderTimeDelta returns time in minutes and seconds if above 1 minute and below 1 hour", () => {
  const result1 = renderTimeDelta(60000);
  assertEquals(result1, `${yellow("1 minute")}`);
  const result2 = renderTimeDelta(1 * 60 * 60 * 1000 - 1);
  assertEquals(result2, `${yellow("59 minutes")}, 59 seconds`);
});

Deno.test("renderTimeDelta returns time in hours, minutes and seconds if above 1 hour and below 1 day", () => {
  const result1 = renderTimeDelta(1 * 60 * 60 * 1000);
  assertEquals(result1, `${yellow("1 hour")}`);
  const result2 = renderTimeDelta(1 * 24 * 60 * 60 * 1000 - 1);
  assertEquals(result2, `${yellow("23 hours")}, 59 minutes, 59 seconds`);
});

Deno.test("renderTimeDelta returns time in days, hours, minutes and seconds if above 1 day", () => {
  const result1 = renderTimeDelta(1 * 24 * 60 * 60 * 1000);
  assertEquals(result1, `${yellow("1 day")}`);
  const result2 = renderTimeDelta(1_000_000 * 24 * 60 * 60 * 1000 - 1, "en-US");
  assertEquals(
    result2,
    `${yellow("999,999 days")}, 23 hours, 59 minutes, 59 seconds`,
  );
});
