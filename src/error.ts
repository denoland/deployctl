import { bold, red } from "../deps.ts";

export function error(message: string): never {
  console.error(red(`${bold("error")}: ${message}`));
  Deno.exit(1);
}
