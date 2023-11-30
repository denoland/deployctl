import configFile from "../../src/config_file.ts";
import { assert, assertEquals } from "../deps.ts";

Deno.test("ConfigFile.diff returns array with additions and removals", async () => {
  const config = await configFile.read(new URL(import.meta.resolve("./config.json")).pathname);
  assert(!!config);

  let changes = config.diff({});
  assertEquals(changes, []);

  changes = config.diff({ project: "foo" });
  assertEquals(changes, [{ key: "project", addition: "foo", removal: undefined }]);

  // Using file URLs to avoid dealing with path normalization 
  config.override({ project: "foo", entrypoint: "file://main.ts" });

  changes = config.diff({ project: "bar", entrypoint: "file://src/main.ts" });
  assertEquals(changes, [
    { key: "project", removal: "foo", addition: "bar" },
    { key: "entrypoint", removal: "file://main.ts", addition: "file://src/main.ts" },
  ]);
});
