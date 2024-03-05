import { parseArgs } from "../../src/args.ts";
import { envVarsFromArgs } from "../../src/utils/env_vars.ts";
import { assert, assertEquals } from "../deps.ts";

Deno.test("envVarsFromArgs gets env variables from multiple --env options", async () => {
  const args = parseArgs(["--env=FOO=foo", "--env=BAR=bar"]);
  const envVars = await envVarsFromArgs(args);
  assert(envVars !== null);
  assertEquals(Object.entries(envVars).length, 2);
  assertEquals(envVars.FOO, "foo");
  assertEquals(envVars.BAR, "bar");
});

Deno.test("envVarsFromArgs last --env option takes precedence when overlapping", async () => {
  const args = parseArgs(["--env=FOO=foo", "--env=BAR=bar", "--env=FOO=last"]);
  const envVars = await envVarsFromArgs(args);
  assertEquals(envVars?.FOO, "last");
});

Deno.test("envVarsFromArgs gets env variables from multiple --env-file options", async () => {
  const args = parseArgs([
    `--env-file=${import.meta.dirname}/.env`,
    `--env-file=${import.meta.dirname}/.another-env`,
  ]);
  const envVars = await envVarsFromArgs(args);
  assert(envVars !== null);
  assertEquals(Object.entries(envVars).length, 2);
  assertEquals(envVars.FOO, "foo");
  assertEquals(envVars.BAR, "bar");
});

Deno.test("envVarsFromArgs last --env-file option takes precedence when overlapping", async () => {
  const args = parseArgs([
    `--env-file=${import.meta.dirname}/.env`,
    `--env-file=${import.meta.dirname}/.another-env`,
    `--env-file=${import.meta.dirname}/.overlapping-env`,
  ]);
  const envVars = await envVarsFromArgs(args);
  assertEquals(envVars?.FOO, "last");
});

Deno.test("envVarsFromArgs --env always takes precedence over --env-file", async () => {
  const args = parseArgs([
    "--env=FOO=winner",
    `--env-file=${import.meta.dirname}/.env`,
    `--env-file=${import.meta.dirname}/.another-env`,
    "--env=BAR=winner",
  ]);
  const envVars = await envVarsFromArgs(args);
  assertEquals(envVars?.FOO, "winner");
  assertEquals(envVars?.BAR, "winner");
});
