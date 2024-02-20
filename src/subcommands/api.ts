import { Args } from "../args.ts";
import { API, isTerminal } from "../utils/mod.ts";
import TokenProvisioner from "../utils/access_token.ts";
import { error } from "../error.ts";
import { wait } from "../utils/spinner.ts";

const help = `Perform API calls to any endpoint of the Deploy API (ALPHA)

EXAMPLES:

Get the details of an organization:

    deployctl api organizations/04f19625-35d3-4c05-857e-bcaa3b0af374

Create a project in an organization:

    deployctl --method=POST --body='{"name": "my-project"}' organizations/04f19625-35d3-4c05-857e-bcaa3b0af374/projects

You can find the specification of the API in https://apidocs.deno.com

USAGE:
    deployctl api [OPTIONS] <ENDPOINT>

OPTIONS:
    -h, --help                   Prints this help information
        --method=<HTTP-METHOD>   HTTP method to use (defaults to GET)
        --body=<JSON>            Body of the request. The provided string is sent as is to the API
        --format=<overview|body> Output an overview of the response with the headers and the (possibly truncated) body, or just the body (verbatim). 
                                 Defaults to 'overview' when stdout is a tty, and 'body' otherwise.  
        --token=<TOKEN>          The API token to use (defaults to auto-provisioned token)
`;

export default async function (args: Args): Promise<void> {
  if (args.help) {
    console.log(help);
    Deno.exit(0);
  }
  let endpoint = args._.shift()?.toString();
  if (!endpoint) {
    error(
      "Missing endpoint positional argument. USAGE: deployctl api <endpoint>",
    );
  }

  let format: "overview" | "body";
  switch (args.format) {
    case "overview":
    case "body":
      format = args.format;
      break;
    case undefined:
      format = isTerminal(Deno.stdout) ? "overview" : "body";
      break;
    default:
      error(
        `Invalid format '${args.format}'. Supported values for the --format option are 'overview' or 'body'`,
      );
  }

  if (!endpoint.startsWith("/")) {
    endpoint = `/${endpoint}`;
  }
  if (!/^\/v\d+\//.test(endpoint)) {
    endpoint = `/v1${endpoint}`;
  }
  const method = (args.method || "GET").toUpperCase();
  const spinner = wait(`Requesting API endpoint '${endpoint}'...`).start();
  const api = args.token
    ? API.fromToken(args.token)
    : API.withTokenProvisioner(TokenProvisioner);
  try {
    const response = await api.request(endpoint, {
      method,
      body: args.body,
    });
    spinner.succeed(`Received response from the API`);
    switch (format) {
      case "overview": {
        const body = response.headers.get("Content-Type") === "application/json"
          ? await response.json()
          : await response.text();
        const headers = response.headers;
        console.log("-----[ HEADERS ]-----");
        console.log(method, response.url);
        console.log("Status:", response.status);
        console.log(headers);
        console.log("-----[ BODY ]--------");
        console.log(body);
        break;
      }
      case "body": {
        console.log(await response.text());
        break;
      }
    }
  } catch (err) {
    error(err);
  }
}
