// Copyright 2024 Deno Land Inc. All rights reserved. MIT license.

import { bold, red } from "@std/fmt/colors";

export function error(err: unknown): never {
  const message = stringify(err);
  console.error(red(`${bold("error")}: ${message}`));
  Deno.exit(1);
}

export function stringify(err: unknown): string {
  if (err instanceof Error) {
    return stringifyError(err);
  }

  if (typeof err === "string") {
    return err;
  }

  return JSON.stringify(err, null, 2);
}

function stringifyError(err: Error): string {
  const cause = err.cause === undefined
    ? ""
    : `\nCaused by ${stringify(err.cause)}`;

  if (!err.stack) {
    return `${err.name}: ${err.message}${cause}`;
  }

  return `${err.stack}${cause}`;
}
