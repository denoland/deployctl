// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

import {
  cyan,
  dirname,
  extname,
  green,
  join,
  JSONC,
  magenta,
  red,
  relative,
  resolve,
} from "../deps.ts";
import { error } from "./error.ts";
import { isURL } from "./utils/entrypoint.ts";
import { wait } from "./utils/spinner.ts";

const DEFAULT_FILENAME = "deno.json";
const CANDIDATE_FILENAMES = [DEFAULT_FILENAME, "deno.jsonc"];

/** Arguments persisted in the deno.json config file */
interface ConfigArgs {
  project?: string;
  entrypoint?: string;
  include?: string[];
  exclude?: string[];
}

class ConfigFile {
  #path: string;
  #content: { deploy?: ConfigArgs };

  constructor(path: string, content: { deploy?: ConfigArgs }) {
    this.#path = path;
    this.#content = {
      ...content,
      deploy: content.deploy && this.normalize(content.deploy),
    };
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
    const normalizedArgs = this.normalize(args);
    this.#content.deploy = normalizedArgs;
  }

  /**
   * For every arg in `ConfigArgs`, if the `args` argument object does not contain
   * the arg, fill it with the value in this `ConfigFile`, if any.
   */
  useAsDefaultFor(args: ConfigArgs) {
    for (const [key, thisValue] of Object.entries(this.args())) {
      // deno-lint-ignore no-explicit-any
      if ((args as any)[key] === undefined && thisValue) {
        // deno-lint-ignore no-explicit-any
        (args as any)[key] = thisValue;
      }
    }
  }

  /** Returns all the differences between this `ConfigArgs` and the one provided as argument.
   *
   * The comparison is performed against the JSON output of each config. The "other" args are
   * sematically considered additions in the return value.  Ignores any property in `args` not meant
   * to be persisted.
   */
  diff(args: ConfigArgs): Change[] {
    const changes = [];
    const otherConfigOutput =
      JSON.parse(ConfigFile.create(this.path(), args).toFileContent()).deploy ??
        {};
    const thisConfigOutput = JSON.parse(this.toFileContent()).deploy ?? {};
    // Iterate over the other args as they might include args not yet persisted in the config file
    for (const [key, otherValue] of Object.entries(otherConfigOutput)) {
      const thisValue = thisConfigOutput[key];
      if (otherValue instanceof Array) {
        const thisArrayValue = thisValue as typeof otherValue;
        if (
          thisArrayValue.length !== otherValue.length ||
          !thisArrayValue.every((x, i) => otherValue[i] === x)
        ) {
          changes.push({ key, removal: thisValue, addition: otherValue });
        }
      } else if (thisValue !== otherValue) {
        changes.push({ key, removal: thisValue, addition: otherValue });
      }
    }
    return changes;
  }

  normalize(args: ConfigArgs): ConfigArgs {
    // Copy object as normalization is internal to the config file
    const normalizedArgs = {
      project: args.project,
      exclude: args.exclude,
      include: args.include,
      entrypoint: (args.entrypoint && !isURL(args.entrypoint))
        ? resolve(args.entrypoint)
        // Backoff if entrypoint is URL, the user knows what they're doing
        : args.entrypoint,
    };
    return normalizedArgs;
  }

  /** Return whether the `ConfigFile` has the `deploy` namespace */
  hasDeployConfig() {
    return this.#content.deploy !== undefined;
  }

  static fromFileContent(filepath: string, content: string) {
    const parsedContent = JSONC.parse(content) as { deploy?: ConfigArgs };
    const configContent = {
      ...parsedContent,
      deploy: parsedContent.deploy && {
        ...parsedContent.deploy,
        entrypoint: parsedContent.deploy.entrypoint &&
          (isURL(parsedContent.deploy.entrypoint)
            // Backoff if entrypoint is URL, the user knows what they're doing
            ? parsedContent.deploy.entrypoint
            // entrypoint must be interpreted as absolute or relative to the config file
            : resolve(dirname(filepath), parsedContent.deploy.entrypoint)),
      },
    };
    return new ConfigFile(filepath, configContent);
  }

  toFileContent() {
    const content = {
      ...this.#content,
      deploy: this.#content.deploy && {
        ...this.#content.deploy,
        entrypoint: this.#content.deploy.entrypoint &&
          (isURL(this.#content.deploy.entrypoint)
            // Backoff if entrypoint is URL, the user knows what they're doing
            ? this.#content.deploy.entrypoint
            // entrypoint must be stored relative to the config file
            : relative(dirname(this.#path), this.#content.deploy.entrypoint)),
      },
    };
    return JSON.stringify(content, null, 2);
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
        return ConfigFile.fromFileContent(filepath, content);
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
    const isJsonc = extname(pathOrDefault) === ".jsonc";
    const existingConfig = await this.read(pathOrDefault);
    const changes = existingConfig?.diff(args) ?? [];
    let config;
    if (existingConfig && changes.length === 0) {
      // There are no changes to write
      return;
    } else if (
      existingConfig && existingConfig.hasDeployConfig() && !overwrite
    ) {
      // There are changes to write and there's already some deploy config, we require the --save-config flag
      wait("").start().info(
        `Some of the config used differ from the config found in '${existingConfig.path()}'. Use --save-config to overwrite it.`,
      );
      return;
    } else if (existingConfig) {
      // Either there is no deploy config in the config file or the user is using --save-config flag
      if (isJsonc) {
        const msg = overwrite
          ? `Writing to the config file '${pathOrDefault}' will remove any existing comment and format it as a plain JSON file. Is that ok?`
          : `I want to store some configuration in '${pathOrDefault}' config file but this will remove any existing comment from it. Is that ok?`;
        const confirmation = confirm(`${magenta("?")} ${msg}`);
        if (!confirmation) {
          const formattedChanges = existingConfig.hasDeployConfig()
            ? cyan(
              `  "deploy": {\n     ...\n${formatChanges(changes, 2, 2)}\n  }`,
            )
            : green(
              ConfigFile.create(pathOrDefault, args).toFileContent().slice(
                2,
                -2,
              ),
            );
          wait({ text: "", indent: 3 }).start().info(
            `I understand. Here's the config I wanted to write:\n${formattedChanges}`,
          );
          return;
        }
      }
      existingConfig.override(args);
      config = existingConfig;
    } else {
      // The config file does not exist. Create a new one.
      config = ConfigFile.create(pathOrDefault, args);
    }
    await Deno.writeTextFile(
      config.path(),
      (config satisfies ConfigFile).toFileContent(),
    );
    wait("").start().succeed(
      `${
        existingConfig ? "Updated" : "Created"
      } config file '${config.path()}'.`,
    );
  },

  cwdOrAncestors: function* () {
    let wd = Deno.cwd();
    while (wd) {
      for (const filename of CANDIDATE_FILENAMES) {
        yield join(wd, filename);
      }
      const newWd = dirname(wd);
      if (newWd === wd) {
        return;
      } else {
        wd = newWd;
      }
    }
  },
};

function formatChanges(
  changes: Change[],
  indent?: number,
  gap?: number,
): string {
  const removals = [];
  const additions = [];
  const padding = " ".repeat(indent ?? 0);
  const innerPadding = " ".repeat(gap ?? 0);
  for (const { key, removal, addition } of changes) {
    if (removal !== undefined) {
      removals.push(red(
        `${padding}-${innerPadding}"${key}": ${JSON.stringify(removal)}`,
      ));
    }
    if (addition !== undefined) {
      additions.push(green(
        `${padding}+${innerPadding}"${key}": ${JSON.stringify(addition)}`,
      ));
    }
  }
  return [removals.join(red(",\n")), additions.join(green(",\n"))].join("\n")
    .trim();
}

interface Change {
  key: string;
  removal?: unknown;
  addition?: unknown;
}
