import { TextLineStream } from "../../deps.ts";

import {
  Deployment,
  DeploymentProgress,
  DeploymentsSummary,
  GitHubActionsDeploymentRequest,
  LiveLog,
  LogQueryRequestParams,
  ManifestEntry,
  Metadata,
  PersistedLog,
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

export function endpoint() {
  return Deno.env.get("DEPLOY_API_ENDPOINT") ?? "https://dash.deno.com";
}

interface TokenProvisioner {
  /**
   * Get the access token from a secure local storage or any other cache form.
   * If there isn't any token cached, returns `null`.
   */
  get(): Promise<string | null>;
  /**
   * Provision a new access token for DeployCTL
   */
  provision(): Promise<string>;
  /**
   * Delete the token from cache, forcing a new provision in the next request
   */
  revoke(): Promise<void>;
}

export class API {
  #endpoint: string;
  #authorization: string | TokenProvisioner;

  constructor(
    authorization: string | TokenProvisioner,
    endpoint: string,
  ) {
    this.#authorization = authorization;
    this.#endpoint = endpoint;
  }

  static fromToken(token: string) {
    return new API(`Bearer ${token}`, endpoint());
  }

  static withTokenProvisioner(provisioner: TokenProvisioner) {
    return new API(provisioner, endpoint());
  }

  async #request(path: string, opts: RequestOptions = {}): Promise<Response> {
    const url = `${this.#endpoint}/api${path}`;
    const method = opts.method ?? "GET";
    const body = opts.body !== undefined
      ? opts.body instanceof FormData ? opts.body : JSON.stringify(opts.body)
      : undefined;
    const authorization = typeof this.#authorization === "string"
      ? this.#authorization
      : `Bearer ${
        await this.#authorization.get() ?? await this.#authorization.provision()
      }`;
    const headers = {
      "Accept": "application/json",
      "Authorization": authorization,
      ...(opts.body !== undefined
        ? opts.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }
        : {}),
    };
    let res = await fetch(url, { method, headers, body });
    if (res.status === 401 && typeof this.#authorization === "object") {
      // Token expired or revoked. Provision again and retry
      headers.Authorization = `Bearer ${await this.#authorization.provision()}`;
      res = await fetch(url, { method, headers, body });
    }
    return res;
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

    const lines = res.body
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new TextLineStream());
    for await (const line of lines) {
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

  async getDeployments(
    projectId: string,
  ): Promise<[Deployment[], DeploymentsSummary] | null> {
    try {
      return await this.#requestJson(`/projects/${projectId}/deployments/`);
    } catch (err) {
      if (err instanceof APIError && err.code === "projectNotFound") {
        return null;
      }
      throw err;
    }
  }

  getLogs(
    projectId: string,
    deploymentId: string,
  ): AsyncIterable<LiveLog> {
    return this.#requestStream(
      `/projects/${projectId}/deployments/${deploymentId}/logs/`,
    );
  }

  async queryLogs(
    projectId: string,
    deploymentId: string,
    params: LogQueryRequestParams,
  ): Promise<{ logs: PersistedLog[] }> {
    const searchParams = new URLSearchParams({
      params: JSON.stringify(params),
    });
    return await this.#requestJson(
      `/projects/${projectId}/deployments/${deploymentId}/query_logs?${searchParams.toString()}`,
    );
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

  getMetadata(): Promise<Metadata> {
    return this.#requestJson("/meta");
  }
}
