import { Args } from "../args.ts";
import { API, endpoint } from "../utils/api.ts";
import TokenProvisioner from "../utils/access_token.ts";
import { envVarsFromArgs } from "../utils/env_vars.ts";
import { wait } from "../utils/spinner.ts";
import {
  Build,
  Cron,
  CronExecutionRetry,
  Database,
  DeploymentProgressError,
  Organization,
  PagingInfo,
  Project,
} from "../utils/api_types.ts";
import {
  bold,
  cyan,
  fromFileUrl,
  green,
  magenta,
  red,
  Spinner,
  stripAnsiCode,
  tty,
  yellow,
} from "../../deps.ts";
import { error } from "../error.ts";
import { isTerminal } from "../utils/mod.ts";

const help = `Manage deployments in Deno Deploy

## SHOW

The "deployments show" subcommand is used to see all the details of a deployment.

The simplest form of the command will show the details of the production deployment of the project
you are currently in (project will be picked up from the config file):

    deployctl deployments show

And you can also navigate the list of deployments using --prev and --next. --prev will show you 1 deployment before the current production
deployment:

    deployctl deployments show --prev

To see the deployment before that, you can either add another --prev, or use --prev=2:

    deployctl deployments show --prev --prev

You can also see the production deployment of any project using --project:

    deployctl deployments show --project=my-other-project

Or just show the details of a specific deployment, of any project, using --id. This can also be combined with --prev and --next too:

    deployctl deployments show --id=p63c39ck5feg --next

## List

The "deployments list" subcommand is used to list the deployments of a project. 

The simplest form of the command will list the first 20 deployments of the project you are currently
in (project will be picked up from the config file):

    deployctl deployments list

You can list the rest of the deployments using --page:

    deployctl deployments list --page=2

You can specify the project to list deployments of with the --project option:

    deployctl deployments list --project=my-other-project

## Redeploy

The "deployments redeploy" subcommand creates a new deployment reusing the build of an existing deployment. 

One important principle to understand when using Deno Deploy is that deployments are immutable. This
includes the source code but also the env vars, domain mappings*, the KV database, crons, etc. To
change any of these associated resources for an existing deployment, you must redeploy it. 

For example, to promote a preview deployment to production, use the --prod option:

    deployctl deployments redeploy --prod

If this is a GitHub deployment, it will have 2 databases, one for prod deployments and one for preview deployments.
When promoting a preview deployment to prod, by default it will automatically switch also to the prod database.
You can control the database with the --db option:

    deployctl deployments redeploy --prod --db=preview

If your organization has custom databases, you can also set them by UUID:

    deployctl deployments redeploy --db=0b1c3e1b-a527-4055-b864-8bc7884390c9

Lastly, environment variables can also be changed using the redeploy functionality. You can use --env to set individual
environment variables, or --env-file to load one or more environment files:

    deployctl deployments redeploy --env-file --env-file=.other-env --env=DEPLOYMENT_TS=$(date +%s)

Be aware that when changing env variables, only the env variables set during the redeployment will be
used by the new deployment. Currently the project env variables are ignored during redeployment. If
this does not suit your needs, please report your feedback at https://github.com/denoland/deploy_feedback/issues/

USAGE:
    deployctl deployments <SUBCOMMAND> [OPTIONS]

SUBCOMMANDS:
    show [ID]     View details of a deployment. Specify the deployment with a positional argument or the --id option; otherwise, it will 
                  show the details of the current production deployment of the project specified in the config file or with the --project option.
                  Use --next and --prev to fetch the deployments deployed after or before the specified (or production) deployment.
    list          List the deployments of a project. Specify the project using --project. Pagination can be controlled with --page and --limit.
    delete [ID]   Delete a deployment. Same options to select the deployment as the show subcommand apply (--id, --project, --next and --prev).
    redeploy [ID] Create a new deployment reusing the build of an existing deployment. You can change various resources associated with the original
                  deployment using the options --prod, --db, --env and --env-file

OPTIONS:
    -h, --help                      Prints this help information
        --id=<deployment-id>        [show,delete,redeploy] Select a deployment by id.
    -p, --project=<NAME|ID>         [show,delete,redeploy] Select the production deployment of a project. Ignored if combined with --id
                                    [list] The project of which to list deployments.
        --next[=pos]                [show,delete,redeploy] Modifier that selects a deployment deployed chronologically after the deployment selected with --id or --project
                                    Can be used multiple times (--next --next is the same as --next=2)
        --prev[=pos]                [show,delete,redeploy] Modifier that selects a deployment deployed chronologically before the deployment selected with --id or --project
                                    Can be used multiple times (--prev --prev is the same as --prev=2)
        --page=<num>                [list] Page of the deployments list to fetch
        --limit=<num>               [list] Amount of deployments to include in the list
        --prod                      [redeploy] Set the production domain mappings to the new deployment. If the project has prod/preview databases and --db is not set
                                    this option also controls which database the new deployment uses.
        --db=<prod|preview|UUID>    [redeploy] Set the database of the new deployment. If not set, will use the preview database if it is a preview deployment and the project
                                    has a preview database, or production otherwise.
        --env=<KEY=VALUE>           [redeploy] Set individual environment variables in a KEY=VALUE format. Can be used multiple times
        --env-file[=FILE]           [redeploy] Set environment variables using a dotenv file. If the file name is not provided, defaults to '.env'. Can be used multiple times.
        --format=<overview|json>    Output the deployment details in an overview or JSON-encoded. Defaults to 'overview' when stdout is a tty, and 'json' otherwise.
        --token=<TOKEN>             The API token to use (defaults to DENO_DEPLOY_TOKEN env var)
        --config=<PATH>             Path to the file from where to load DeployCTL config. Defaults to 'deno.json'
        --color=<auto|always|never> Enable or disable colored output. Defaults to 'auto' (colored when stdout is a tty)
        --force                     [delete] Automatically execute the command without waiting for confirmation.
`;

