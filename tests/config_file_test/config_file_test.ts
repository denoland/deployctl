import { fromFileUrl } from "../../deps.ts";
import configFile from "../../src/config_file.ts";
import { assert, assertEquals } from "../deps.ts";

Deno.test("ConfigFile.diff returns array with additions and removals", async () => {
  const config = await configFile.read(
    fromFileUrl(new URL(import.meta.resolve("./config.json"))),
  );
  assert(!!config);

  let changes = config.diff({});
  assertEquals(changes, []);

  changes = config.diff({ project: "foo" });
  assertEquals(changes, [{
    key: "project",
    addition: "foo",
    removal: undefined,
  }]);

  // Using file URLs to avoid dealing with path normalization
  config.override({ project: "foo", entrypoint: "file://main.ts" });

  changes = config.diff({ project: "bar", entrypoint: "file://src/main.ts" });
  assertEquals(changes, [
    { key: "project", removal: "foo", addition: "bar" },
    {
      key: "entrypoint",
      removal: "file://main.ts",
      addition: "file://src/main.ts",
    },
  ]);
});

Deno.test("ConfigFile.diff reports inculde and exclude changes when one of the entries changed", async () => {
  const config = await configFile.read(
    fromFileUrl(new URL(import.meta.resolve("./config.json"))),
  );
  assert(!!config);

  config.override({ include: ["foo", "bar"], exclude: ["fuzz", "bazz"] });

  const changes = config.diff({
    include: ["fuzz", "bazz"],
    exclude: ["foo", "bar"],
  });
  assertEquals(changes, [
    { key: "exclude", addition: ["foo", "bar"], removal: ["fuzz", "bazz"] },
    { key: "include", removal: ["foo", "bar"], addition: ["fuzz", "bazz"] },
  ]);
});

Deno.test("ConfigFile.useAsDefaultFor can handle empty array defaults", async () => {
  const config = await configFile.read(
    fromFileUrl(new URL(import.meta.resolve("./config_with_include.json"))),
  );
  assert(!!config);
  assertEquals(config.args().include?.[0], "**");

  const args = {
    include: [],
  };
  config.useAsDefaultFor(args);

  assertEquals(args.include[0], "**");
});
