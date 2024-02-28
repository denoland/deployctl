import { Args } from "../args.ts";
import { API, APIError, endpoint } from "../utils/api.ts";
import TokenProvisioner from "../utils/access_token.ts";
import { wait } from "../utils/spinner.ts";
import { Organization, Project } from "../utils/api_types.ts";
import { bold, green, magenta, red } from "../../deps.ts";
import { error } from "../error.ts";
import organization from "../utils/organization.ts";

const help = `Manage projects in Deno Deploy

USAGE:
    deployctl projects <SUBCOMMAND> [OPTIONS]

SUBCOMMANDS:
    list            List the name of all the projects accessible by the user
    show            View details of a project. Specify the project using the --project option; otherwise, it will 
                    show the details of the project specified in the config file or try to guess it from the working context
    delete          Delete a project. Specify the project in the same way as the show subcommand
    create          Create a new project. Specify the project name in the same way as the show subcommand 
    rename <NAME>   Change the name of the project. Specify the project in the same way as the show subcommand


OPTIONS:
    -h, --help                      Prints this help information
    -p, --project=<NAME|ID>         The project selected. 
        --org=<ORG>                 Specify an organization. When creating a project, defaults to the user's personal organization.
                                    When listing projects, use "personal" to filter by the personal organization.
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
      await listProjects(args);
      break;
    case "show":
      await showProject(args);
      break;
    case "delete":
      await deleteProject(args);
      break;
    case "create":
      await createProject(args);
      break;
    case "rename":
      await renameProject(args);
      break;
    default:
      console.error(help);
      Deno.exit(1);
  }
}

async function listProjects(args: Args): Promise<void> {
  const spinner = wait("Fetching organizations and projects...").start();
  const api = args.token
    ? API.fromToken(args.token)
    : API.withTokenProvisioner(TokenProvisioner);
  const orgs = (await api.listOrganizations()).filter((org) =>
    args.org
      ? (org.name
        ? org.name === args.org
        : args.org.toLowerCase() === "personal")
      : true
  );
  const data: [Organization, Project[]][] = await Promise.all(
    orgs.map(async (org) => [org, await api.listProjects(org.id)]),
  );
  spinner.succeed("Organizations and projects data ready:");
  data.sort(([_orga, projectsa], [_orgb, projectsb]) =>
    projectsb.length - projectsa.length
  );
  for (const [org, projects] of data) {
    if (projects.length === 0) continue;
    console.log();
    console.log(
      org.name && `'${bold(magenta(org.name))}' org:` || "Personal org:",
    );
    for (const project of projects) {
      console.log(`    ${green(project.name)}`);
    }
  }
}

async function showProject(args: Args): Promise<void> {
  if (!args.project) {
    error(
      "No project specified. Use --project to specify the project of which to show the details",
    );
  }
  const spinner = wait(`Fetching project '${args.project}'...`).start();
  const api = args.token
    ? API.fromToken(args.token)
    : API.withTokenProvisioner(TokenProvisioner);
  const [project, domains, pagedBuilds, databases] = await Promise.all([
    api.getProject(args.project),
    api.getDomains(args.project),
    api.listDeployments(args.project),
    api.getProjectDatabases(args.project),
  ]).catch((err) => {
    if (err instanceof APIError && err.code === "projectNotFound") {
      return [null, null, null];
    }
    throw err;
  });

  if (!project || !domains || !pagedBuilds || !databases) {
    spinner.fail(
      `The project '${args.project}' does not exist, or you don't have access to it`,
    );
    return Deno.exit(1);
  }
  const organizationName = project.organization.name
    ? magenta(project.organization.name)
    : `${
      magenta(
        // If project exists, organization must also exist
        (await api.getOrganizationById(project.organization.id))!.members[0]
          .user
          .name,
      )
    } [personal]`;
  spinner.succeed(`Project '${args.project}' found`);
  console.log();
  console.log(bold(project.name));
  console.log(new Array(project.name.length).fill("-").join(""));
  console.log(`Organization:\t${organizationName} (${project.organizationId})`);
  const ingressRoot = new URL(endpoint()).hostname.split(".").at(-2);
  domains.push({
    domain: `${project.name}.${ingressRoot}.dev`,
    isValidated: true,
  });
  const validatedDomains = domains.filter((domain) => domain.isValidated);
  console.log(
    `Domain(s):\t${
      validatedDomains.map((domain) => `https://${domain.domain}`).join(
        "\n\t\t",
      )
    }`,
  );
  console.log(`Dash URL:\t${endpoint()}/projects/${project.id}`);
  if (project.type === "playground") {
    console.log(`Playground:\t${endpoint()}/playground/${project.name}`);
  }
  if (project.git) {
    console.log(
      `Repository:\thttps://github.com/${project.git.repository.owner}/${project.git.repository.name}`,
    );
  }
  if (databases.length > 0) {
    console.log(
      `Databases:\t${
        databases.map((db) => `[${db.branch}] ${db.databaseId}`).join(`\n\t\t`)
      }`,
    );
  }
  const [builds, _] = pagedBuilds;
  if (builds.length > 0) {
    console.log(
      `Deployments:${
        builds.map((build, i) =>
          `${i !== 0 && i % 5 === 0 ? "\n\t\t" : "\t"}${
            build.deployment
              ? project.productionDeployment?.deployment?.id ===
                  build.deployment.id
                ? `${magenta(build.deployment.id)}*`
                : build.deployment.id
              : `${red("✖")} (failed)`
          }`
        ).join("")
      }`,
    );
  }
}