export default async function (args: Args): Promise<void> {
  if (args.help) {
    console.log(help);
    Deno.exit(0);
  }
  const subcommand = args._.shift();
  switch (subcommand) {
    case "list":
      await listDeployments(args);
      break;
    case "show":
      await showDeployment(args);
      break;
    case "delete":
      await deleteDeployment(args);
      break;
    case "redeploy":
      await redeployDeployment(args);
      break;
    default:
      console.error(help);
      Deno.exit(1);
  }
}

async function listDeployments(args: Args): Promise<void> {
  if (!args.project) {
    error(
      "No project specified. Use --project to specify the project of which to list the deployments",
    );
  }
  const relativeNext = args.next.reduce(
    (prev, next) => prev + parseInt(next || "1"),
    0,
  );
  if (Number.isNaN(relativeNext)) {
    error("Value of --next must be a number");
  }
  const relativePrev = args.prev.reduce(
    (prev, next) => prev + parseInt(next || "1"),
    0,
  );
  if (Number.isNaN(relativePrev)) {
    error("Value of --prev must be a number");
  }
  // User-facing page is 1-based. Paging in API is 0-based.
  const page = parseInt(args.page || "1") + relativeNext - relativePrev;
  if (Number.isNaN(page)) {
    error("Value of --page must be a number");
  }
  if (page < 1) {
    error(`The page cannot be lower than 1. You asked for page '${page}'`);
  }
  const apiPage = page - 1;
  const limit = args.limit ? parseInt(args.limit) : undefined;
  if (Number.isNaN(limit)) {
    error("Value of --limit must be a number");
  }
  let format: "overview" | "json";
  switch (args.format) {
    case "overview":
    case "json":
      format = args.format;
      break;
    case undefined:
      format = isTerminal(Deno.stdout) ? "overview" : "json";
      break;
    default:
      error(
        `Invalid format '${args.format}'. Supported values for the --format option are 'overview' or 'json'`,
      );
  }
  const spinner = wait(
    `Fetching page ${page} of the list of deployments of project '${args.project}'...`,
  )
    .start();
  const api = args.token
    ? API.fromToken(args.token)
    : API.withTokenProvisioner(TokenProvisioner);
  const [deployments, project, databases] = await Promise.all([
    api.listDeployments(
      args.project,
      apiPage,
      limit,
    ),
    api.getProject(args.project),
    api.getProjectDatabases(args.project),
  ]);
  if (!deployments || !project || !databases) {
    spinner.fail(
      `The project '${args.project}' does not exist, or you don't have access to it`,
    );
    return Deno.exit(1);
  }
  spinner.succeed(
    `Page ${page} of the list of deployments of the project '${args.project}' is ready`,
  );

  if (deployments[0].length === 0) {
    wait("").warn(`Page '${page}' is empty`);
    return;
  }

  switch (format) {
    case "overview":
      renderListOverview(
        api,
        project,
        databases,
        deployments[0],
        deployments[1],
      );
      break;
    case "json":
      console.log(JSON.stringify(deployments[0]));
      break;
  }
}

