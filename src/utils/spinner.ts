import { cyan, Spinner, type SpinnerOptions } from "../../deps.ts";

let current: Spinner | null = null;

export function wait(param: string | SpinnerOptions) {
  if (typeof param === "string") {
    param = { text: param };
  }

  current = new Spinner({
    text: param.text,
    prefix: param.prefix ?? "",
    color: param.color ?? cyan,
    spinner: param.spinner ?? "dots",
    hideCursor: param.hideCursor ?? true,
    indent: param.indent ?? 0,
    interval: param.interval ?? 100,
    stream: param.stream ?? Deno.stderr,
    enabled: !Deno.env.get("CI"),
    discardStdin: true,
    interceptConsole: false,
  });
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
