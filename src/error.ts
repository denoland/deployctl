import { bold, red } from "../deps.ts";

export function error(message: string): never {
  console.log(red(`${bold("error")}: ${message}`));
  Deno.exit(1);
}
