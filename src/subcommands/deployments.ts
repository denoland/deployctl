import { Args } from "../args.ts";
import { API, endpoint } from "../utils/api.ts";
import TokenProvisioner from "../utils/access_token.ts";
import { wait } from "../utils/spinner.ts";
import {
  Build,
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
  stripColor,
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

The simples form of the command will list the first 20 deployments of the project you are currently
in (project will be picked up from the config file):

    deployctl deployments list

You can list the rest of the deployments using --page, --next or --prev:

    deployctl deployments list --page=2

You can specify the project to list deployments of with the --project option:

    deployctl deployments list --project=my-other-project


USAGE:
    deployctl deployments <SUBCOMMAND> [OPTIONS]

SUBCOMMANDS:
    show [ID]   View details of a deployment. Specify the deployment with a positional argument or the --id option; otherwise, it will 
                show the details of the current production deployment of the project specified in the config file or with the --project option.
                Use --next and --prev to fetch the deployments deployed after or before the specified (or production) deployment.
    list        List the deployments of a project. Specify the project using --project. Pagination can be controlled with --page, --limit,
                --next and --prev. 

OPTIONS:
    -h, --help                      Prints this help information
        --id=<deployment-id>        [show] Id of the deployment of which to show details
    -p, --project=<NAME|ID>         [show] The project the production deployment of which to show the details. Ignored if combined with --id
                                    [list] The project of which to list deployments.
        --next[=pos]                [show] Show the details of a deployment deployed after the specified deployment
                                    [list] Fetch the next page of the list
                                    Can be used multiple times (--next --next is the same as --next=2)
        --prev[=pos]                [show] Show the details of a deployment deployed before the specified deployment.
                                    [list] Fetch the previous page of the list
                                    Can be used multiple times (--prev --prev is the same as --prev=2)
        --page=<num>                [list] Page of the deployments list to fetch
        --limit=<num>               [list] Amount of deployments to include in the list
        --format=<overview|json>    Output the deployment details in an overview or JSON-encoded. Defaults to 'overview' when stdout is a tty, and 'json' otherwise.
        --token=<TOKEN>             The API token to use (defaults to DENO_DEPLOY_TOKEN env var)
        --config=<PATH>             Path to the file from where to load DeployCTL config. Defaults to 'deno.json'
        --color=<auto|always|never> Enable or disable colored output. Defaults to 'auto' (colored when stdout is a tty)
        --force                     Automatically execute the command without waiting for confirmation.
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
  const relativePrev = args.prev.reduce(
    (prev, next) => prev + parseInt(next || "1"),
    0,
  );
  // User-facing page is 1-based. Paging in API is 0-based.
  const page = parseInt(args.page || "1") + relativeNext - relativePrev;
  if (page < 1) {
    error(`The page cannot be lower than 1. You asked for page '${page}'`);
  }
  const apiPage = page - 1;
  const limit = args.limit ? parseInt(args.limit) : undefined;
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
  const deploymentIdArg = args._.shift()?.toString() || args.id;
  // Ignore --project if user also provided --id
  const projectIdArg = deploymentIdArg ? undefined : args.project;

  const api = args.token
    ? API.fromToken(args.token)
    : API.withTokenProvisioner(TokenProvisioner);

  let deploymentId,
    projectId,
    build: Build | null | undefined,
    project: Project | null | undefined,
    databases: Database[] | null;

  if (deploymentIdArg) {
    deploymentId = deploymentIdArg;
  } else {
    // Default to showing the production deployment of the project
    if (!projectIdArg) {
      error(
        "No deployment or project specified. Use --id <deployment-id> or --project <project-name>",
      );
    }
    projectId = projectIdArg;
    const spinner = wait(
      `Searching production deployment of project '${projectId}'...`,
    ).start();
    project = await api.getProject(projectId);
    if (!project) {
      spinner.fail(
        `The project '${projectId}' does not exist, or you don't have access to it`,
      );
      return Deno.exit(1);
    }
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
    spinner.succeed(
      `The deployment ${relativePosString} relative to '${deploymentId}' is '${build.deploymentId}'`,
    );
  }

  const spinner = wait(`Fetching deployment '${deploymentId}' details...`)
    .start();

  // Need to fetch project because the build.project does not include productionDeployment
  [build, project, databases] = projectId
    ? await Promise.all([
      build ? Promise.resolve(build) : api.getDeployment(deploymentId),
      project ? Promise.resolve(project) : api.getProject(projectId),
      api.getProjectDatabases(projectId),
    ])
    : await api.getDeployment(deploymentId).then(async (build) =>
      build
        ? [
          build,
          ...await Promise.all([
            api.getProject(build.project.id),
            api.getProjectDatabases(build.project.id),
          ]),
        ]
        : [null, null, null]
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
  const organization = project.organization;
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
      renderShowOverview(build, project, organization, databases);
      break;
    case "json":
      renderShowJson(build, project, organization, databases);
      break;
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
      if (build.deploymentId == deploymentId) {
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
  if (isReady(status) && !database) {
    error(
      `Unexpected error: deployment uses a database not in the list of databases of the project`,
    );
  }
  const databaseEnv = database
    ? `${deploymentDatabaseEnv(project, database)} (${database.databaseId})`
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
      `  Ref:\t\t${cyan("<Branch (soon)>")} [${
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
}

function renderShowJson(
  build: Build,
  project: Project,
  organization: Organization,
  databases: Database[],
) {
  console.log(JSON.stringify({ build, project, organization, databases }));
}

async function renderListOverview(
  api: API,
  project: Project,
  databases: Database[],
  deployments: Build[],
  paging: PagingInfo,
) {
  const ingressRoot = new URL(endpoint()).hostname.split(".").at(-2);
  for (;;) {
    const table = deployments.map((build) => {
      const status = deploymentStatus(project, build);
      const colorByStatus = (s: string) =>
        status === "Failed"
          ? red(stripColor(s))
          : status === "Production"
          ? green(s)
          : status === "Pending"
          ? yellow(s)
          : s;
      const database = deploymentDatabase(databases, build);
      if (isReady(status) && !database) {
        error(
          `Unexpected error: deployment uses a database not in the list of databases of the project`,
        );
      }
      const databaseEnv = database
        ? deploymentDatabaseEnv(project, database)
        : "n/a";
      const relativeDate = stripColor(
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
            : `https://${project.name}-${build.deploymentId}.${ingressRoot}.dev`,
        ),
        Entrypoint: colorByStatus(deploymentEntrypoint(build)),
        ...build.relatedCommit
          ? {
            Branch: colorByStatus("<Branch (soon)>"),
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

type DeploymentStatus = "Failed" | "Pending" | "Production" | "Preview";

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

function deploymentRelativeDate(build: Build): string {
  const createdAt = new Date(build.createdAt);
  const sinces = [new Date().getTime() - createdAt.getTime()];
  const sinceUnits = ["milliseconds ago"];
  if (sinces[0] >= 1000) {
    // Remove milis
    sinces[0] = Math.floor(sinces[0] / 1000);
    sinceUnits[0] = "second";
  }
  if (sinces[0] >= 60) {
    sinces.push(Math.floor(sinces[0] / 60));
    sinces[0] = sinces[0] % 60;
    sinceUnits.push("minute");
  }

  if (sinces[1] >= 60) {
    sinces.push(Math.floor(sinces[1] / 60));
    sinces[1] = sinces[1] % 60;
    sinceUnits.push("hour");
  }

  if (sinces[2] >= 24) {
    sinces.push(Math.floor(sinces[2] / 24));
    sinces[2] = sinces[2] % 24;
    sinceUnits.push("day");
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

function deploymentEntrypoint(build: Build): string {
  return build.deployment
    ? fromFileUrl(build.deployment.url).replace("/src/", "")
    : "n/a";
}

function deploymentDatabaseEnv(
  project: Project,
  database: Database,
): string {
  return project.git && project.git.productionBranch !== database!.branch
    ? "Preview"
    : green("Production");
}

function renderTable(table: Record<string, string>[]) {
  const headers = Object.keys(table[0]);
  const widths: number[] = [];
  for (const rowData of table) {
    for (const [i, value] of Object.values(rowData).entries()) {
      widths[i] = Math.max(
        widths[i] ?? 0,
        stripColor(value).length,
        headers[i].length,
      );
      widths[i] = widths[i] + widths[i] % 2;
    }
  }
  const headerRow = headers.map((header, i) => {
    const pad = " ".repeat(
      Math.max(widths[i] - stripColor(header).length, 0) / 2,
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
      const pad = " ".repeat(widths[i] - stripColor(cell).length);
      return `${cell}${pad}`;
    }).join(" \u2502 ");
    console.log(`\u2502 ${row} \u2502`);
  }
  console.log(`\u2514\u2500${divisor}\u2500\u2518`);
}
