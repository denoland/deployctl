// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

import {
  fromFileUrl,
  globToRegExp,
  isGlob,
  normalize,
  Spinner,
} from "../../deps.ts";
import { wait } from "../utils/spinner.ts";
import configFile from "../config_file.ts";
import { error } from "../error.ts";
import { API, APIError } from "../utils/api.ts";
import { ManifestEntry } from "../utils/api_types.ts";
import { parseEntrypoint } from "../utils/entrypoint.ts";
import { walk } from "../utils/walk.ts";
import TokenProvisioner from "../utils/access_token.ts";
import { Args as RawArgs } from "../args.ts";

const help = `deployctl deploy
Deploy a script with static files to Deno Deploy.

Basic usage:

    deployctl deploy

By default, deployctl will guess the project name based on the Git repo or directory it is in.
Similarly, it will guess the entrypoint by looking for files with common entrypoint names (main.ts, src/main.ts, etc).
After the first deployment, the settings used will be stored in a config file (by default deno.json). 

You can specify the project name and/or the entrypoint using the --project and --entrypoint arguments respectively:

    deployctl deploy --project=helloworld --entrypoint=src/entrypoint.ts

By default, deployctl deploys all the files in the current directory (recursively, except node_modules directories).
You can customize this behaviour using the --include and --exclude arguments (also supported in the
config file). Here are some examples:

- Include only source and static files:

    deployctl deploy --include=./src --include=./static

- Include only Typescript files:

    deployctl deploy --include=**/*.ts

- Exclude local tooling and artifacts

    deployctl deploy --exclude=./tools --exclude=./benches

A common pitfall is to not include the source code modules that need to be run (entrypoint and dependencies).
The following example will fail because main.ts is not included:

    deployctl deploy --include=./static --entrypoint=./main.ts

The entrypoint can also be a remote script. A common use case for this is to deploy an static site
using std/http/file_server.ts (more details in https://docs.deno.com/deploy/tutorials/static-site ):

    deployctl deploy --entrypoint=https://deno.land/std@0.208.0/http/file_server.ts


USAGE:
    deployctl deploy [OPTIONS] [<ENTRYPOINT>]

OPTIONS:
        --exclude=<PATH[,PATH]> Prevent the upload of these comma-separated paths. Can be used multiple times. Globs are supported
        --include=<PATH[,PATH]> Only upload files in these comma-separated paths. Can be used multiple times. Globs are supported
        --import-map=<PATH>     Path to the import map file to use.
    -h, --help                  Prints this help information
        --prod                  Create a production deployment (default is preview deployment except the first deployment)
    -p, --project=<NAME|ID>     The project to deploy to
        --entrypoint=<PATH|URL> The file that Deno Deploy will run. Also available as positional argument, which takes precedence
        --token=<TOKEN>         The API token to use (defaults to DENO_DEPLOY_TOKEN env var)
        --dry-run               Dry run the deployment process.
        --config=<PATH>         Path to the file from where to load DeployCTL config. Defaults to 'deno.json'
        --save-config           Persist the arguments used into the DeployCTL config file
`;

export interface Args {
  help: boolean;
  static: boolean;
  prod: boolean;
  exclude: string[];
  include: string[];
  token: string | null;
  project: string | null;
  entrypoint: string | null;
  importMap: string | null;
  dryRun: boolean;
  config: string | null;
  saveConfig: boolean;
}