// TODO: Show if active (and maybe some stats?)
async function showDeployment(args: Args): Promise<void> {
  const api = args.token
    ? API.fromToken(args.token)
    : API.withTokenProvisioner(TokenProvisioner);

  let [deploymentId, projectId, build, project]: [
    string,
    string | undefined,
    Build | null | undefined,
    Project | null | undefined,
  ] = await resolveDeploymentId(
    args,
    api,
  );
  let databases: Database[] | null;
  let crons: Cron[] | null;

  const spinner = wait(`Fetching deployment '${deploymentId}' details...`)
    .start();

  // Need to fetch project because the build.project does not include productionDeployment
  [build, project, databases, crons] = projectId
    ? await Promise.all([
      build ? Promise.resolve(build) : api.getDeployment(deploymentId),
      project ? Promise.resolve(project) : api.getProject(projectId),
      api.getProjectDatabases(projectId),
      api.getDeploymentCrons(projectId, deploymentId),
    ])
    : await api.getDeployment(deploymentId).then(async (build) =>
      build
        ? [
          build,
          ...await Promise.all([
            api.getProject(build.project.id),
            api.getProjectDatabases(build.project.id),
            api.getDeploymentCrons(build.project.id, deploymentId),
          ]),
        ]
        : [null, null, null, null]
    );

  if (!build) {
    spinner.fail(
      `The deployment '${deploymentId}' does not exist, or you don't have access to it`,
    );
    return Deno.exit(1);
  }
  if (!project) {
    spinner.fail(
      `The project '${projectId}' does not exist, or you don't have access to it`,
    );
    return Deno.exit(1);
  }
  if (!databases) {
    spinner.fail(
      `Failed to fetch the databases of project '${projectId}'`,
    );
    return Deno.exit(1);
  }
  if (!crons) {
    spinner.fail(
      `Failed to fetch the crons of project '${projectId}'`,
    );
    return Deno.exit(1);
  }
  let organization = project.organization;
  if (!organization.name && !organization.members) {
    // project.organization does not incude members array, and we need it for naming personal orgs
    organization = await api.getOrganizationById(organization.id);
  }
  spinner.succeed(
    `The details of the deployment '${build.deploymentId}' are ready:`,
  );

  let format: "overview" | "json";
  switch (args.format) {
    case "overview":
    case "json":
      format = args.format;
      break;
    case undefined:
      format = isTerminal(Deno.stdout) ? "overview" : "json";
      break;
    default:
      error(
        `Invalid format '${args.format}'. Supported values for the --format option are 'overview' or 'json'`,
      );
  }

  switch (format) {
    case "overview":
      renderShowOverview(build, project, organization, databases, crons);
      break;
    case "json":
      renderShowJson(build, project, organization, databases, crons);
      break;
  }
}

async function deleteDeployment(args: Args): Promise<void> {
  const api = args.token
    ? API.fromToken(args.token)
    : API.withTokenProvisioner(TokenProvisioner);
  const [deploymentId, _projectId, _build, _project] =
    await resolveDeploymentId(
      args,
      api,
    );
  const confirmation = args.force ? true : confirm(
    `${
      magenta("?")
    } Are you sure you want to delete the deployment '${deploymentId}'?`,
  );
  if (!confirmation) {
    wait("").fail("Delete canceled");
    return;
  }
  const spinner = wait(`Deleting deployment '${deploymentId}'...`).start();
  const deleted = await api.deleteDeployment(deploymentId);
  if (deleted) {
    spinner.succeed(`Deployment '${deploymentId}' deleted successfully`);
  } else {
    spinner.fail(
      `Deployment '${deploymentId}' not found, or you don't have access to it`,
    );
  }
}

