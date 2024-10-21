// Copyright 2024 Deno Land Inc. All rights reserved. MIT license.

import { bold, red } from "@std/fmt/colors";

export function error(err: unknown): never {
  const message = stringify(err);
  console.error(red(`${bold("error")}: ${message}`));
  Deno.exit(1);
}

export type StringifyOptions = {
  verbose: boolean;
};

const DEFAULT_STRINGIFY_OPTIONS: StringifyOptions = {
  verbose: false,
};

export function stringify(
  err: unknown,
  options?: Partial<StringifyOptions>,
): string {
  const opts = options === undefined
    ? DEFAULT_STRINGIFY_OPTIONS
    : { ...DEFAULT_STRINGIFY_OPTIONS, ...options };

  if (err instanceof Error) {
    if (opts.verbose) {
      return stringifyErrorLong(err);
    } else {
      return stringifyErrorShort(err);
    }
  }

  if (typeof err === "string") {
    return err;
  }

  return JSON.stringify(err);
}

function stringifyErrorShort(err: Error): string {
  return `${err.name}: ${err.message}`;
}

function stringifyErrorLong(err: Error): string {
  const cause = err.cause === undefined
    ? ""
    : `\nCaused by ${stringify(err.cause, { verbose: true })}`;

  if (!err.stack) {
    return `${err.name}: ${err.message}${cause}`;
  }

  return `${err.stack}${cause}`;
}
