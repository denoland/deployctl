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
} from "https://deno.land/std@0.170.0/path/mod.ts";
export {
  bold,
  cyan,
  green,
  magenta,
  red,
  setColorEnabled,
  yellow,
} from "https://deno.land/std@0.170.0/fmt/colors.ts";
export { parse } from "https://deno.land/std@0.195.0/flags/mod.ts";
export { TextLineStream } from "https://deno.land/std@0.170.0/streams/text_line_stream.ts";
export * as JSONC from "https://deno.land/std@0.170.0/encoding/jsonc.ts";
export { encodeHex } from "https://deno.land/std@0.212.0/encoding/hex.ts";
export { delay } from "https://deno.land/std@0.212.0/async/mod.ts";

// x/semver
export {
  gte as semverGreaterThanOrEquals,
  valid as semverValid,
} from "https://deno.land/std@0.170.0/semver/mod.ts";

// x/wait
export {
  Spinner,
  type SpinnerOptions,
  wait,
} from "https://raw.githubusercontent.com/denosaurs/wait/9471d5cb37f31065fd867c85a8b1511091a24ee7/mod.ts";

export * as tty from "https://deno.land/x/tty@0.1.4/mod.ts";
