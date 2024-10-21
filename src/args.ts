// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

import { parse } from "@std/flags";

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
      "last",
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
      "page",
      "config",
      "entrypoint",
      "org",
      "format",
      "color",
      "region",
      "id",
      "prev",
      "next",
      "method",
      "body",
      "db",
      "env",
      "env-file",
    ],
    collect: [
      "grep",
      "include",
      "exclude",
      "region",
      "prev",
      "next",
      "env",
      "env-file",
    ],
    default: {
      static: true,
      config: Deno.env.get("DEPLOYCTL_CONFIG_FILE"),
      token: Deno.env.get("DENO_DEPLOY_TOKEN"),
      org: Deno.env.get("DEPLOYCTL_ORGANIZATION"),
      color: "auto",
    },
  });
  return parsed;
}

export type Args = ReturnType<typeof parseArgs>;
