// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

import { error } from "../error.ts";
import { downloadTypes } from "../utils/types.ts";

const help = `deployctl types
Print runtime TypeScript declarations.
deployctl types > deployctl.d.ts

The declaration file could be saved and used for typing information.

USAGE:
    deployctl types [OPTIONS]

OPTIONS:
    -h, --help      Prints help information
`;

export interface Args {
  help: boolean;
}

// deno-lint-ignore no-explicit-any
export default async function (rawArgs: Record<string, any>): Promise<void> {
  const args: Args = {
    help: !!rawArgs.help,
  };
  if (args.help) {
    console.error(help);
    Deno.exit(1);
  }
  if (rawArgs._.length > 0) {
    console.error(help);
    error("Too many positional arguments given.");
  }

  const types = await downloadTypes();
  console.log(types);
}
