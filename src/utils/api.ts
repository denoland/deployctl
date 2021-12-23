import { LineStream } from "https://deno.land/std@0.116.0/streams/delimiter.ts";
import {
  CodeUploadProgress,
  ManifestEntry,
  Project,
  PushDeploymentRequest,
} from "./api_types.ts";

export interface RequestOptions {
  method?: string;
  body?: unknown;
}

export class APIError extends Error {
  code: string;

  name = "APIError";

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export class API {
  #endpoint: string;
  #token: string;

  constructor(token: string) {
    this.#endpoint = Deno.env.get("DEPLOY_API_ENDPOINT") ??
      "https://dash.deno.com";
    this.#token = token;
  }

  async #request(path: string, opts: RequestOptions = {}): Promise<Response> {
    const url = `${this.#endpoint}/api${path}`;
    const method = opts.method ?? "GET";
    const body = opts.body !== undefined
      ? opts.body instanceof FormData ? opts.body : JSON.stringify(opts.body)
      : undefined;
    const headers = {
      "Accept": "application/json",
      "Authorization": `Bearer ${this.#token}`,
      ...(opts.body !== undefined
        ? opts.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }
        : {}),
    };
    return await fetch(url, { method, headers, body });
  }

  async #requestJson<T>(path: string, opts?: RequestOptions): Promise<T> {
    const res = await this.#request(path, opts);
    if (res.headers.get("Content-Type") !== "application/json") {
      const text = await res.text();
      throw new Error(`Expected JSON, got '${text}'`);
    }
    const json = await res.json();
    if (res.status !== 200) {
      throw new APIError(json.code, json.message);
    }
    return json;
  }

  async *#requestStream<T>(
    path: string,
    opts?: RequestOptions,
  ): AsyncIterable<T> {
    const res = await this.#request(path, opts);
    if (res.status !== 200) {
      const json = await res.json();
      throw new APIError(json.code, json.message);
    }
    if (res.body === null) {
      throw new Error("Stream ended unexpectedly");
    }

    const lines = res.body.pipeThrough(new LineStream());
    for await (const chunk of lines) {
      const line = new TextDecoder().decode(chunk);
      if (line === "") return;
      yield JSON.parse(line);
    }
  }

  async getProject(id: string): Promise<Project | null> {
    try {
      return await this.#requestJson(`/projects/${id}`);
    } catch (err) {
      if (err instanceof APIError && err.code === "projectNotFound") {
        return null;
      }
      throw err;
    }
  }

  async projectNegotiateAssets(
    id: string,
    manifest: { entries: Record<string, ManifestEntry> },
  ): Promise<string[]> {
    return await this.#requestJson(`/projects/${id}/assets/negotiate`, {
      method: "POST",
      body: manifest,
    });
  }

  pushDeploy(
    projectId: string,
    request: PushDeploymentRequest,
    files: Uint8Array[],
  ): AsyncIterable<CodeUploadProgress> {
    const form = new FormData();
    form.append("request", JSON.stringify(request));
    for (const bytes of files) {
      form.append("file", new Blob([bytes]));
    }
    return this.#requestStream(
      `/projects/${projectId}/deployment_with_assets`,
      { method: "POST", body: form },
    );
  }
}
