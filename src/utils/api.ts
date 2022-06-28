import { LineStream } from "https://deno.land/std@0.116.0/streams/delimiter.ts";
import {
  DeploymentProgress,
  GitHubActionsDeploymentRequest,
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
  xDenoRay: string | null;

  name = "APIError";

  constructor(code: string, message: string, xDenoRay: string | null) {
    super(message);
    this.code = code;
    this.xDenoRay = xDenoRay;
  }

  toString() {
    let error = `${this.name}: ${this.message}`;
    if (this.xDenoRay !== null) {
      error += `\nx-deno-ray: ${this.xDenoRay}`;
      error += "\nIf you encounter this error frequently," +
        " contact us at deploy@deno.com with the above x-deno-ray.";
    }
    return error;
  }
}

export class API {
  #endpoint: string;
  #authorization: string;

  constructor(authorization: string, endpoint: string) {
    this.#authorization = authorization;
    this.#endpoint = endpoint;
  }

  static fromToken(token: string) {
    const endpoint = Deno.env.get("DEPLOY_API_ENDPOINT") ??
      "https://dash.deno.com";
    return new API(`Bearer ${token}`, endpoint);
  }

  async #request(path: string, opts: RequestOptions = {}): Promise<Response> {
    const url = `${this.#endpoint}/api${path}`;
    const method = opts.method ?? "GET";
    const body = opts.body !== undefined
      ? opts.body instanceof FormData ? opts.body : JSON.stringify(opts.body)
      : undefined;
    const headers = {
      "Accept": "application/json",
      "Authorization": this.#authorization,
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
      const xDenoRay = res.headers.get("x-deno-ray");
      throw new APIError(json.code, json.message, xDenoRay);
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
      const xDenoRay = res.headers.get("x-deno-ray");
      throw new APIError(json.code, json.message, xDenoRay);
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
  ): AsyncIterable<DeploymentProgress> {
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

  gitHubActionsDeploy(
    projectId: string,
    request: GitHubActionsDeploymentRequest,
    files: Uint8Array[],
  ): AsyncIterable<DeploymentProgress> {
    const form = new FormData();
    form.append("request", JSON.stringify(request));
    for (const bytes of files) {
      form.append("file", new Blob([bytes]));
    }
    return this.#requestStream(
      `/projects/${projectId}/deployment_github_actions`,
      { method: "POST", body: form },
    );
  }
}
