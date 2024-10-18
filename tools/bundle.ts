// Copyright 2024 Deno Land Inc. All rights reserved. MIT license.

import { bundle, type ImportMap } from "@deno/emit";
import { resolve } from "@std/path/resolve";
import { parse as parseJsonc } from "@std/jsonc";

const entrypoint = Deno.args[0];
const resolvedPath = resolve(Deno.cwd(), entrypoint);

const configPath = resolve(Deno.cwd(), "deno.jsonc");
const config = await Deno.readTextFile(configPath);
const result = await bundle(resolvedPath, {
  importMap: parseJsonc(config) as ImportMap,
});
console.log(`// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using \`deno task build-action\` and it's not recommended to edit it manually
`);
console.log(result.code);
