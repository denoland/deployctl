// Copyright 2018-2021 Deno Land Inc. All rights reserved. MIT license.

// deno-lint-ignore-file

/// <reference no-default-lib="true" />
/// <reference lib="esnext" />

/** Deno provides extra properties on `import.meta`.  These are included here
 * to ensure that these are still available when using the Deno namespace in
 * conjunction with other type libs, like `dom`. */
 declare interface ImportMeta {
  /** A string representation of the fully qualified module URL. */
  url: string;

  /** A flag that indicates if the current module is the main module that was
   * called when starting the program under Deno.
   *
   * ```ts
   * if (import.meta.main) {
   *   // this was loaded as the main module, maybe do some bootstrapping
   * }
   * ```
   */
  main: boolean;
}

declare namespace Deno {
  export const env: {
    /** Retrieve the value of an environment variable. Returns undefined if that
     * key doesn't exist.
     *
     * ```ts
     * console.log(Deno.env.get("HOME"));  // e.g. outputs "/home/alice"
     * console.log(Deno.env.get("MADE_UP_VAR"));  // outputs "Undefined"
     * ```
     */
    get(key: string): string | undefined;

    /** Set the value of an environment variable.
     *
     * ```ts
     * Deno.env.set("SOME_VAR", "Value"));
     * Deno.env.get("SOME_VAR");  // outputs "Value"
     * ```
     */
    set(key: string, value: string): void;

    /** Delete the value of an environment variable.
     *
     * ```ts
     * Deno.env.set("SOME_VAR", "Value"));
     * Deno.env.delete("SOME_VAR");  // outputs "Undefined"
     * ```
     */
    delete(key: string): void;

    /** Returns a snapshot of the environment variables at invocation.
     *
     * ```ts
     * Deno.env.set("TEST_VAR", "A");
     * const myEnv = Deno.env.toObject();
     * console.log(myEnv.SHELL);
     * Deno.env.set("TEST_VAR", "B");
     * console.log(myEnv.TEST_VAR);  // outputs "A"
     * ```
     */
    toObject(): { [index: string]: string };
  };

  /** Build related information. */
  export const build: {
    /** The LLVM target triple */
    target: string;
    /** Instruction set architecture */
    arch: "x86_64";
    /** Operating system */
    os: "darwin" | "linux" | "windows";
    /** Computer vendor */
    vendor: string;
    /** Optional environment */
    env?: string;
  };
}
