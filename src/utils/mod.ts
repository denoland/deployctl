import {
  greaterOrEqual as semverGreaterThanOrEquals,
  parse as semverParse,
} from "@std/semver";

export { parseEntrypoint } from "./entrypoint.ts";
export { API, APIError } from "./api.ts";
export { convertPatternToRegExp, walk } from "./walk.ts";
export { fromFileUrl, resolve } from "@std/path";

// deno-lint-ignore no-explicit-any
export function isTerminal(stream: any) {
  if (
    semverGreaterThanOrEquals(
      semverParse(Deno.version.deno),
      semverParse("1.40.0"),
    )
  ) {
    return stream.isTerminal();
  } else {
    // deno-lint-ignore no-deprecated-deno-api
    return Deno.isatty(stream.rid);
  }
}
