import { bold, red } from "@std/fmt/colors";

export function printError(message: string) {
  console.error(red(`${bold("error")}: ${message}`));
}

export function error(message: string): never {
  printError(message);
  Deno.exit(1);
}
