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

  /** Reflects the `NO_COLOR` environment variable. This is always set to `true`
   * on Deno Deploy, as the logs page supports ANSI colors.
   *
   * See: https://no-color.org/ */
  export const noColor: boolean;

  export interface InspectOptions {
    /** Stylize output with ANSI colors. Defaults to false. */
    colors?: boolean;
    /** Try to fit more than one entry of a collection on the same line.
     * Defaults to true. */
    compact?: boolean;
    /** Traversal depth for nested objects. Defaults to 4. */
    depth?: number;
    /** The maximum number of iterable entries to print. Defaults to 100. */
    iterableLimit?: number;
    /** Show a Proxy's target and handler. Defaults to false. */
    showProxy?: boolean;
    /** Sort Object, Set and Map entries by key. Defaults to false. */
    sorted?: boolean;
    /** Add a trailing comma for multiline collections. Defaults to false. */
    trailingComma?: boolean;
    /*** Evaluate the result of calling getters. Defaults to false. */
    getters?: boolean;
    /** Show an object's non-enumerable properties. Defaults to false. */
    showHidden?: boolean;
  }

  /** Converts the input into a string that has the same format as printed by
   * `console.log()`.
   *
   * ```ts
   * const obj = {};
   * obj.propA = 10;
   * obj.propB = "hello";
   * const objAsString = Deno.inspect(obj); // { propA: 10, propB: "hello" }
   * console.log(obj);  // prints same value as objAsString, e.g. { propA: 10, propB: "hello" }
   * ```
   *
   * You can also register custom inspect functions, via the `customInspect` Deno
   * symbol on objects, to control and customize the output.
   *
   * ```ts
   * class A {
   *   x = 10;
   *   y = "hello";
   *   [Deno.customInspect](): string {
   *     return "x=" + this.x + ", y=" + this.y;
   *   }
   * }
   * ```
   *
   *      const inStringFormat = Deno.inspect(new A()); // "x=10, y=hello"
   *      console.log(inStringFormat);  // prints "x=10, y=hello"
   *
   * Finally, you can also specify the depth to which it will format.
   *
   *      Deno.inspect({a: {b: {c: {d: 'hello'}}}}, {depth: 2}); // { a: { b: [Object] } }
   *
   */
  export function inspect(value: unknown, options?: InspectOptions): string;
}
