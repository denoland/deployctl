import { Args } from "../args.ts";
import { API } from "../utils/api.ts";
import TokenProvisioner from "../utils/access_token.ts";
import { wait } from "../utils/spinner.ts";
import { Build, Database, Organization, Project } from "../utils/api_types.ts";
import { bold, cyan, fromFileUrl, green, magenta, yellow } from "../../deps.ts";
import { error } from "../error.ts";
import { isTerminal } from "../utils/mod.ts";

const help = `Manage deployments in Deno Deploy

## SHOW

Fetch the all the details of a deployment using deployctl deployments show. You can fetch the details of the production deployment of
the project you are currently in (project will be picked up from the config file):

    deployctl deployments show

And you can also navigate the list of deployments using --prev and --next. --prev will show you 1 deployment before the current production
deployment:

    deployctl deployments show --prev

To see the deployment before that, you can either add another --prev, or use --prev=2:

    deployctl deployments show --prev --prev

You can also see the production deployment of any project using --project:

    deployctl deployments show --project=my-other-project

Or just show the details of an specific deployment, of any project, using --id. This can also be combined with --prev and --next too:

    deployctl deployments show --id=p63c39ck5feg --next

USAGE:
    deployctl deployments <SUBCOMMAND> [OPTIONS]

SUBCOMMANDS:
    show [ID]   View details of a deployment. Specify the deployment with a positional argument or the --id option; otherwise, it will 
                show the details of the current production deployment of the project specified in the config file or with the --project option.
                Use --next and --prev to fetch the deployments deployed after or before to the specified (or production) deployment.


OPTIONS:
    -h, --help                      Prints this help information
        --id=<deployment-id>        Id of the deployment of which to show details
        --next[=pos]                Show the details of a deployment deployed after the specified deployment.
                                    Can be used multiple times (--next --next is the same as --next=2)
        --prev[=pos]                Show the details of a deployment deployed before the specified deployment.
                                    Can be used multiple times (--prev --prev is the same as --prev=2)
    -p, --project=<NAME|ID>         The project the production deployment of which to show the details. Ignored if combined with --id
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
    case "show":
      await showDeployment(args);
      break;
    default:
      console.error(help);
      Deno.exit(1);
  }
}

// TODO: Show if active (and maybe some stats?)
async function showDeployment(args: Args): Promise<void> {
  let deploymentId = args._.shift()?.toString() || args.id;
  let project, organization, databases;
  const api = args.token
    ? API.fromToken(args.token)
    : API.withTokenProvisioner(TokenProvisioner);

  if (!deploymentId) {
    // Default to showing the production deployment of the project
    if (!args.project) {
      error(
        "No deployment or project specified. Use --id <deployment-id> or --project <project-name>",
      );
    }
    const spinner = wait(
      `Searching production deployment of project '${args.project}'...`,
    ).start();
    project = await api.getProject(args.project);
    if (!project) {
      spinner.fail(
        `The project '${args.project}' does not exist, or you don't have access to it`,
      );
      return Deno.exit(1);
    }
    if (!project.productionDeployment) {
      spinner.fail(
        `Project '${project.name}' does not have a production deployment. Use --id <deployment-id> to specify the deployment to show`,
      );
      return Deno.exit(1);
    }
    // NULL SAFETY: Deploy ensures the deployment is successful before promoting it to production, thus it cannot be null
    deploymentId = project.productionDeployment.deployment!.id;
    spinner.succeed(
      `The production deployment of the project '${project.name}' is '${deploymentId}'`,
    );
  }

  let build;
  if (args.prev.length !== 0 || args.next.length !== 0) {
    if (!project) {
      if (!args.project) {
        error(
          "No deployment or project specified. Use --id <deployment-id> or --project <project-name>",
        );
      }
      const projectSpinner = wait(`Fetching project '${args.project}'...`)
        .start();
      project = await api.getProject(args.project);
      if (!project) {
        projectSpinner.fail(
          `The project '${args.project}' does not exist, or you don't have access to it`,
        );
        return Deno.exit(1);
      }
      projectSpinner.succeed(`Project '${project.name}' found`);
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
      api.listAllDeployments(project.id),
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
      `The deployment ${relativePosString} relative to '${deploymentId}' is '${
        // NULL SAFETY: the subcommand searches by deployment id, thus the build must have the deployment
        build.deployment!.id}'`,
    );
  }

  const spinner = wait(`Fetching deployment '${deploymentId}' details...`)
    .start();

  if (!build) {
    build = await api.getDeployment(deploymentId);
    if (!build) {
      spinner.fail(
        `The deployment '${deploymentId}' does not exist, or you don't have access to it`,
      );
      return Deno.exit(1);
    }
  }

  // Need to fetch project because the build.project does not include productionDeployment
  // Need to fetch organization because build.project does not include organization
  [project, organization, databases] = await Promise.all([
    project ? Promise.resolve(project) : api.getProject(build.project.id),
    api.getOrganizationById(
      (project || build.project).organizationId,
    ),
    api.getProjectDatabases((project || build.project).id),
  ]);
  if (!project) {
    spinner.fail(
      `The project '${build.project.id}' does not exist, or you don't have access to it`,
    );
    return Deno.exit(1);
  }
  if (!organization) {
    spinner.fail(
      `The organization '${build.project.organizationId}' does not exist, or you don't have access to it`,
    );
    return Deno.exit(1);
  }
  spinner.succeed(
    `The details of the deployment '${build.deployment!.id}' are ready:`,
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
      renderOverview(build, project, organization, databases);
      break;
    case "json":
      renderJson(build, project, organization, databases);
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
      if (build.deployment?.id == deploymentId) {
        return build;
      }
    }
    if (relativePos > 0) {
      if (build.deployment?.id === deploymentId) {
        return buffer.pop();
      }
    }
    if (relativePos < 0) {
      if (buffer.pop()?.deployment?.id === deploymentId) {
        return build;
      }
    }
    buffer.unshift(build);
    // Truncates array at given length
    buffer.length = Math.abs(relativePos);
  }
}

