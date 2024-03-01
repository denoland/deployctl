import { ansiRegex } from "./mod.ts";

export function stripAnsi(dirty: string): string {
  return dirty.replace(ansiRegex(), "");
}
