import { Spinner, SpinnerOptions, wait as innerWait } from "../../deps.ts";

let current: Spinner | null = null;

export function wait(param: string | SpinnerOptions) {
  if (typeof param === "string") {
    param = { text: param };
  }
  current = innerWait({ stream: Deno.stderr, ...param });
  return current;
}

export function interruptSpinner(): Interrupt {
  current?.stop();
  const interrupt = new Interrupt(current);
  current = null;
  return interrupt;
}

export class Interrupt {
  #spinner: Spinner | null;
  constructor(spinner: Spinner | null) {
    this.#spinner = spinner;
  }
  resume() {
    current = this.#spinner;
    this.#spinner?.start();
  }
}
