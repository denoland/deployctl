// Copyright 2018-2021 Deno Land Inc. All rights reserved. MIT license.

// deno-lint-ignore-file

/// <reference no-default-lib="true" />
/// <reference lib="esnext" />

declare class FetchEvent extends Event {
  request: Request;
  respondWith(response: Response | Promise<Response>): Promise<Response>;
}

declare type FetchEventListenerOrFetchEventListenerObject =
  | FetchEventListener
  | FetchEventListenerObject;

interface FetchEventListener {
  (evt: FetchEvent): void | Promise<void>;
}

interface FetchEventListenerObject {
  handleEvent(evt: FetchEvent): void | Promise<void>;
}

declare function addEventListener(
  type: "fetch",
  callback: FetchEventListenerOrFetchEventListenerObject | null,
  options?: boolean | AddEventListenerOptions | undefined
): void;