async function redeployDeployment(args: Args): Promise<void> {
  const api = args.token
    ? API.fromToken(args.token)
    : API.withTokenProvisioner(TokenProvisioner);
  let [deploymentId, mProjectId, mBuild, mProject]: [
    string,
    string | undefined,
    Build | null | undefined,
    Project | null | undefined,
  ] = await resolveDeploymentId(
    args,
    api,
  );
  const spinnerPrep = wait(`Preparing redeployment of '${deploymentId}'...`)
    .start();
  let mDatabases;
  [mBuild, mProject, mDatabases] = await Promise.all([
    mBuild ? Promise.resolve(mBuild) : api.getDeployment(deploymentId),
    mProject === undefined && mProjectId
      ? api.getProject(mProjectId)
      : undefined,
    mProjectId ? api.getProjectDatabases(mProjectId) : undefined,
  ]);
  if (!mBuild) {
    spinnerPrep.fail(
      `The deployment '${deploymentId}' does not exist, or you don't have access to it`,
    );
    return Deno.exit(1);
  }
  const build = mBuild;
  const projectId = build.project.id;
  if (mProject === undefined || mDatabases === undefined) {
    // We didn't have projectId before. Now we do
    [mProject, mDatabases] = await Promise.all([
      mProject ? Promise.resolve(mProject) : api.getProject(projectId),
      mDatabases
        ? Promise.resolve(mDatabases)
        : api.getProjectDatabases(projectId),
    ]);
  }
  if (!mProject) {
    spinnerPrep.fail(
      `The project '${projectId}' does not exist, or you don't have access to it`,
    );
    return Deno.exit(1);
  }
  const project = mProject;
  const databases = mDatabases;

  const alreadyProd =
    project.productionDeployment?.deploymentId === build.deploymentId;
  const prod = args.prod ?? alreadyProd;

  const prodDatabase = databases?.find((database) =>
    deploymentDatabaseEnv(project, database) === "Production"
  );
  const previewDatabase = databases?.find((database) =>
    deploymentDatabaseEnv(project, database) === "Preview"
  );
  const db = resolveDatabase(
    spinnerPrep,
    args,
    prod,
    project,
    prodDatabase,
    previewDatabase,
  );

  const envVarsToAdd = await envVarsFromArgs(args) || {};
  const addedEnvs = Object.keys(envVarsToAdd);
  // If the redeployment sets some env vars, the remaining env vars in the deployment are deleted
  const envVarsToRemove = build.deployment && addedEnvs.length > 0
    ? Object.fromEntries(
      build.deployment.envVars
        .filter((env) => !addedEnvs.includes(env))
        // HOME is always set by Deno Deploy
        .filter((env) => env !== "HOME")
        .map((key) => [key, null]),
    )
    : {};
  const removedEnvs = Object.keys(envVarsToRemove);

  const envVars = {
    ...envVarsToAdd,
    ...envVarsToRemove,
  };

  spinnerPrep.succeed(
    `Redeployment of deployment '${deploymentId}' is ready to begin:`,
  );

  const domainMappingDescription = prod
    ? "The new deployment will be the new production deployment"
    : "The new deployment will be a preview deployment";

  wait({ text: "", indent: 3 }).start().info(domainMappingDescription);
  if (db) {
    const dbTag = db === prodDatabase?.databaseId
      ? "production"
      : db === previewDatabase?.databaseId
      ? "preview"
      : "custom";
    wait({ text: "", indent: 3 }).start().info(
      `The new deployment will use the ${dbTag} database '${db}'`,
    );
  }

  if (addedEnvs.length === 1) {
    wait({ text: "", indent: 3 }).start().info(
      `The new deployment will use the env variable ${addedEnvs[0]}`,
    );
  } else if (addedEnvs.length > 1) {
    wait({ text: "", indent: 3 }).start().info(
      `The new deployment will use the env variables ${
        addedEnvs.slice(0, -1).join(", ")
      } and ${addedEnvs.at(-1)}`,
    );
  }
  if (removedEnvs.length === 1) {
    wait({ text: "", indent: 3 }).start().info(
      `The new deployment will stop using the env variable ${removedEnvs[0]}`,
    );
  } else if (removedEnvs.length > 1) {
    wait({ text: "", indent: 3 }).start().info(
      `The new deployment will stop using the env variables ${
        removedEnvs.slice(0, -1).join(", ")
      } and ${removedEnvs.at(-1)}`,
    );
  }

  const spinner = wait(`Redeploying deployment '${deploymentId}'...`).start();
  const params = {
    prod,
    env_vars: envVars,
    databases: db ? { default: db } : undefined,
  };
  const redeployed = await api.redeployDeployment(deploymentId, params);
  if (redeployed) {
    spinner.succeed(
      `Deployment '${deploymentId}' redeployed as '${redeployed.id}' successfully`,
    );
  } else {
    spinner.fail(
      `Deployment '${deploymentId}' not found, or you don't have access to it`,
    );
  }
}

