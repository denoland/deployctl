import { wait } from "../../deps.ts";
import { error } from "../error.ts";
import { API, APIError } from "../utils/api.ts";
import { parseKVStrings } from "../utils/pairs.ts";

const help = `deployctl env
Manage environment variables for the given project

To set environment variables for a project:
  deployctl env --project=helloworld ENV1=VALUE_1 ENV2=VALUE_2

USAGE:
    deployctl env [OPTIONS] [<ENVVARS>]

OPTIONS:
    -p, --project=NAME  The project you want to get the logs
        --token=TOKEN   The API token to use (defaults to DENO_DEPLOY_TOKEN env var)
`;

export interface Args {
  help: boolean;
  project: string | null;
  token: string | null;
}

export default async function (rawArgs: Record<string, any>): Promise<void> {
  const args: Args = {
    help: !!rawArgs.help,
    token: rawArgs.token ? String(rawArgs.token) : null,
    project: rawArgs.project ? String(rawArgs.project) : null,
  };

  if (args.help) {
    console.log(help);
    Deno.exit(0);
  }

  const token = args.token ?? Deno.env.get("DENO_DEPLOY_TOKEN") ?? null;
  if (token === null) {
    console.error(help);
    error("Missing access token. Set via --token or DENO_DEPLOY_TOKEN.");
  }
  if (rawArgs._.length < 1) {
    console.error(help);
    error("Requires at least one SECRET=VALUE pair");
  }
  if (args.project === null) {
    console.error(help);
    error("Missing project ID.");
  }

  const opts = {
    envVars: await parseKVStrings(rawArgs._).catch((e) => error(e)),
    token,
    project: args.project,
  };

  await secrets(opts);
}

interface SecretsOpts {
  envVars: Record<string, string>;
  token: string;
  project: string;
}

async function secrets(opts: SecretsOpts) {
  const projectSpinner = wait("Fetching project information...").start();
  const api = API.fromToken(opts.token);
  const project = await api.getProject(opts.project);
  if (project === null) {
    projectSpinner.fail("Project not found.");
    Deno.exit(1);
  }
  projectSpinner.succeed(`Project: ${project!.name}`);

  const envSpinner = wait("Uploading environment variables").start();
  try {
    await api.editEnvs(project!.id, opts.envVars);
    envSpinner.succeed(
      "A new production deployment will be created automatically with the new environment variables when you next push your code.",
    );
  } catch (err) {
    envSpinner.fail("Failed to update environment variables");
    if (err instanceof APIError) {
      error(err.toString());
    } else {
      throw err;
    }
  }
}
