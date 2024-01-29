import { fetch as realfetch } from "undici";
import { Deno } from "@deno/shim-deno";
import { TransformStream } from "stream/web";
import { FormData, formDataToBlob } from "formdata-polyfill/esm.min.js";
import Blob from "fetch-blob";

function fetch(url, init) {
  if (init.body instanceof FormData) {
    init.body = formDataToBlob(init.body, Blob);
  }
  return realfetch(url, init);
}

globalThis.fetch = fetch;
globalThis.Deno = Deno;
globalThis.TransformStream = TransformStream;
globalThis.FormData = FormData;
globalThis.Blob = Blob;
