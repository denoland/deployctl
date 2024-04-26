import { delay, TextLineStream } from "../../deps.ts";
import { VERSION } from "../version.ts";

import type {
  Build,
  BuildsPage,
  Cron,
  Database,
  DeploymentProgress,
  DeploymentV1,
  Domain,
  GitHubActionsDeploymentRequest,
  LiveLog,
  LogQueryRequestParams,
  ManifestEntry,
  Metadata,
  Organization,
  PagingInfo,
  PersistedLog,
  Project,
  ProjectStats,
  PushDeploymentRequest,
} from "./api_types.ts";
import { interruptSpinner, wait } from "./spinner.ts";

export const USER_AGENT =
  `DeployCTL/${VERSION} (${Deno.build.os} ${Deno.osRelease()}; ${Deno.build.arch})`;

export interface RequestOptions {
  method?: string;
  body?: unknown;
  accept?: string;
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

export function endpoint(): string {
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

  async request(path: string, opts: RequestOptions = {}): Promise<Response> {
    const url = `${this.#endpoint}/api${path}`;
    const method = opts.method ?? "GET";
    const body = typeof opts.body === "string" || opts.body instanceof FormData
      ? opts.body
      : JSON.stringify(opts.body);
    const authorization = typeof this.#authorization === "string"
      ? this.#authorization
      : `Bearer ${
        await this.#authorization.get() ?? await this.#authorization.provision()
      }`;
    const sudo = Deno.env.get("SUDO");
    const headers = {
      "User-Agent": USER_AGENT,
      "Accept": opts.accept ?? "application/json",
      "Authorization": authorization,
      ...(opts.body !== undefined
        ? opts.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }
        : {}),
      ...(sudo ? { ["x-deploy-sudo"]: sudo } : {}),
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
    const res = await this.request(path, opts);
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

  async #requestStream(
    path: string,
    opts?: RequestOptions,
  ): Promise<AsyncGenerator<string, void>> {
    const res = await this.request(path, opts);
    if (res.status !== 200) {
      const json = await res.json();
      const xDenoRay = res.headers.get("x-deno-ray");
      throw new APIError(json.code, json.message, xDenoRay);
    }
    if (res.body === null) {
      throw new Error("Stream ended unexpectedly");
    }

    const lines: ReadableStream<string> = res.body
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new TextLineStream());
    return async function* (): AsyncGenerator<string, void> {
      for await (const line of lines) {
        if (line === "") return;
        yield line;
      }
    }();
  }