async function searchRelativeDeployment(
  deployments: AsyncGenerator<Build>,
  deploymentId: string,
  relativePos: number,
): Promise<Build | undefined> {
  const buffer = [];
  for await (const build of deployments) {
    if (relativePos === 0) {
      if (build.deploymentId === deploymentId) {
        return build;
      }
    }
    if (relativePos > 0) {
      if (build.deploymentId === deploymentId) {
        return buffer.pop();
      }
    }
    if (relativePos < 0) {
      if (buffer.pop()?.deploymentId === deploymentId) {
        return build;
      }
    }
    buffer.unshift(build);
    // Truncates array at given length
    buffer.length = Math.abs(relativePos);
  }
}

function renderShowOverview(
  build: Build,
  project: Project,
  organization: Organization,
  databases: Database[],
  crons: Cron[],
) {
  const organizationName = organization.name && cyan(organization.name) ||
    `${cyan(organization.members[0].user.name)} [personal]`;
  const buildError = deploymentError(build)?.ctx.replaceAll(/\s+/g, " ");
  const status = deploymentStatus(project, build);
  const coloredStatus = status === "Failed"
    ? red(bold(status.toUpperCase()))
    : status === "Pending"
    ? yellow(status)
    : status === "Production"
    ? green(bold(status))
    : status;
  const database = deploymentDatabase(databases, build);
  const databaseEnv = database
    ? `${
      greenProd(deploymentDatabaseEnv(project, database))
    } (${database.databaseId})`
    : "n/a";
  const entrypoint = deploymentEntrypoint(build);
  const domains =
    build.deployment?.domainMappings.map((domain) => `https://${domain.domain}`)
      .sort((a, b) => a.length - b.length) ?? [];
  if (domains.length === 0) {
    domains.push("n/a");
  }
  console.log();
  console.log(bold(build.deploymentId));
  console.log(new Array(build.deploymentId.length).fill("-").join(""));
  console.log(`Status:\t\t${coloredStatus}`);
  if (buildError) {
    console.log(`Error:\t\t${buildError}`);
  }
  console.log(
    `Date:\t\t${deploymentRelativeDate(build)} ago (${
      deploymentLocaleDate(build)
    })`,
  );
  if (
    build.deployment?.description &&
    build.deployment.description !== build.relatedCommit?.message
  ) {
    console.log(`Description:\t${build.deployment.description}`);
  }
  console.log(`Project:\t${magenta(project.name)} (${project.id})`);
  console.log(
    `Organization:\t${organizationName} (${project.organizationId})`,
  );
  console.log(
    `Domain(s):\t${domains.join("\n\t\t")}`,
  );
  console.log(`Database:\t${databaseEnv}`);
  console.log(`Entrypoint:\t${entrypoint}`);
  console.log(
    `Env Vars:\t${build.deployment?.envVars.join("\n\t\t") ?? "n/a"}`,
  );
  if (build.relatedCommit) {
    console.log(`Git`);
    console.log(
      `  Ref:\t\t${cyan(build.relatedCommit.branch)} [${
        build.relatedCommit.hash.slice(0, 7)
      }]`,
    );
    console.log(
      `  Message:\t${build.relatedCommit.message.split("\n")[0]}`,
    );
    console.log(
      `  Author:\t${build.relatedCommit.authorName} @${
        magenta(build.relatedCommit.authorGithubUsername)
      } [mailto:${cyan(build.relatedCommit.authorEmail)}]`,
    );
    console.log(`  Url:\t\t${build.relatedCommit.url}`);
  }
  // The API only shows the data of the cron in the production deployment regardless of the deployment queried
  if (status === "Production" && crons.length > 0) {
    console.log(
      `Crons:\t\t${
        crons.map((cron) =>
          `${cron.cron_spec.name} [${cron.cron_spec.schedule}] ${
            renderCronStatus(cron)
          }`
        ).join("\n\t\t")
      }`,
    );
  }
}

function renderShowJson(
  build: Build,
  project: Project,
  organization: Organization,
  databases: Database[],
  crons: Cron[],
) {
  console.log(
    JSON.stringify({ build, project, organization, databases, crons }),
  );
}

