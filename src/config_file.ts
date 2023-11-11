// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

import { dirname } from "https://deno.land/std@0.170.0/path/win32.ts";
import { join } from "../deps.ts";
import { error } from "./error.ts";
import { wait } from "./utils/spinner.ts";

const DEFAULT_FILENAME = "deno.json";

/** Arguments persisted in the deno.json config file */
interface ConfigArgs {
  project?: string;
}

class ConfigFile {
  #path: string;
  #content: { deploy?: ConfigArgs };

  constructor(path: string, content: { deploy?: ConfigArgs }) {
    this.#path = path;
    this.#content = content;
  }

  /**
   * Create a new `ConfigFile` using an object that _at least_ contains the `ConfigArgs`.
   *
   * Ignores any property in `args` not meant to be persisted.
   */
  static create(path: string, args: ConfigArgs) {
    const config = new ConfigFile(path, { deploy: {} });
    // Use override to clean-up args
    config.override(args);
    return config;
  }

  /**
   * Override the `ConfigArgs` of this ConfigFile.
   *
   * Ignores any property in `args` not meant to be persisted.
   */
  override(args: ConfigArgs) {
    if (this.#content.deploy === undefined) {
      this.#content.deploy = {};
    }
    // Update only specific properties as args might contain properties we don't want in the config file
    this.#content.deploy.project = args.project;
  }

  /**
   * For every arg in `ConfigArgs`, if the `args` argument object does not contain
   * the arg, fill it with the value in this `ConfigFile`, if any.
   */
  useAsDefaultFor(args: ConfigArgs) {
    if (args.project === undefined && this.#content.deploy?.project) {
      args.project = this.#content.deploy?.project;
    }
  }

  /** Check if the `ConfigArgs` in this `ConfigFile` match `args`
   *
   * Ignores any property in `args` not meant to be persisted.
   */
  eq(args: ConfigArgs) {
    const thisContent = (this.#content.deploy ?? {}) as {
      [x: string]: unknown;
    };
    const otherConfig = ConfigFile.create(this.#path, args);
    for (const [key, otherValue] of Object.entries(otherConfig.args())) {
      if (thisContent[key] !== otherValue) {
        return false;
      }
    }
    return true;
  }

  /** Return whether the `ConfigFile` has the `deploy` namespace */
  hasDeployConfig() {
    return this.#content.deploy !== undefined;
  }

  stringify() {
    return JSON.stringify(this.#content, null, 2);
  }

  path() {
    return this.#path;
  }

  args() {
    return (this.#content.deploy ?? {});
  }
}

export default {
  /** Read a `ConfigFile` from disk */
  async read(
    path: string | Iterable<string>,
  ): Promise<ConfigFile | null> {
    const paths = typeof path === "string" ? [path] : path;
    for (const filepath of paths) {
      let content;
      try {
        content = await Deno.readTextFile(filepath);
      } catch {
        // File not found, try next
        continue;
      }
      try {
        const parsedContent = JSON.parse(content);
        return new ConfigFile(filepath, parsedContent);
      } catch (e) {
        error(e);
      }
    }
    // config file not found
    return null;
  },

  /**
   * Write `ConfigArgs` to the config file.
   *
   * @param path {string | null} path where to write the config file. If the file already exists and
   *                             `override` is `true`, its content will be merged with the `args`
   *                             argument. If null, will default to `DEFAULT_FILENAME`.
   * @param args {ConfigArgs} args to be upserted into the config file.
   * @param overwrite {boolean} control whether an existing config file should be overwritten.
   */
  maybeWrite: async function (
    path: string | null,
    args: ConfigArgs,
    overwrite: boolean,
  ): Promise<void> {
    const pathOrDefault = path ?? DEFAULT_FILENAME;
    const existingConfig = await this.read(pathOrDefault);
    let config;
    if (existingConfig && existingConfig.hasDeployConfig() && !overwrite) {
      if (!existingConfig.eq(args)) {
        wait("").info(
          `Some of the config used differ from the config found in '${existingConfig.path()}'. Use --save-config to overwrite it.`,
        );
      }
      return;
    } else if (existingConfig) {
      existingConfig.override(args);
      config = existingConfig;
    } else {
      config = ConfigFile.create(pathOrDefault, args);
    }
    await Deno.writeTextFile(
      config.path(),
      (config satisfies ConfigFile).stringify(),
    );
    wait("").succeed(
      `${
        existingConfig ? "Updated" : "Created"
      } config file '${config.path()}'.`,
    );
  },

  cwdOrAncestors: function* () {
    let wd = Deno.cwd();
    while (wd) {
      yield join(wd, DEFAULT_FILENAME);
      const newWd = dirname(wd);
      if (newWd === wd) {
        return;
      } else {
        wd = newWd;
      }
    }
  },
};
