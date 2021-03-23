// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

// Be careful if you want to use this in production. This polyfill has no proper
// error handling.

import { Server } from "https://deno.land/std@0.91.0/http/server.ts";
import { readerFromStreamReader } from "https://deno.land/std@0.91.0/io/streams.ts";
import { green } from "https://deno.land/std@0.91.0/fmt/colors.ts";

class FetchEvent extends Event {
  #stdReq;
  #request;

  get request() {
    return this.#request;
  }

  constructor(stdReq, addr) {
    super("fetch");

    const host = stdReq.headers.get("host") ?? addr;

    this.#stdReq = stdReq;
    this.#request = new Request(
      new URL(stdReq.url, `http://${host}`).toString(),
      {
        body: new ReadableStream({
          start: async (controller) => {
            for await (const chunk of Deno.iter(stdReq.body)) {
              controller.enqueue(chunk);
            }
            controller.close();
          },
        }),
        headers: stdReq.headers,
        method: stdReq.method,
      },
    );
  }

  async respondWith(response) {
    const resp = await response;
    await this.#stdReq.respond({
      headers: resp.headers,
      status: resp.status,
      body: resp.body != null
        ? readerFromStreamReader(resp.body.getReader())
        : undefined,
    });
    return resp;
  }

  [Symbol.toStringTag]() {
    return "FetchEvent";
  }
}

window.FetchEvent = FetchEvent;

export async function serve(addr) {
  if (typeof addr === "string") {
    const [hostname, port] = addr.split(":");
    addr = { hostname, port: Number(port) };
  }
  const listener = Deno.listen(addr);
  const host = `${listener.addr.hostname}:${listener.addr.port}`;
  console.log(green(`Listening on http://${host}`));
  const server = new Server(listener);
  for await (const req of server) {
    window.dispatchEvent(
      new FetchEvent(
        req,
        host,
      ),
    );
  }
}
