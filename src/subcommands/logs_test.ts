import { parseArgsForLogSubcommand } from "./logs.ts";
import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.194.0/testing/asserts.ts";
import { parseArgs } from "../args.ts";

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
      since: null,
      until: null,
      grep: [],
      levels: null,
      regions: null,
      limit: 100,
    });
  });

  await t.step("specify since and until", () => {
    const since = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
    const until = new Date(Date.now() - 42 * 60 * 1000); // 42 minutes ago
    const got = parseHelper([
      `--since=${since.toISOString()}`,
      `--until=${until.toISOString()}`,
    ]);
    assertEquals(got, {
      help: false,
      prod: false,
      token: null,
      deployment: null,
      project: null,
      since,
      until,
      grep: [],
      levels: null,
      regions: null,
      limit: 100,
    });
  });

  await t.step("specify invalid format in since", () => {
    assertThrows(() => parseHelper(["--since=INVALID"]), Error, "exit code: 1");
  });

  await t.step("specify invalid format in until", () => {
    assertThrows(() => parseHelper(["--until=INVALID"]), Error, "exit code: 1");
  });

  await t.step("complex args", () => {
    const until = new Date(Date.now() - 42 * 1000); // 42 seconds ago
    const got = parseHelper([
      "--prod",
      "--token=abc",
      "--project=helloworld",
      `--until=${until.toISOString()}`,
      "--grep=こんにちは",
      "--levels=info,error",
      "--regions=region1,region2",
      "--limit=42",
      "--grep=hola",
    ]);
    assertEquals(got, {
      help: false,
      prod: true,
      token: "abc",
      deployment: null,
      project: "helloworld",
      since: null,
      until,
      grep: ["こんにちは", "hola"],
      levels: ["info", "error"],
      regions: ["region1", "region2"],
      limit: 42,
    });
  });
});
