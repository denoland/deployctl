// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

import { parse } from "../deps.ts";

export function parseArgs(args: string[]) {
  const parsed = parse(args, {
    alias: {
      "help": "h",
      "version": "V",
    },
    boolean: [
      "help",
      "prod",
      "static",
      "version",
      "dry-run",
      "save-config",
    ],
    string: [
      "project",
      "token",
      "include",
      "exclude",
      "import-map",
      "deployment",
      "since",
      "until",
      "grep",
      "levels",
      "regions",
      "limit",
      "config",
      "entrypoint",
    ],
    collect: ["grep", "include", "exclude"],
    default: {
      static: true,
      limit: "100",
      config: Deno.env.get("DEPLOYCTL_CONFIG_FILE"),
      token: Deno.env.get("DENO_DEPLOY_TOKEN"),
    },
  });
  return parsed;
}

export type Args = ReturnType<typeof parseArgs>;