  async #requestJsonStream<T>(
    path: string,
    opts?: RequestOptions,
  ): Promise<AsyncGenerator<T, void>> {
    const stream = await this.#requestStream(path, opts);
    return async function* () {
      for await (const line of stream) {
        yield JSON.parse(line);
      }
    }();
  }

  async getOrganizationByName(name: string): Promise<Organization | undefined> {
    const organizations: Organization[] = await this.#requestJson(
      `/organizations`,
    );
    for (const org of organizations) {
      if (org.name === name) {
        return org;
      }
    }
  }

  async getOrganizationById(id: string): Promise<Organization> {
    return await this.#requestJson(`/organizations/${id}`);
  }

  async createOrganization(name: string): Promise<Organization> {
    const body = { name };
    return await this.#requestJson(
      `/organizations`,
      { method: "POST", body },
    );
  }

  async listOrganizations(): Promise<Organization[]> {
    return await this.#requestJson(`/organizations`);
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

  async createProject(
    name?: string,
    organizationId?: string,
    envs?: Record<string, string>,
  ): Promise<Project> {
    const body = { name, organizationId, envs };
    return await this.#requestJson(`/projects/`, { method: "POST", body });
  }

  async renameProject(
    id: string,
    newName: string,
  ): Promise<void> {
    const body = { name: newName };
    await this.#requestJson(`/projects/${id}`, { method: "PATCH", body });
  }

  async deleteProject(
    id: string,
  ): Promise<boolean> {
    try {
      await this.#requestJson(`/projects/${id}`, { method: "DELETE" });
      return true;
    } catch (err) {
      if (err instanceof APIError && err.code === "projectNotFound") {
        return false;
      }
      throw err;
    }
  }

  async listProjects(
    orgId: string,
  ): Promise<Project[]> {
    const org: { projects: Project[] } = await this.#requestJson(
      `/organizations/${orgId}`,
    );
    return org.projects;
  }

  async getDomains(projectId: string): Promise<Domain[]> {
    return await this.#requestJson(`/projects/${projectId}/domains`);
  }

  async listDeployments(
    projectId: string,
    page?: number,
    limit?: number,
  ): Promise<BuildsPage | null> {
    const query = new URLSearchParams();
    if (page !== undefined) {
      query.set("page", page.toString());
    }
    if (limit !== undefined) {
      query.set("limit", limit.toString());
    }
    try {
      const [list, paging]: [Build[], PagingInfo] = await this.#requestJson(
        `/projects/${projectId}/deployments?${query}`,
      );
      return { list, paging };
    } catch (err) {
      if (err instanceof APIError && err.code === "projectNotFound") {
        return null;
      }
      throw err;
    }
  }

  async *listAllDeployments(
    projectId: string,
  ): AsyncGenerator<Build> {
    let totalPages = 1;
    let page = 0;
    while (totalPages > page) {
      const [deployments, paging]: [Build[], PagingInfo] = await this
        .#requestJson(
          `/projects/${projectId}/deployments/?limit=50&page=${page}`,
        );
      for (const deployment of deployments) {
        yield deployment;
      }
      totalPages = paging.totalPages;
      page = paging.page + 1;
    }
  }

  async getDeployment(
    deploymentId: string,
  ): Promise<Build | null> {
    try {
      return await this.#requestJson(`/deployments/${deploymentId}`);
    } catch (err) {
      if (err instanceof APIError && err.code === "deploymentNotFound") {
        return null;
      }
      throw err;
    }
  }

  async deleteDeployment(
    deploymentId: string,
  ): Promise<boolean> {
    try {
      await this.#requestJson(`/v1/deployments/${deploymentId}`, {
        method: "DELETE",
      });
      return true;
    } catch (err) {
      if (err instanceof APIError && err.code === "deploymentNotFound") {
        return false;
      }
      throw err;
    }
  }

  async redeployDeployment(
    deploymentId: string,
    redeployParams: {
      prod?: boolean;
      env_vars?: Record<string, string | null>;
      databases?: { default: string };
    },
  ): Promise<DeploymentV1 | null> {
    try {
      return await this.#requestJson(
        `/v1/deployments/${deploymentId}/redeploy?internal=true`,
        {
          method: "POST",
          body: redeployParams,
        },
      );
    } catch (err) {
      if (err instanceof APIError && err.code === "deploymentNotFound") {
        return null;
      }
      throw err;
    }
  }

  getLogs(
    projectId: string,
    deploymentId: string,
  ): Promise<AsyncGenerator<LiveLog>> {
    return this.#requestJsonStream(
      `/projects/${projectId}/deployments/${deploymentId}/logs/`,
      {
        accept: "application/x-ndjson",
      },
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
  ): Promise<AsyncGenerator<DeploymentProgress>> {
    const form = new FormData();
    form.append("request", JSON.stringify(request));
    for (const bytes of files) {
      form.append("file", new Blob([bytes]));
    }
    return this.#requestJsonStream(
      `/projects/${projectId}/deployment_with_assets`,
      { method: "POST", body: form },
    );
  }

  gitHubActionsDeploy(
    projectId: string,
    request: GitHubActionsDeploymentRequest,
    files: Uint8Array[],
  ): Promise<AsyncGenerator<DeploymentProgress>> {
    const form = new FormData();
    form.append("request", JSON.stringify(request));
    for (const bytes of files) {
      form.append("file", new Blob([bytes]));
    }
    return this.#requestJsonStream(
      `/projects/${projectId}/deployment_github_actions`,
      { method: "POST", body: form },
    );
  }

  getMetadata(): Promise<Metadata> {
    return this.#requestJson("/meta");
  }

  async streamMetering(
    project: string,
  ): Promise<AsyncGenerator<ProjectStats, void>> {
    const streamGen = () => this.#requestStream(`/projects/${project}/stats`);
    let stream = await streamGen();
    return async function* () {
      for (;;) {
        try {
          for await (const line of stream) {
            try {
              yield JSON.parse(line);
            } catch {
              // Stopgap while the streaming errors are fixed
            }
          }
        } catch (error) {
          // Stopgap while the streaming errors are fixed
          const interrupt = interruptSpinner();
          const spinner = wait(`Error: ${error}. Reconnecting...`).start();
          await delay(5_000);
          stream = await streamGen();
          spinner.stop();
          interrupt.resume();
        }
      }
    }();
  }

  async getProjectDatabases(project: string): Promise<Database[] | null> {
    try {
      return await this.#requestJson(`/projects/${project}/databases`);
    } catch (err) {
      if (err instanceof APIError && err.code === "projectNotFound") {
        return null;
      }
      throw err;
    }
  }

  async getDeploymentCrons(
    projectId: string,
    deploymentId: string,
  ): Promise<Cron[]> {
    return await this.#requestJson(
      `/projects/${projectId}/deployments/${deploymentId}/crons`,
    );
  }

  async getProjectCrons(
    projectId: string,
  ): Promise<Cron[] | null> {
    try {
      return await this.#requestJson(
        `/projects/${projectId}/deployments/latest/crons`,
      );
    } catch (err) {
      // When the project does not have a production deployment, API returns deploymentNotFound
      if (err instanceof APIError && err.code === "deploymentNotFound") {
        return null;
      }
      throw err;
    }
  }
}
