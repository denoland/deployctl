// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

import { parse } from "../deps.ts";

export function parseArgs(args: string[]) {
  const parsed = parse(args, {
    alias: {
      "help": "h",
      "version": "V",
      "project": "p",
    },
    boolean: [
      "help",
      "prod",
      "static",
      "version",
      "dry-run",
      "save-config",
      "force",
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
      "org",
      "color",
    ],
    collect: ["grep", "include", "exclude"],
    default: {
      static: true,
      limit: "100",
      config: Deno.env.get("DEPLOYCTL_CONFIG_FILE"),
      token: Deno.env.get("DENO_DEPLOY_TOKEN"),
      org: Deno.env.get("DEPLOYCTL_ORGANIZATION"),
      color: "auto",
    },
  });
  return parsed;
}

export type Args = ReturnType<typeof parseArgs>;
