// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

const DEPLOY_COMPILER_OPTS: unknown = {
  lib: ["esnext"],
  jsxFactory: "h",
  jsxFragmentFactory: "Fragment",
};

let tsconfigFile: string | null = null;

/**
 * Lazially create a tsconfig file on disk for use with `deployctl run`.
 */
export async function tsconfig(): Promise<string> {
  if (tsconfigFile === null) {
    const tsconfig = await Deno.makeTempFile({
      prefix: "tsconfig-",
      suffix: ".json",
    });
    await Deno.writeTextFile(
      tsconfig,
      JSON.stringify({
        compilerOptions: DEPLOY_COMPILER_OPTS,
      }),
    );
    tsconfigFile = tsconfig;
  }
  return tsconfigFile;
}
