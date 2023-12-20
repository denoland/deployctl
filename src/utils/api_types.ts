export interface DomainMapping {
  domain: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deployment {
  id: string;
  url: string;
  domainMappings: DomainMapping[];
  project?: Project;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  envVars: string[];
}

export interface Project {
  id: string;
  name: string;
  productionDeployment?: Deployment | null;
  hasProductionDeployment: boolean;
  organizationId: string;
  organization: Organization;
  createdAt: string;
  updatedAt: string;
  envVars: string[];
}

export type Organization = UserOrganization | NormalOrganization;

export interface UserOrganization {
  id: string;
  name: null;
}

export interface NormalOrganization {
  id: string;
  name: string;
}

export interface DeploymentsSummary {
  page: number;
  count: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export interface ManifestEntryFile {
  kind: "file";
  gitSha1: string;
  size: number;
}

export interface ManifestEntryDirectory {
  kind: "directory";
  entries: Record<string, ManifestEntry>;
}

export interface ManifestEntrySymlink {
  kind: "symlink";
  target: string;
}

export type ManifestEntry =
  | ManifestEntryFile
  | ManifestEntryDirectory
  | ManifestEntrySymlink;

export interface PushDeploymentRequest {
  url: string;
  importMapUrl: string | null;
  production: boolean;
  manifest?: { entries: Record<string, ManifestEntry> };
}

export interface GitHubActionsDeploymentRequest {
  url: string;
  importMapUrl: string | null;
  manifest: { entries: Record<string, ManifestEntry> };
  event?: unknown;
}

export type DeploymentProgress =
  | DeploymentProgressStaticFile
  | DeploymentProgressLoad
  | DeploymentProgressUploadComplete
  | DeploymentProgressSuccess
  | DeploymentProgressError;

export interface DeploymentProgressStaticFile {
  type: "staticFile";
  currentBytes: number;
  totalBytes: number;
}

export interface DeploymentProgressLoad {
  type: "load";
  url: string;
  seen: number;
  total: number;
}

export interface DeploymentProgressUploadComplete {
  type: "uploadComplete";
}

export interface DeploymentProgressSuccess extends Deployment {
  type: "success";
}

export interface DeploymentProgressError {
  type: "error";
  code: string;
  ctx: string;
}

export interface LiveLogReady {
  type: "ready";
}

export interface LiveLogPing {
  type: "ping";
}

export interface LiveLogMessage {
  type: "message";
  time: string;
  message: string;
  level: "debug" | "info" | "warning" | "error";
  region: string;
}

export type LiveLog =
  | LiveLogReady
  | LiveLogPing
  | LiveLogMessage;

export interface LogQueryRequestParams {
  regions?: string[];
  levels?: string[];
  // RFC3339
  since?: string;
  // RFC3339
  until?: string;
  q?: string[];
  limit?: number;
}

export interface PersistedLog {
  deploymentId: string;
  isolateId: string;
  region: string;
  level: "debug" | "info" | "warning" | "error";
  // RFC3339
  timestamp: string;
  message: string;
}

export interface Metadata {
  regionCodes: string[];
}
