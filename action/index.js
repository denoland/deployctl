import * as core from "@actions/core";
import * as github from "@actions/github";
import "./shim.js";
import {
  API,
  APIError,
  fromFileUrl,
  parseEntrypoint,
  resolve,
  walk,
  normalize,
} from "./deps.js";

// The origin of the server to make Deploy requests to.
const ORIGIN = process.env.DEPLOY_API_ENDPOINT ?? "https://dash.deno.com";

async function main() {
  const projectId = core.getInput("project", { required: true });
  const entrypoint = core.getInput("entrypoint", { required: true });
  const importMap = core.getInput("import-map", {});
  const include = core.getInput("include", {})?.split(",").map(v => normalize(v));
  const exclude = core.getInput("exclude", {})?.split(",").map(v => normalize(v));
  console.log({include, exclude})
  const cwd = resolve(process.cwd(), core.getInput("root", {}));

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
  const assets = new Map();
  const entries = await walk(cwd, cwd, assets, {
    include,
    exclude,
  });
  core.debug(`Discovered ${assets.size} assets`);

  const api = new API(`GitHubOIDC ${token}`, ORIGIN);

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
  const progress = api.gitHubActionsDeploy(projectId, req, files);
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