async function deleteProject(args: Args): Promise<void> {
  if (!args.project) {
    error(
      "No project specified. Use --project to specify the project to delete",
    );
  }
  const fetchSpinner = wait(`Fetching project '${args.project}' details...`)
    .start();
  const api = args.token
    ? API.fromToken(args.token)
    : API.withTokenProvisioner(TokenProvisioner);
  const project = await api.getProject(args.project);
  if (!project) {
    fetchSpinner.fail(
      `Project '${args.project}' not found, or you don't have access to it`,
    );
    return Deno.exit(1);
  }
  fetchSpinner.succeed(`Project '${project.name}' (${project.id}) found`);
  const confirmation = args.force ? true : confirm(
    `${
      magenta("?")
    } Are you sure you want to delete the project '${project.name}'?`,
  );
  if (!confirmation) {
    wait("").fail("Delete canceled");
    return;
  }
  const spinner = wait(`Deleting project '${args.project}'...`).start();
  const deleted = await api.deleteProject(args.project);
  if (deleted) {
    spinner.succeed(`Project '${args.project}' deleted successfully`);
  } else {
    spinner.fail(
      `Project '${args.project}' not found, or you don't have access to it`,
    );
  }
}

async function createProject(args: Args): Promise<void> {
  if (!args.project) {
    error(
      "No project specified. Use --project to specify the project to create",
    );
  }
  const spinner = wait(`Creating project '${args.project}'...`).start();
  const api = args.token
    ? API.fromToken(args.token)
    : API.withTokenProvisioner(TokenProvisioner);
  const org = args.org
    ? await organization.getByNameOrCreate(api, args.org)
    : null;
  try {
    await api.createProject(args.project, org?.id);
    spinner.succeed(
      `Project '${args.project}' created successfully ${
        org ? `in organization '${org.name}'` : ""
      }`,
    );
  } catch (error) {
    spinner.fail(
      `Cannot create the project '${args.project}': ${error.message}`,
    );
  }
}

async function renameProject(args: Args): Promise<void> {
  if (!args.project) {
    error(
      "no project specified. Use --project to specify the project to rename",
    );
  }
  const fetchSpinner = wait(`Fetching project '${args.project}' details...`)
    .start();
  const api = args.token
    ? API.fromToken(args.token)
    : API.withTokenProvisioner(TokenProvisioner);
  const project = await api.getProject(args.project);
  if (!project) {
    fetchSpinner.fail(
      `Project ${args.project} not found, or you don't have access to it`,
    );
    return Deno.exit(1);
  }
  const currentName = project.name;
  fetchSpinner.succeed(`Project '${currentName}' (${project.id}) found`);
  let newName: string | undefined | null = args._.shift()?.toString();
  if (!newName) {
    newName = prompt(`${magenta("?")} New name for project '${currentName}':`);
  }
  if (!newName) {
    error("project name cannot be empty");
  }
  const spinner = wait(`Renaming project '${currentName}' to '${newName}'...`)
    .start();
  try {
    await api.renameProject(args.project, newName);
    spinner.succeed(`Project '${currentName}' renamed to '${newName}'`);
  } catch (error) {
    spinner.fail(
      `Cannot rename the project '${currentName}' to '${newName}': ${error.message}`,
    );
  }
}
