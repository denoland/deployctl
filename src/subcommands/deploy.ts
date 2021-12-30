// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

import { fromFileUrl, join, normalize } from "../../deps.ts";
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
  const api = new API(opts.token);
  const project = await api.getProject(opts.project);
  if (project === null) {
    error("Project not found.");
  }
  console.log("Deploying to project", project.name);

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

  const assets = new Map<string, string>();
  const entries = await walk(cwd, cwd, assets, {
    include: opts.include,
    exclude: opts.exclude,
  });
  console.log(entries);

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
    console.log(`No new static assets to upload.`);
  } else {
    console.log(`Uploading ${files.length} files...`);
  }

  const req = {
    url: url.href,
    production: opts.prod,
    manifest: { entries },
  };
  const progress = api.pushDeploy(project.id, req, files);
  for await (const event of progress) {
    switch (event.type) {
      case "load":
        console.log(`[${event.seen}/${event.total}] Downloading ${event.url}`);
        break;
      case "uploadComplete":
        console.log(`Finishing deployment...`);
        break;
      case "success":
        console.log(`Deployment successful!`);
        console.log("View at:");
        for (const { domain } of event.domainMappings) {
          console.log(` - https://${domain}`);
        }
        break;
      case "error":
        error(`Deployment failed: ${event.ctx}`);
    }
  }
}
