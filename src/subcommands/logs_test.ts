import { parseArgsForLogSubcommand } from "./logs.ts";
import { assertEquals, assertThrows } from "jsr:@std/assert@0.217";
import { parseArgs } from "../args.ts";

Deno.test("parseArgsForLogSubcommand", async (t) => {
  const parseHelper = (args: string[]) => {
    try {
      // NOTE: We omit `logs` subcommand from the arguments passed to `parseArgs()`
      // in order to match the actual behavior; the first positional argument is
      // removed using `args._.shift()` in `deployctl.ts`.
      return parseArgsForLogSubcommand(parseArgs(args));
    } catch (e) {
      // Since Deno v1.44.0, when `Deno.exitCode` was introduced, test cases
      // with non-zero exit code has been treated as failure, causing some tests
      // to fail unexpectedly (not sure if this behavior change is intended).
      // To avoid this, we set `Deno.exitCode` to 0 before giving control back
      // to each test case.
      // https://github.com/denoland/deno/pull/23609
      // deno-lint-ignore no-explicit-any
      if ((Deno as any).exitCode !== undefined) {
        // deno-lint-ignore no-explicit-any
        (Deno as any).exitCode = 0;
      }
      throw e;
    }
  };

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

  await t.step("specify project name in a positional argument", () => {
    const got = parseHelper([
      "--prod",
      "--token=abc",
      "project_name",
    ]);
    assertEquals(got, {
      help: false,
      prod: true,
      token: "abc",
      deployment: null,
      project: "project_name",
      since: null,
      until: null,
      grep: [],
      levels: null,
      regions: null,
      limit: 100,
    });
  });
});
