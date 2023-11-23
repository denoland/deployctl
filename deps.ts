// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

import { colors } from "https://deno.land/x/wait@0.1.12/deps.ts";

// std
export {
  fromFileUrl,
  join,
  normalize,
  resolve,
  toFileUrl,
} from "https://deno.land/std@0.170.0/path/mod.ts";
export {
  bold,
  green,
  red,
  yellow,
  bgBrightGreen,
} from "https://deno.land/std@0.170.0/fmt/colors.ts";
export { parse } from "https://deno.land/std@0.195.0/flags/mod.ts";
export { TextLineStream } from "https://deno.land/std@0.170.0/streams/text_line_stream.ts";

// x/semver
export {
  gte as semverGreaterThanOrEquals,
  valid as semverValid,
} from "https://deno.land/std@0.170.0/semver/mod.ts";

// x/wait
export { Spinner, wait } from "https://deno.land/x/wait@0.1.12/mod.ts";

// x/tui
export { Tui, Signal, Computed } from "https://deno.land/x/tui@2.1.6/mod.ts";
export { Box, Label, Text, Frame } from "https://deno.land/x/tui@2.1.6/src/components/mod.ts";