function renderOverview(
  build: Build,
  project: Project,
  organization: Organization,
  databases: Database[],
) {
  const organizationName = organization.name && cyan(organization.name) ||
    `${cyan(organization.members[0].user.name)} [personal]`;
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
      sinceStr = green(sinceStr);
    }
  }
  const isCurrentProd = project.productionDeployment?.id === build.id;
  const status = isCurrentProd ? yellow(bold("Production")) : "Preview";
  const database = databases.find((db) =>
    // NULL SAFETY: At this point build cannot ever be undefined
    db.databaseId === build!.deployment!.kvDatabases["default"]
  );
  if (!database) {
    error(
      `Unexpected error: deployment uses a database not in the list of databases of the project`,
    );
  }
  const databaseEnv =
    project.git && project.git.productionBranch !== database.branch
      ? "Preview"
      : yellow(bold("Production"));
  const entrypoint = fromFileUrl(build.deployment!.url).replace("/src", "");
  console.log();
  console.log(bold(green(build.deployment!.id)));
  console.log(new Array(build.deployment!.id.length).fill("-").join(""));
  console.log(`Status:\t\t${status}`);
  console.log(`Date:\t\t${sinceStr} ago (${createdAt.toLocaleString()})`);
  console.log(`Project:\t${magenta(project.name)} (${project.id})`);
  console.log(
    `Organization:\t${organizationName} (${project.organizationId})`,
  );
  console.log(
    `Domain(s):\t${
      build.deployment!.domainMappings.map((domain) =>
        `https://${domain.domain}`
      ).sort((a, b) => a.length - b.length).join(
        "\n\t\t",
      )
    }`,
  );
  console.log(`Database:\t${databaseEnv} (${database.databaseId})`);
  console.log(`Entrypoint:\t${entrypoint}`);
  console.log(
    `Env Vars:\t${build.deployment!.envVars.join("\n\t\t")}`,
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

function renderJson(
  build: Build,
  project: Project,
  organization: Organization,
  databases: Database[],
) {
  console.log(JSON.stringify({ build, project, organization, databases }));
}
