import { parseArgsForLogSubcommand, parseTimerange } from "./logs.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.194.0/testing/asserts.ts";
import { parseArgs } from "../args.ts";

type Ago = {
  unit: "day" | "hour" | "minute" | "second";
  amount: number;
};

function assertNever(_x: never): never {
  throw new Error("Unreachable");
}

// Returns true if the given date is X days, hours, minutes, or seconds ago.
function isDateAgo(date: Date, ago: Ago, marginSeconds = 60): boolean {
  const now = Date.now();
  let d: number;
  switch (ago.unit) {
    case "day":
      d = now - ago.amount * 24 * 60 * 60 * 1000;
      break;
    case "hour":
      d = now - ago.amount * 60 * 60 * 1000;
      break;
    case "minute":
      d = now - ago.amount * 60 * 1000;
      break;
    case "second":
      d = now - ago.amount * 1000;
      break;
    default:
      assertNever(ago.unit);
  }

  return Math.abs(date.getTime() - d) < marginSeconds * 1000;
}

Deno.test("parseTimerange", async (t) => {
  await t.step("1h,now", () => {
    const got = parseTimerange("1h,now");
    assert(isDateAgo(got!.start, { unit: "hour", amount: 1 }));
    assert(isDateAgo(got!.end, { unit: "second", amount: 0 }));
  });

  await t.step("1d,30m", () => {
    const got = parseTimerange("1d,30m");
    assert(isDateAgo(got!.start, { unit: "day", amount: 1 }));
    assert(isDateAgo(got!.end, { unit: "minute", amount: 30 }));
  });

  await t.step("24h,30s", () => {
    const got = parseTimerange("24h,30s");
    assert(isDateAgo(got!.start, { unit: "hour", amount: 24 }));
    assert(isDateAgo(got!.end, { unit: "second", amount: 30 }));
  });

  await t.step("no comma", () => {
    const got = parseTimerange("1h30m");
    assert(got === null);
  });

  await t.step("invalid unit", () => {
    const got = parseTimerange("24x,72y");
    assert(got === null);
  });

  await t.step("no number", () => {
    const got = parseTimerange("m,s");
    assert(got === null);
  });
});

Deno.test("parseArgsForLogSubcommand", async (t) => {
  const parseHelper = (args: string[]) =>
    parseArgsForLogSubcommand(parseArgs(["logs", ...args]));

  await t.step("specify help", () => {
    const got = parseHelper(["--help"]);
    assertEquals(got, {
      help: true,
      prod: false,
      token: null,
      deployment: null,
      project: null,
      timerange: null,
      grep: null,
      levels: null,
      regions: null,
      limit: 100,
    });
  });

  await t.step("specify timerange", () => {
    const { timerange, ...rest } = parseHelper(["--timerange=3h,42m"]);
    assert(isDateAgo(timerange!.start, { unit: "hour", amount: 3 }));
    assert(isDateAgo(timerange!.end, { unit: "minute", amount: 42 }));
    assertEquals(rest, {
      help: false,
      prod: false,
      token: null,
      deployment: null,
      project: null,
      grep: null,
      levels: null,
      regions: null,
      limit: 100,
    });
  });

  await t.step("specify timerange (empty string)", () => {
    const { timerange, ...rest } = parseHelper(["--timerange"]);
    assert(isDateAgo(timerange!.start, { unit: "hour", amount: 1 }));
    assert(isDateAgo(timerange!.end, { unit: "second", amount: 0 }));
    assertEquals(rest, {
      help: false,
      prod: false,
      token: null,
      deployment: null,
      project: null,
      grep: null,
      levels: null,
      regions: null,
      limit: 100,
    });
  });

  await t.step("complex args", () => {
    const { timerange, ...rest } = parseHelper([
      "--prod",
      "--token=abc",
      "--project=helloworld",
      "--timerange=2d,30s",
      "--grep=こんにちは",
      "--levels=info,error",
      "--regions=region1,region2",
      "--limit=42",
    ]);
    assert(isDateAgo(timerange!.start, { unit: "day", amount: 2 }));
    assert(isDateAgo(timerange!.end, { unit: "second", amount: 30 }));
    assertEquals(rest, {
      help: false,
      prod: true,
      token: "abc",
      deployment: null,
      project: "helloworld",
      grep: "こんにちは",
      levels: ["info", "error"],
      regions: ["region1", "region2"],
      limit: 42,
    });
  });
});