export default async function (rawArgs: RawArgs): Promise<void> {
  const positionalEntrypoint: string | null = typeof rawArgs._[0] === "string"
    ? rawArgs._[0]
    : null;
  const args: Args = {
    help: !!rawArgs.help,
    static: !!rawArgs.static,
    prod: !!rawArgs.prod,
    token: rawArgs.token ? String(rawArgs.token) : null,
    project: rawArgs.project ? String(rawArgs.project) : null,
    entrypoint: positionalEntrypoint !== null
      ? positionalEntrypoint
      : rawArgs["entrypoint"]
      ? String(rawArgs["entrypoint"])
      : null,
    importMap: rawArgs["import-map"] ? String(rawArgs["import-map"]) : null,
    exclude: rawArgs.exclude.flatMap((e) => e.split(",")),
    include: rawArgs.include.flatMap((i) => i.split(",")),
    dryRun: !!rawArgs["dry-run"],
    config: rawArgs.config ? String(rawArgs.config) : null,
    saveConfig: !!rawArgs["save-config"],
  };

  if (args.help) {
    console.log(help);
    Deno.exit(0);
  }
  if (args.entrypoint === null) {
    error(
      "Unable to guess the entrypoint of this project. Use the --entrypoint argument to provide one.",
    );
  }
  if (rawArgs._.length > 1) {
    error("Too many positional arguments given.");
  }
  if (args.project === null) {
    error(
      "Unable to guess a project name for this project. Use the --project argument to provide one.",
    );
  }

  const opts = {
    entrypoint: args.entrypoint,
    importMapUrl: args.importMap === null
      ? null
      : await parseEntrypoint(args.importMap, undefined, "import map")
        .catch((e) => error(e)),
    static: args.static,
    prod: args.prod,
    token: args.token,
    project: args.project,
    include: args.include,
    exclude: args.exclude,
    dryRun: args.dryRun,
    config: args.config,
    saveConfig: args.saveConfig,
  };

  await deploy(opts);
}

interface DeployOpts {
  entrypoint: string;
  importMapUrl: URL | null;
  static: boolean;
  prod: boolean;
  exclude: string[];
  include: string[];
  token: string | null;
  project: string;
  dryRun: boolean;
  config: string | null;
  saveConfig: boolean;
}

