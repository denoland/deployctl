// Copyright 2024 Deno Land Inc. All rights reserved. MIT license.

import { bundle } from "@deno/emit";
import { resolve } from "@std/path/resolve";

const entrypoint = Deno.args[0];
const resolvedPath = resolve(Deno.cwd(), entrypoint);
const result = await bundle(resolvedPath, {
  importMap: "deno.json",
});
console.log(`// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using \`deno task build-action\` and it's not recommended to edit it manually
`);
console.log(result.code);
