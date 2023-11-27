// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

import { basename, magenta } from "../deps.ts";
import { API, APIError } from "./utils/api.ts";
import TokenProvisioner from "./utils/access_token.ts";
import { wait } from "./utils/spinner.ts";
import { error } from "./error.ts";

const NONAMES = ["src", "lib", "code", "dist", "build", "shared", "public"];

/** Arguments inferred from context */
interface InferredArgs {
  project?: string;
  entrypoint?: string;
}

/**
 * Infer name of the project.
 *
 * The name of the project is inferred from either of the following options, in order:
 * - If the project is in a git repo, infer `<org-name>-<repo-name>`
 * - Otherwise, use the directory name from where DeployCTL is being executed,
 *   unless the name is useless like "src" or "dist".
 */
async function inferProject(api: API, dryRun: boolean) {
  wait("").start().warn(
    "No project name or ID provided with either the --project arg or a config file.",
  );
  let projectName = await inferProjectFromOriginUrl() || inferProjectFromCWD();
  if (!projectName) {
    return;
  }
  if (dryRun) {
    wait("").start().succeed(
      `Guessed project name '${projectName}'.`,
    );
    wait({ text: "", indent: 3 }).start().info(
      "This is a dry run. In a live run the guessed name might be different if this one is invalid or already used.",
    );
    return projectName;
  }
  for (;;) {
    let spinner;
    if (projectName) {
      spinner = wait(
        `Guessing project name '${projectName}': creating project...`,
      ).start();
    } else {
      spinner = wait("Creating new project with a random name...").start();
    }
    try {
      const project = await api.createProject(projectName);
      if (projectName) {
        spinner.succeed(
          `Guessed project name '${project.name}'.`,
        );
      } else {
        spinner.succeed(`Created new project '${project.name}'`);
      }
      wait({ text: "", indent: 3 }).start().info(
        `You can always change the project name in https://dash.deno.com/projects/${project.name}/settings`,
      );
      return project.name;
    } catch (e) {
      if (e instanceof APIError && e.code == "projectNameInUse") {
        spinner.stop();
        spinner = wait(
          `Guessing project name '${projectName}': this project name is already used. Checking ownership...`,
        ).start();
        const hasAccess = projectName &&
          (await api.getProject(projectName)) !== null;
        if (hasAccess) {
          spinner.stop();
          const confirmation = confirm(
            `${
              magenta("?")
            } Guessing project name '${projectName}': you already own this project. Should I deploy to it?`,
          );
          if (confirmation) {
            return projectName;
          }
        }
        projectName = `${projectName}-${Math.floor(Math.random() * 100)}`;
        spinner.stop();
      } else if (e instanceof APIError && e.code == "slugInvalid") {
        // Fallback to random name given by the API
        projectName = undefined;
        spinner.stop();
      } else {
        spinner.fail(
          `Guessing project name '${projectName}': Creating project...`,
        );
        error(e.code);
      }
    }
  }
}

async function inferProjectFromOriginUrl() {
  let originUrl = await getOriginUrlUsingGitCmd();
  if (!originUrl) {
    originUrl = await getOriginUrlUsingFS();
  }
  if (!originUrl) {
    return;
  }
  const result = originUrl.match(
    /[:\/]+(?<org>[^\/]+)\/(?<repo>[^\/]+?)(?:\.git)?$/,
  )?.groups;
  if (result) {
    return `${result.org}-${result.repo}`;
  }
}

function inferProjectFromCWD() {
  const projectName = basename(Deno.cwd())
    .toLowerCase()
    .replaceAll(/[\s_]/g, "-")
    .replaceAll(/[^a-z,A-Z,-]/g, "")
    .slice(0, 26);
  if (NONAMES.every((n) => n !== projectName)) {
    return projectName;
  }
}

/** Try getting the origin remote URL using the git command */
async function getOriginUrlUsingGitCmd(): Promise<string | undefined> {
  try {
    const cmd = await new Deno.Command("git", {
      args: ["remote", "get-url", "origin"],
    }).output();
    if (cmd.stdout.length !== 0) {
      return new TextDecoder().decode(cmd.stdout).trim();
    }
  } catch (_) {
    return;
  }
}

/** Try getting the origin remote URL reading the .git/config file */
async function getOriginUrlUsingFS(): Promise<string | undefined> {
  // We assume cwd is the root of the repo. We favor false-negatives over false-positives, and this
  // is a last-resort fallback anyway
  try {
    const config: string = await Deno.readTextFile(".git/config");
    const originSectionStart = config.indexOf('[remote "origin"]');
    const originSectionEnd = config.indexOf("[", originSectionStart + 1);
    return config.slice(originSectionStart, originSectionEnd).match(
      /url\s*=\s*(?<url>.+)/,
    )
      ?.groups
      ?.url
      ?.trim();
  } catch {
    return;
  }
}

const ENTRYPOINT_PATHS = ["main", "index", "src/main", "src/index"];
const ENTRYPOINT_EXTENSIONS = ["ts", "js", "tsx", "jsx"];

/**
 * Infer the entrypoint of the project
 *
 * The current algorithm infers the entrypoint if one and only one of the following
 * files is found:
 * - main.[tsx|ts|jsx|js]
 * - index.[tsx|ts|jsx|js]
 * - src/main.[tsx|ts|jsx|js]
 * - src/index.[tsx|ts|jsx|js]
 */
async function inferEntrypoint() {
  const candidates = [];
  for (const path of ENTRYPOINT_PATHS) {
    for (const extension of ENTRYPOINT_EXTENSIONS) {
      candidates.push(present(`${path}.${extension}`));
    }
  }
  const candidatesPresent = (await Promise.all(candidates)).filter((c) =>
    c !== undefined
  );
  if (candidatesPresent.length === 1) {
    return candidatesPresent[0];
  } else {
    return;
  }
}

async function present(path: string): Promise<string | undefined> {
  try {
    await Deno.lstat(path);
    return path;
  } catch {
    return;
  }
}

export default async function inferMissingConfig(
  args: InferredArgs & {
    token?: string;
    help?: boolean;
    version?: boolean;
    "dry-run"?: boolean;
  },
) {
  if (args.help || args.version) {
    return;
  }
  const api = args.token
    ? API.fromToken(args.token)
    : API.withTokenProvisioner(TokenProvisioner);
  if (args.project === undefined) {
    args.project = await inferProject(api, !!args["dry-run"]);
  }
  if (args.entrypoint === undefined) {
    args.entrypoint = await inferEntrypoint();
    if (args.entrypoint) {
      wait("").start().warn(
        `No entrypoint provided with either the --entrypoint arg or a config file. I've guessed '${args.entrypoint}' for you.`,
      );
      wait({ text: "", indent: 3 }).start().info(
        "Is this wrong? Please let us know in https://github.com/denoland/deployctl/issues/new",
      );
    }
  }
}
