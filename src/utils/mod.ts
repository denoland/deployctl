import { error } from "../error.ts";

export { parseEntrypoint } from "./entrypoint.ts";
export { API, APIError } from "./api.ts";
export { convertPatternToRegExp, walk } from "./walk.ts";
export { fromFileUrl, resolve } from "@std/path";

/**
 * Determines if the stream is a tty or not in a Deno-version-independent way.
 *
 * @param stream
 * @returns boolean `true` if the stream is a tty
 */
export function isTerminal(stream: unknown) {
  if (hasIsTerminal(stream)) {
    // Note that `isTerminal` method is available in v1.40.0+
    // For older versions we fallback to `Deno.isatty`
    return stream.isTerminal();
  } else if (hasRid(stream)) {
    // @ts-ignore: `Deno.isatty` is no longer available after Deno 2.0
    // deno-lint-ignore no-deprecated-deno-api
    return Deno.isatty(stream.rid);
  }

  error(new Error("Unable to determine if the stream is a tty"));
}

interface MaybeTerminal {
  isTerminal(): boolean;
}

function hasIsTerminal(stream: unknown): stream is MaybeTerminal {
  return typeof stream === "object" && stream !== null &&
    "isTerminal" in stream && typeof stream.isTerminal === "function";
}

interface ResourceId {
  rid: number;
}

function hasRid(stream: unknown): stream is ResourceId {
  return typeof stream === "object" && stream !== null && "rid" in stream &&
    typeof stream.rid === "number";
}