async function deploy(opts: DeployOpts): Promise<void> {
  let url = await parseEntrypoint(opts.entrypoint).catch(error);
  if (opts.dryRun) {
    wait("").start().info("Performing dry run of deployment");
  }
  const projectInfoSpinner = wait(
    `Fetching project '${opts.project}' information...`,
  ).start();
  const api = opts.token
    ? API.fromToken(opts.token)
    : API.withTokenProvisioner(TokenProvisioner);
  let projectIsEmpty = false;
  let project = await api.getProject(opts.project);
  if (project === null) {
    projectInfoSpinner.stop();
    const projectCreationSpinner = wait(
      `Project '${opts.project}' not found in any of the user's organizations. Creating...`,
    ).start();
    try {
      project = await api.createProject(opts.project);
    } catch (e) {
      error(e.message);
    }
    projectCreationSpinner.succeed(`Created new project '${opts.project}'.`);
    wait({ text: "", indent: 3 }).start().info(
      `You can configure the name, env vars, custom domains and more in https://dash.deno.com/projects/${project.name}/settings`,
    );
    projectIsEmpty = true;
  } else {
    const deploymentsListing = await api.getDeployments(project.id);
    if (deploymentsListing === null) {
      projectInfoSpinner.fail("Project deployments details not found.");
      Deno.exit(1);
    }
    const [projectDeployments, _pagination] = deploymentsListing!;
    projectInfoSpinner.succeed(`Deploying to project ${project.name}.`);

    if (projectDeployments.length === 0) {
      projectIsEmpty = true;
    }
  }

  if (projectIsEmpty) {
    opts.prod = true;
    wait({ text: "", indent: 3 }).start().info(
      "The project does not have a deployment yet. Automatically pushing initial deployment to production (use --prod for further updates).",
    );
  }

  const cwd = Deno.cwd();
  if (url.protocol === "file:") {
    const path = fromFileUrl(url);
    if (!path.startsWith(cwd)) {
      wait("").start().fail(`Entrypoint: ${path}`);
      error("Entrypoint must be in the current working directory.");
    } else {
      wait("").start().succeed(`Entrypoint: ${path}`);
    }
    const entrypoint = path.slice(cwd.length);
    url = new URL(`file:///src${entrypoint}`);
  }
  let importMapUrl = opts.importMapUrl;
  if (importMapUrl && importMapUrl.protocol === "file:") {
    const path = fromFileUrl(importMapUrl);
    if (!path.startsWith(cwd)) {
      error("Import map must be in the current working directory.");
    }
    const entrypoint = path.slice(cwd.length);
    importMapUrl = new URL(`file:///src${entrypoint}`);
  }

  let uploadSpinner: Spinner | null = null;
  const files = [];
  let manifest: { entries: Record<string, ManifestEntry> } | undefined =
    undefined;

  if (opts.static) {
    wait("").start().info(`Uploading all files from the current dir (${cwd})`);
    const assetSpinner = wait("Finding static assets...").start();
    const assets = new Map<string, string>();
    const include = opts.include.map((pattern) =>
      isGlob(pattern)
        // slice is used to remove the end-of-string anchor '$'
        ? RegExp(globToRegExp(normalize(pattern)).toString().slice(1, -2))
        : RegExp(`^${normalize(pattern)}`)
    );
    const exclude = opts.exclude.map((pattern) =>
      isGlob(pattern)
        // slice is used to remove the end-of-string anchor '$'
        ? RegExp(globToRegExp(normalize(pattern)).toString().slice(1, -2))
        : RegExp(`^${normalize(pattern)}`)
    );
    const entries = await walk(cwd, cwd, assets, { include, exclude });
    assetSpinner.succeed(
      `Found ${assets.size} asset${assets.size === 1 ? "" : "s"}.`,
    );

    uploadSpinner = wait("Determining assets to upload...").start();
    const neededHashes = await api.projectNegotiateAssets(project.id, {
      entries,
    });

    for (const hash of neededHashes) {
      const path = assets.get(hash);
      if (path === undefined) {
        error(`Asset ${hash} not found.`);
      }
      const data = await Deno.readFile(path);
      files.push(data);
    }
    if (files.length === 0) {
      uploadSpinner.succeed("No new assets to upload.");
      uploadSpinner = null;
    } else {
      uploadSpinner.text = `${files.length} new asset${
        files.length === 1 ? "" : "s"
      } to upload.`;
    }

    manifest = { entries };
  }

  if (opts.dryRun) {
    uploadSpinner?.succeed(uploadSpinner?.text);
    return;
  }

  let deploySpinner: Spinner | null = null;
  const req = {
    url: url.href,
    importMapUrl: importMapUrl ? importMapUrl.href : null,
    production: opts.prod,
    manifest,
  };
  const progress = api.pushDeploy(project.id, req, files);
  try {
    for await (const event of progress) {
      switch (event.type) {
        case "staticFile": {
          const percentage = (event.currentBytes / event.totalBytes) * 100;
          uploadSpinner!.text = `Uploading ${files.length} asset${
            files.length === 1 ? "" : "s"
          }... (${percentage.toFixed(1)}%)`;
          break;
        }
        case "load": {
          if (uploadSpinner) {
            uploadSpinner.succeed(
              `Uploaded ${files.length} new asset${
                files.length === 1 ? "" : "s"
              }.`,
            );
            uploadSpinner = null;
          }
          if (deploySpinner === null) {
            deploySpinner = wait("Deploying...").start();
          }
          const progress = event.seen / event.total * 100;
          deploySpinner.text = `Deploying... (${progress.toFixed(1)}%)`;
          break;
        }
        case "uploadComplete":
          deploySpinner!.text = `Finishing deployment...`;
          break;
        case "success": {
          const deploymentKind = opts.prod ? "Production" : "Preview";
          deploySpinner!.succeed(`${deploymentKind} deployment complete.`);

          // We want to store the project id even if user provided project name
          // to facilitate project renaming.
          opts.project = project.id;
          await configFile.maybeWrite(opts.config, opts, opts.saveConfig);
          console.log("\nView at:");
          for (const { domain } of event.domainMappings) {
            console.log(` - https://${domain}`);
          }
          break;
        }
        case "error":
          if (uploadSpinner) {
            uploadSpinner.fail(`Upload failed.`);
            uploadSpinner = null;
          }
          if (deploySpinner) {
            deploySpinner.fail(`Deployment failed.`);
            deploySpinner = null;
          }
          error(event.ctx);
      }
    }
  } catch (err: unknown) {
    if (err instanceof APIError) {
      if (uploadSpinner) {
        uploadSpinner.fail(`Upload failed.`);
        uploadSpinner = null;
      }
      if (deploySpinner) {
        deploySpinner.fail(`Deployment failed.`);
        deploySpinner = null;
      }
      error(err.toString());
    }
    error(String(err));
  }
}