async function renderListOverview(
  api: API,
  project: Project,
  databases: Database[],
  deployments: Build[],
  paging: PagingInfo,
) {
  const sld = new URL(endpoint()).hostname.split(".").at(-2);
  for (;;) {
    const table = deployments.map((build) => {
      const status = deploymentStatus(project, build);
      const colorByStatus = (s: string) =>
        status === "Failed"
          ? red(stripAnsiCode(s))
          : status === "Production"
          ? green(s)
          : status === "Pending"
          ? yellow(s)
          : s;
      const database = deploymentDatabase(databases, build);
      const databaseEnv = database
        ? greenProd(deploymentDatabaseEnv(project, database))
        : "n/a";
      const relativeDate = stripAnsiCode(
        deploymentRelativeDate(build).split(", ")[0].trim(),
      );
      const date = `${deploymentLocaleDate(build)} (${relativeDate})`;
      const row = {
        Deployment: colorByStatus(build.deploymentId),
        Date: colorByStatus(date),
        Status: colorByStatus(status),
        Database: colorByStatus(databaseEnv),
        Domain: colorByStatus(
          !isReady(status)
            ? "n/a"
            : `https://${project.name}-${build.deploymentId}.${sld}.dev`,
        ),
        Entrypoint: colorByStatus(deploymentEntrypoint(build)),
        ...build.relatedCommit
          ? {
            Branch: colorByStatus(build.relatedCommit.branch),
            Commit: colorByStatus(build.relatedCommit.hash.slice(0, 7)),
          }
          : {},
      };
      return row;
    });
    renderTable(table);

    if (paging.page + 1 >= paging.totalPages) {
      return;
    }
    alert(`Press enter to fetch the next page`);
    tty.goUpSync(1, Deno.stdout);
    tty.clearDownSync(Deno.stdout);
    const nextPage = paging.page + 1;
    const spinner = wait(
      `Fetching page ${
        // API page param is 0-based
        nextPage +
        1} of the list of deployments of project '${project.name}'...`,
    )
      .start();
    const deploymentsNextPage = await api.listDeployments(
      project.id,
      nextPage,
      paging.limit,
    );
    if (!deploymentsNextPage) {
      spinner.fail(
        `The project '${project.name}' does not exist, or you don't have access to it`,
      );
      return Deno.exit(1);
    }
    deployments = deploymentsNextPage[0];
    paging = deploymentsNextPage[1];
    spinner.succeed(
      `Page ${
        paging.page + 1
      } of the list of deployments of the project '${project.name}' is ready`,
    );
  }
}

function isCurrentProd(project: Project, build: Build): boolean {
  return project.productionDeployment?.id === build.id;
}

function deploymentError(build: Build): DeploymentProgressError | undefined {
  return build.logs.find((log): log is DeploymentProgressError =>
    log.type === "error"
  );
}

function deploymentStatus(
  project: Project,
  build: Build,
): DeploymentStatus {
  const isError = deploymentError(build) !== undefined;
  const isPending = !isError &&
    (build.deployment === null ||
      build.deployment.domainMappings.length === 0);
  return isError
    ? "Failed"
    : isPending
    ? "Pending"
    : isCurrentProd(project, build)
    ? "Production"
    : "Preview";
}

function isReady(status: DeploymentStatus): boolean {
  return ["Production", "Preview"].includes(status);
}

function deploymentDatabase(
  databases: Database[],
  build: Build,
): Database | undefined {
  return databases.find((db) =>
    db.databaseId === build.deployment?.kvDatabases["default"]
  );
}

function deploymentLocaleDate(build: Build): string {
  return new Date(build.createdAt).toLocaleString(navigator.language, {
    timeZoneName: "short",
  });
}

function renderTimeDelta(delta: number): string {
  const sinces = [delta];
  const sinceUnits = ["milli"];
  if (sinces[0] >= 1000) {
    sinces.push(Math.floor(sinces[0] / 1000));
    sinces[0] = sinces[0] % 1000;
    sinceUnits.push("second");
  }
  if (sinces[1] >= 60) {
    sinces.push(Math.floor(sinces[1] / 60));
    sinces[1] = sinces[1] % 60;
    sinceUnits.push("minute");
  }

  if (sinces[2] >= 60) {
    sinces.push(Math.floor(sinces[2] / 60));
    sinces[2] = sinces[2] % 60;
    sinceUnits.push("hour");
  }

  if (sinces[3] >= 24) {
    sinces.push(Math.floor(sinces[3] / 24));
    sinces[3] = sinces[3] % 24;
    sinceUnits.push("day");
  }

  if (sinces.length > 1) {
    // remove millis if there are already seconds
    sinces.shift();
    sinceUnits.shift();
  }

  sinces.reverse();
  sinceUnits.reverse();
  let sinceStr = "";
  for (let x = 0; x < sinces.length; x++) {
    const since = sinces[x];
    let sinceUnit = sinceUnits[x];
    if (since === 0) continue;
    if (sinceStr) {
      sinceStr += ", ";
    }
    if (sinces[x] > 1) {
      sinceUnit += "s";
    }
    sinceStr += `${since} ${sinceUnit}`;
    if (x === 0) {
      sinceStr = yellow(sinceStr);
    }
  }
  return sinceStr;
}

