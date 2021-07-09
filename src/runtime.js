// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

// Be careful if you want to use this in production. This polyfill has no proper
// error handling.

import { green } from "https://deno.land/std@0.91.0/fmt/colors.ts";
import "https://deno.land/x/file_fetch@0.2.0/polyfill.ts";

class FetchEvent extends Event {
  #request;
  #respondWith;
  #responded;

  get request() {
    return this.#request;
  }

  /**
   * @param {Request} request
   * @param {Response | Promise<Response>} respondWith
   */
  constructor(request, respondWith) {
    super("fetch");
    this.#request = request;
    this.#respondWith = respondWith;
    this.#responded = false;
  }

  respondWith(response) {
    if (this.#responded === true) {
      throw new TypeError("Already responded to this FetchEvent.");
    } else {
      this.#responded = true;
    }
    this.#respondWith(response).catch((err) => console.warn(err));
  }

  [Symbol.toStringTag]() {
    return "FetchEvent";
  }
}

window.FetchEvent = FetchEvent;

export async function serve(addr = 'localhost:8080') {
  if (typeof addr === "string") {
    const [hostname, port] = addr.split(":");
    addr = { hostname, port: Number(port) };
  }
  const listener = Deno.listen(addr);
  const host = `${listener.addr.hostname}:${listener.addr.port}`;
  console.error(green(`Listening on http://${host}`));
  for await (const conn of listener) {
    handleConn(conn).catch((err) => console.warn(err));
  }
}

/**
 * @param {Deno.Conn} conn
 */
async function handleConn(conn) {
  const http = Deno.serveHttp(conn);
  for await (const { request, respondWith } of http) {
    window.dispatchEvent(new FetchEvent(request, respondWith));
  }
}

export function shim(addr) {
  const originalAddEventListener = window.addEventListener;
  window.addEventListener = (type, handler) => {
    if (type === "fetch") {
      serve(addr);
    }
    originalAddEventListener(type, handler);
  };
}
