// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

import { fromFileUrl, join, normalize, Spinner, wait } from "../../deps.ts";
import { error } from "../error.ts";
import { API } from "../utils/api.ts";
import { ManifestEntry } from "../utils/api_types.ts";
import { parseEntrypoint } from "../utils/entrypoint.ts";

const help = `deployctl deploy
Deploy a script with static files to Deno Deploy.

To deploy a local script:
  deployctl deploy --project=helloworld main.ts

To deploy a remote script:
  deployctl deploy --project=helloworld https://deno.com/examples/hello.js

To deploy a remote script without static files:
  deployctl deploy --project=helloworld --no-static https://deno.com/examples/hello.js

USAGE:
    deployctl deploy [OPTIONS] <ENTRYPOINT>

OPTIONS:
        --exclude=<PATTERNS>  Exclude files that match this pattern
        --include=<PATTERNS>  Only upload files that match this pattern
    -h, --help                Prints help information
        --no-static           Don't include the files in the CWD as static files
        --prod                Create a production deployment (default is preview deployment)
    -p, --project=NAME        The project to deploy to
        --token=TOKEN         The API token to use (defaults to DEPLOY_TOKEN env var)
`;

export interface Args {
  help: boolean;
  static: boolean;
  prod: boolean;
  exclude?: string[];
  include?: string[];
  token: string | null;
  project: string | null;
}

// deno-lint-ignore no-explicit-any
export default async function (rawArgs: Record<string, any>): Promise<void> {
  const args: Args = {
    help: !!rawArgs.help,
    static: !!rawArgs.static,
    prod: !!rawArgs.prod,
    token: rawArgs.token ? String(rawArgs.token) : null,
    project: rawArgs.project ? String(rawArgs.project) : null,
    exclude: rawArgs.exclude?.split(","),
    include: rawArgs.include?.split(","),
  };
  const entrypoint: string | null = typeof rawArgs._[0] === "string"
    ? rawArgs._[0]
    : null;
  if (args.help) {
    console.log(help);
    Deno.exit(0);
  }
  if (entrypoint === null) {
    console.error(help);
    error("No entrypoint specifier given.");
  }
  if (rawArgs._.length > 1) {
    console.error(help);
    error("Too many positional arguments given.");
  }
  if (args.project === null) {
    console.error(help);
    error("Missing project ID.");
  }
  const token = args.token ?? Deno.env.get("DEPLOY_TOKEN") ?? null;
  if (token === null) {
    console.error(help);
    error("Missing access token. Set via --token or DEPLOY_TOKEN.");
  }

  const opts = {
    entrypoint: await parseEntrypoint(entrypoint),
    static: args.static,
    prod: args.prod,
    token,
    project: args.project,
    include: args.include?.map((pattern) => normalize(pattern)),
    exclude: args.exclude?.map((pattern) => normalize(pattern)),
  };

  await deploy(opts);
}

interface DeployOpts {
  entrypoint: URL;
  static: boolean;
  prod: boolean;
  exclude?: string[];
  include?: string[];
  token: string;
  project: string;
}

/** Calculate git object hash, like `git hash-object` does. */
async function calculateGitSha1(bytes: Uint8Array) {
  const prefix = `blob ${bytes.byteLength}\0`;
  const prefixBytes = new TextEncoder().encode(prefix);
  const fullBytes = new Uint8Array(prefixBytes.byteLength + bytes.byteLength);
  fullBytes.set(prefixBytes);
  fullBytes.set(bytes, prefixBytes.byteLength);
  const hashBytes = await crypto.subtle.digest("SHA-1", fullBytes);
  const hashHex = Array.from(new Uint8Array(hashBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

function include(
  path: string,
  include?: string[],
  exclude?: string[],
): boolean {
  if (
    include && !include.some((pattern): boolean => path.startsWith(pattern))
  ) {
    return false;
  }
  if (exclude && exclude.some((pattern): boolean => path.startsWith(pattern))) {
    return false;
  }
  return true;
}

async function walk(
  cwd: string,
  dir: string,
  files: Map<string, string>,
  options: { include?: string[]; exclude?: string[] },
): Promise<Record<string, ManifestEntry>> {
  const entries: Record<string, ManifestEntry> = {};
  for await (const file of Deno.readDir(dir)) {
    const path = join(dir, file.name);
    const relative = path.slice(cwd.length);
    if (
      !include(
        path.slice(cwd.length + 1),
        options.include,
        options.exclude,
      )
    ) {
      continue;
    }
    let entry: ManifestEntry;
    if (file.isFile) {
      const data = await Deno.readFile(path);
      const gitSha1 = await calculateGitSha1(data);
      entry = {
        kind: "file",
        gitSha1,
        size: data.byteLength,
      };
      files.set(gitSha1, path);
    } else if (file.isDirectory) {
      if (relative === "/.git") continue;
      entry = {
        kind: "directory",
        entries: await walk(cwd, path, files, options),
      };
    } else if (file.isSymlink) {
      const target = await Deno.readLink(path);
      entry = {
        kind: "symlink",
        target,
      };
    } else {
      throw new Error(`Unreachable`);
    }
    entries[file.name] = entry;
  }
  return entries;
}

async function deploy(opts: DeployOpts): Promise<void> {
  const projectSpinner = wait("Fetching project information...").start();
  const api = new API(opts.token);
  const project = await api.getProject(opts.project);
  if (project === null) {
    projectSpinner.fail("Project not found.");
    Deno.exit(1);
  }
  projectSpinner.succeed(`Project: ${project.name}`);

  let url = opts.entrypoint;
  const cwd = Deno.cwd();
  if (url.protocol === "file:") {
    const path = fromFileUrl(url);
    if (!path.startsWith(cwd)) {
      error("Entrypoint must be in the current working directory.");
    }
    const entrypoint = path.slice(cwd.length);
    url = new URL(`file:///src${entrypoint}`);
  }

  const assetSpinner = wait("Finding static assets...").start();
  const assets = new Map<string, string>();
  const entries = await walk(cwd, cwd, assets, {
    include: opts.include,
    exclude: opts.exclude,
  });
  assetSpinner.succeed(`Found ${assets.size} assets.`);

  let uploadSpinner: Spinner | null = wait("Determining assets to upload...")
    .start();
  const neededHashes = await api.projectNegotiateAssets(project.id, {
    entries,
  });

  const files = [];
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
    uploadSpinner.text = `Uploading ${files.length} asset${
      files.length === 1 ? "" : "s"
    }... (0%)`;
  }

  let deploySpinner: Spinner | null = null;
  const req = {
    url: url.href,
    production: opts.prod,
    manifest: { entries },
  };
  const progress = api.pushDeploy(project.id, req, files);
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
      case "success":
        deploySpinner!.succeed(`Deployment complete.`);
        console.log("\nView at:");
        for (const { domain } of event.domainMappings) {
          console.log(` - https://${domain}`);
        }
        break;
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
}