function deploymentRelativeDate(build: Build): string {
  const createdAt = new Date(build.createdAt);
  return renderTimeDelta(new Date().getTime() - createdAt.getTime());
}

function deploymentEntrypoint(build: Build): string {
  return build.deployment
    ? fromFileUrl(build.deployment.url).replace("/src/", "")
    : "n/a";
}

function deploymentDatabaseEnv(
  project: Project,
  database: Database,
): DatabaseEnv {
  return project.git && project.git.productionBranch !== database!.branch
    ? "Preview"
    : "Production";
}

function renderTable(table: Record<string, string>[]) {
  const headers = Object.keys(table[0]);
  const widths: number[] = [];
  for (const rowData of table) {
    for (const [i, value] of Object.values(rowData).entries()) {
      widths[i] = Math.max(
        widths[i] ?? 0,
        stripAnsiCode(value).length,
        headers[i].length,
      );
      widths[i] = widths[i] + widths[i] % 2;
    }
  }
  const headerRow = headers.map((header, i) => {
    const pad = " ".repeat(
      Math.max(widths[i] - stripAnsiCode(header).length, 0) / 2,
    );
    return `${pad}${header}${pad}`.padEnd(widths[i], " ");
  }).join(" \u2502 ");
  const divisor = "\u2500".repeat(
    widths.reduce((prev, next) => prev + next, 0) + (headers.length - 1) * 3,
  );
  console.log(`\u250c\u2500${divisor}\u2500\u2510`);
  console.log(`\u2502 ${headerRow} \u2502`);
  console.log(`\u251c\u2500${divisor}\u2500\u2524`);
  for (const rowData of table) {
    const row = Array.from(Object.values(rowData).entries(), ([i, cell]) => {
      const pad = " ".repeat(widths[i] - stripAnsiCode(cell).length);
      return `${cell}${pad}`;
    }).join(" \u2502 ");
    console.log(`\u2502 ${row} \u2502`);
  }
  console.log(`\u2514\u2500${divisor}\u2500\u2518`);
}

function renderCronStatus(cron: Cron): string {
  if (!cron.status) {
    return "n/a";
  }
  switch (cron.status.status) {
    case "unscheduled":
      return `${
        cron.history.length > 0
          ? `${renderLastCronExecution(cron.history[0][0])} `
          : ""
      }(unscheduled)`;
    case "executing":
      if (cron.status.retries.length > 0) {
        return `${
          renderLastCronExecution(cron.status.retries[0])
        } (retrying...)`;
      } else {
        return "(executing...)";
      }
    case "scheduled":
      return `${
        cron.history.length > 0
          ? `${renderLastCronExecution(cron.history[0][0])} `
          : ""
      }(next at ${
        new Date(cron.status.deadline_ms).toLocaleString(navigator.language, {
          timeZoneName: "short",
        })
      })`;
  }
}

function renderLastCronExecution(execution: CronExecutionRetry): string {
  const start = new Date(execution.start_ms);
  const end = new Date(execution.end_ms);
  const duration = end.getTime() - start.getTime();
  const status = execution.status === "success"
    ? green("succeeded")
    : execution.status === "failure"
    ? red("failed")
    : "executing";
  return `${status} at ${
    start.toLocaleString(navigator.language, { timeZoneName: "short" })
  } after ${stripAnsiCode(renderTimeDelta(duration))}`;
}

async function resolveDeploymentId(
  args: Args,
  api: API,
): Promise<
  [DeploymentId, ProjectId | undefined, Build | undefined, Project | undefined]
