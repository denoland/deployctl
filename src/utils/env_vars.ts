import * as dotenv from "@std/dotenv";
import type { Args } from "../args.ts";

/**
 * Obtain the env variables provided by the user with the --env and --env-file options.
 *
 * Both --env and --env-file options can be used multiple times. In case of conflict, the last
 * option takes precedence. Env vars set with --env always takes precedence over envs in env files.
 */
export async function envVarsFromArgs(
  args: Args,
): Promise<Record<string, string> | null> {
  const fileEnvs = (await Promise.all(
    args["env-file"].map((envFile) =>
      dotenv.load({ ...envFile ? { envPath: envFile } : {} })
    ),
  )).reduce((a, b) => Object.assign(a, b), {});
  const standaloneEnvs = dotenv.parse(args.env.join("\n"));
  const envVars = {
    ...fileEnvs,
    ...standaloneEnvs,
  };
  return Object.keys(envVars).length > 0 ? envVars : null;
}
