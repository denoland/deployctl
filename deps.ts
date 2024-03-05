// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

// std
export {
  basename,
  dirname,
  extname,
  fromFileUrl,
  globToRegExp,
  isGlob,
  join,
  normalize,
  relative,
  resolve,
  toFileUrl,
} from "jsr:@std/path@0.217";
export {
  bold,
  cyan,
  green,
  magenta,
  red,
  setColorEnabled,
  stripAnsiCode,
  yellow,
} from "jsr:@std/fmt@0.217/colors";
export { parse } from "jsr:@std/flags@0.217";
export { TextLineStream } from "jsr:@std/streams@0.217/text_line_stream";
export * as JSONC from "jsr:@std/jsonc@0.217";
export { encodeHex } from "jsr:@std/encoding@0.217/hex";
export { delay } from "jsr:@std/async@0.217";
export * as dotenv from "jsr:@std/dotenv@0.217";

// x/semver
export {
  canParse as semverValid,
  greaterOrEqual as semverGreaterThanOrEquals,
  parse as semverParse,
} from "jsr:@std/semver@0.217";

// x/wait
export {
  Spinner,
  type SpinnerOptions,
  wait,
} from "https://raw.githubusercontent.com/denosaurs/wait/453df8babdd72c59d865c5a616c5b04ee1154b9f/mod.ts";

export * as tty from "https://deno.land/x/tty@0.1.4/mod.ts";