> {
  const deploymentIdArg = args._.shift()?.toString() || args.id;
  // Ignore --project if user also provided --id
  const projectIdArg = deploymentIdArg ? undefined : args.project;

  let deploymentId,
    projectId: string | undefined,
    build: Build | undefined,
    project: Project | undefined;

  if (deploymentIdArg) {
    deploymentId = deploymentIdArg;
  } else {
    // Default to showing the production deployment of the project or the last
    if (!projectIdArg) {
      error(
        "No deployment or project specified. Use --id <deployment-id> or --project <project-name>",
      );
    }
    projectId = projectIdArg;

    if (args.last) {
      const spinner = wait(
        `Searching the last deployment of project '${projectId}'...`,
      ).start();
      const deployments = await api.listDeployments(projectId, 0, 1);
      if (!deployments) {
        spinner.fail(
          `The project '${projectId}' does not exist, or you don't have access to it`,
        );
        return Deno.exit(1);
      }
      if (deployments[0].length === 0) {
        spinner.fail(
          `The project '${projectId}' does not have any deployment yet`,
        );
        return Deno.exit(1);
      }
      deploymentId = deployments[0][0].deploymentId;
      spinner.succeed(
        `The last deployment of the project '${projectId}' is '${deploymentId}'`,
      );
    } else {
      const spinner = wait(
        `Searching the production deployment of project '${projectId}'...`,
      ).start();
      const maybeProject = await api.getProject(projectId);
      if (!maybeProject) {
        spinner.fail(
          `The project '${projectId}' does not exist, or you don't have access to it`,
        );
        return Deno.exit(1);
      }
      project = maybeProject;
      if (!project.productionDeployment) {
        spinner.fail(
          `Project '${project.name}' does not have a production deployment. Use --id <deployment-id> to specify the deployment to show`,
        );
        return Deno.exit(1);
      }
      deploymentId = project.productionDeployment.deploymentId;
      spinner.succeed(
        `The production deployment of the project '${project.name}' is '${deploymentId}'`,
      );
    }
  }

  if (args.prev.length !== 0 || args.next.length !== 0) {
    // Search the deployment relative to the specified deployment
    if (!projectId) {
      // Fetch the deployment specified with --id, to know of which project to search the relative deployment
      // If user didn't use --id, they must have used --project, thus we already know the project-id
      const spinner_ = wait(`Fetching deployment '${deploymentId}'...`)
        .start();
      const specifiedDeployment = await api.getDeployment(deploymentId);
      if (!specifiedDeployment) {
        spinner_.fail(
          `The deployment '${deploymentId}' does not exist, or you don't have access to it`,
        );
        return Deno.exit(1);
      }
      spinner_.succeed(`Deployment '${deploymentId}' found`);
      projectId = specifiedDeployment.project.id;
    }
    let relativePos = 0;
    for (const prev of args.prev) {
      relativePos -= parseInt(prev || "1");
    }
    for (const next of args.next) {
      relativePos += parseInt(next || "1");
    }
    if (Number.isNaN(relativePos)) {
      error("Value of --next and --prev must be a number");
    }
    const relativePosString = relativePos.toLocaleString(navigator.language, {
      signDisplay: "exceptZero",
    });
    const spinner = wait(
      `Searching the deployment ${relativePosString} relative to '${deploymentId}'...`,
    ).start();
    const maybeBuild = await searchRelativeDeployment(
      api.listAllDeployments(projectId),
      deploymentId,
      relativePos,
    );
    if (!maybeBuild) {
      spinner.fail(
        `The deployment '${deploymentId}' does not have a deployment ${relativePosString} relative to it`,
      );
      return Deno.exit(1);
    }
    build = maybeBuild;
    deploymentId = build.deploymentId;
    spinner.succeed(
      `The deployment ${relativePosString} relative to '${deploymentId}' is '${build.deploymentId}'`,
    );
  }
  return [deploymentId, projectId, build, project];
}

function resolveDatabase(
  spinner: Spinner,
  args: Args,
  prod: boolean,
  project: Project,
  prodDatabase: Database | undefined,
  previewDatabase: Database | undefined,
): string | undefined {
  let db;
  switch (args.db?.toLowerCase().trim()) {
    case "prod":
    case "production": {
      if (!prodDatabase) {
        spinner.fail(
          `Project '${project.name}' does not have a production database`,
        );
        return Deno.exit(1);
      }
      db = prodDatabase.databaseId;
      break;
    }
    case "preview": {
      if (!previewDatabase) {
        spinner.fail(
          `Project '${project.name}' does not have a preview database`,
        );
        return Deno.exit(1);
      }
      db = previewDatabase.databaseId;
      break;
    }
    default:
      db = args.db;
  }

  if (!db) {
    // For GitHub deployments, Deploy assigns the branch database also during redeployment
    // Unless the user is explicit about the db, we want to maintain the invariant status == databaseEnv
    if (prod) {
      db = prodDatabase?.databaseId;
    } else {
      db = previewDatabase?.databaseId;
    }
  }
  return db;
}

function greenProd(s: "Production" | string): string {
  return s === "Production" ? green(s) : s;
}

type DeploymentStatus = "Failed" | "Pending" | "Production" | "Preview";
type DatabaseEnv = "Production" | "Preview";
type DeploymentId = string;
type ProjectId = string;
