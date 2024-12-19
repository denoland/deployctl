import * as core from "@actions/core";
import * as github from "@actions/github";
import "./shim.js";
import {
  API,
  APIError,
  convertPatternToRegExp,
  fromFileUrl,
  parseEntrypoint,
  resolve,
  walk,
} from "./deps.js";
import process from "node:process";
import { jsonc } from "jsonc";
import { tmpdir } from "node:os";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";

// The origin of the server to make Deploy requests to.
const ORIGIN = process.env.DEPLOY_API_ENDPOINT ?? "https://dash.deno.com";

async function main() {
  // Try to resolve and parse a deno config file
  const cwd = resolve(process.cwd(), core.getInput("root", {}));
  let denoConfig = core.getInput("deno-config", {});
  let denoConfigHasDeployInfo = false;
  const denoParsedConfig = {};
  for (let path of [denoConfig, "deno.json", "deno.jsonc"]) {
    path = resolve(cwd, path);
    if (existsSync(path)) {
      denoConfig = path;
      break;
    }
  }
  if (denoConfig) {
    core.info(`Found a Deno configuration file: ${denoConfig}`);
    Object.assign(
      denoParsedConfig,
      jsonc.parse(await readFile(denoConfig, "utf-8")),
    );
    // Defaults deno deploy inputs if present in configuration file
    if (denoParsedConfig.deploy) {
      core.info(`The configuration file has a "deploy" field`);
      if (
        denoParsedConfig.deploy.project && denoParsedConfig.deploy.entrypoint
      ) {
        denoConfigHasDeployInfo = true;
        core.info(`The "deploy" field seems to be valid`);
      } else {
        core.warning(
          `Could not read "project" and "entrypoint" values from the "deploy" field of the configuration file`,
        );
      }
    }
    // Create an temporary import map if present in configuration file
    // This lets user use deno.jsonc files as import-map since jsonc is not directly supported
    if (denoParsedConfig.imports) {
      core.info(`The configuration file has a "imports" field`);
      denoParsedConfig.importMap = resolve(tmpdir(), "importMap.json");
      await writeFile(
        denoParsedConfig.importMap,
        JSON.stringify({ imports: denoParsedConfig.imports }),
      );
    }
  }

  const projectId =
    core.getInput("project", { required: !denoConfigHasDeployInfo }) ||
    denoParsedConfig.deploy?.project;
  const entrypoint =
    core.getInput("entrypoint", { required: !denoConfigHasDeployInfo }) ||
    denoParsedConfig.deploy?.entrypoint;
  const importMap = core.getInput("import-map", {}) ||
    (denoParsedConfig.importMap ?? "");
  const include = denoParsedConfig.deploy?.include ||
    core.getMultilineInput("include", {});
  const exclude = denoParsedConfig.deploy?.exclude ||
    core.getMultilineInput("exclude", {});

  if (github.context.eventName === "pull_request") {
    const pr = github.context.payload.pull_request;
    const isPRFromFork = pr.head.repo.id !== pr.base.repo.id;
    if (isPRFromFork) {
      core.setOutput("deployment-id", "");
      core.setOutput("url", "");
      core.notice(
        "Deployments from forks are currently not supported by Deno Deploy. The deployment was skipped.",
        {
          title: "Skipped deployment on fork",
        },
      );
      return;
    }
  }

  const aud = new URL(`/projects/${projectId}`, ORIGIN);
  let token;
  try {
    token = await core.getIDToken(aud);
  } catch {
    throw "Failed to get the GitHub OIDC token. Make sure that this job has the required permissions for getting GitHub OIDC tokens (see https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect#adding-permissions-settings ).";
  }
  core.info(`Project: ${projectId}`);

  let url = await parseEntrypoint(entrypoint, cwd);
  if (url.protocol === "file:") {
    const path = fromFileUrl(url);
    if (!path.startsWith(cwd)) {
      throw "Entrypoint must be in the working directory (cwd, or specified root directory).";
    }
    const entrypoint = path.slice(cwd.length);
    url = new URL(`file:///src${entrypoint}`);
  }
  core.info(`Entrypoint: ${url.href}`);

  let importMapUrl = null;
  if (importMap) {
    importMapUrl = await parseEntrypoint(importMap, cwd, "import map");
    if (importMapUrl.protocol === "file:") {
      const path = fromFileUrl(importMapUrl);
      if (!path.startsWith(cwd)) {
        throw "Import map must be in the working directory (cwd, or specified root directory).";
      }
      const importMap = path.slice(cwd.length);
      importMapUrl = new URL(`file:///src${importMap}`);
    }
    core.info(`Import map: ${importMapUrl.href}`);
  }

  core.debug(`Discovering assets in "${cwd}"`);
  const includes = include.flatMap((i) => i.split(",")).map((i) => i.trim());
  const excludes = exclude.flatMap((e) => e.split(",")).map((i) => i.trim());
  // Exclude node_modules by default unless explicitly specified
  if (!includes.some((i) => i.includes("node_modules"))) {
    excludes.push("**/node_modules");
  }
  const assets = new Map();
  const entries = await walk(cwd, cwd, assets, {
    include: includes.map(convertPatternToRegExp),
    exclude: excludes.map(convertPatternToRegExp),
  });
  core.debug(`Discovered ${assets.size} assets`);

  const api = new API(`GitHubOIDC ${token}`, ORIGIN, {
    alwaysPrintDenoRay: true,
    logger: core,
  });

  const neededHashes = await api.projectNegotiateAssets(projectId, {
    entries,
  });
  core.debug(`Determined ${neededHashes.length} need to be uploaded`);

  const files = [];
  for (const hash of neededHashes) {
    const path = assets.get(hash);
    if (path === undefined) {
      throw `Asset ${hash} not found.`;
    }
    const data = await Deno.readFile(path);
    files.push(data);
  }
  const totalSize = files.reduce((acc, file) => acc + file.length, 0);
  core.info(
    `Uploading ${neededHashes.length} file(s) (total ${totalSize} bytes)`,
  );

  const manifest = { entries };
  core.debug(`Manifest: ${JSON.stringify(manifest, null, 2)}`);

  const req = {
    url: url.href,
    importMapUrl: importMapUrl?.href ?? null,
    manifest,
    event: github.context.payload,
  };
  const progress = await api.gitHubActionsDeploy(projectId, req, files);
  let deployment;
  for await (const event of progress) {
    switch (event.type) {
      case "staticFile": {
        const percentage = (event.currentBytes / event.totalBytes) * 100;
        core.info(
          `Uploading ${files.length} asset(s) (${percentage.toFixed(1)}%)`,
        );
        break;
      }
      case "load": {
        const progress = event.seen / event.total * 100;
        core.info(`Deploying... (${progress.toFixed(1)}%)`);
        break;
      }
      case "uploadComplete":
        core.info("Finishing deployment...");
        break;
      case "success":
        core.info("Deployment complete.");
        core.info("\nView at:");
        for (const { domain } of event.domainMappings) {
          core.info(` - https://${domain}`);
        }
        deployment = event;
        break;
      case "error":
        throw event.ctx;
    }
  }

  core.setOutput("deployment-id", deployment.id);
  const domain = deployment.domainMappings[0].domain;
  core.setOutput("url", `https://${domain}/`);
}

try {
  await main();
} catch (error) {
  if (error instanceof APIError) {
    core.setFailed(error.toString());
  } else {
    core.setFailed(error);
  }
}
