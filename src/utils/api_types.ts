export interface DomainMapping {
  domain: string;
  createdAt: string;
  updatedAt: string;
}

export interface Build {
  id: string;
  relatedCommit?: {
    hash: string;
    branch: string;
    message: string;
    authorName: string;
    authorEmail: string;
    authorGithubUsername: string;
    url: string;
  };
  deployment: Deployment | null;
  deploymentId: string;
  project: Project;
  createdAt: string;
  logs: DeploymentProgress[];
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
  kvDatabases: Record<string, string>;
}

export interface Project {
  id: string;
  name: string;
  type: "git" | "playground";
  git?: {
    repository: { owner: string; name: string };
    productionBranch: string;
  };
  productionDeployment?: Build | null;
  hasProductionDeployment: boolean;
  organizationId: string;
  organization: Organization;
  createdAt: string;
  updatedAt: string;
  envVars: string[];
}

export type Organization = UserOrganization | NormalOrganization;

export type UserOrganization = CommonOrganization & {
  name: null;
};

export type NormalOrganization = CommonOrganization & {
  name: string;
};

export interface CommonOrganization {
  id: string;
  members: OrganizationMember[];
}

export interface OrganizationMember {
  user: User;
}

export interface User {
  name: string;
}

export interface PagingInfo {
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

export interface Domain {
  domain: string;
  isValidated: boolean;
}

export interface ProjectStats {
  id: string;
  region: string;
  projectId: string;
  deploymentId: string;
  uptime: number;
  requestsPerMinute: number;
  cpuTimePerSecond: number;
  cpuTimePerRequest: number;
  maxRss5Minutes: number;
  ingressBytesPerMinute: number;
  egressBytesPerMinute: number;
  kvReadUnitsPerMinute: number;
  kvWriteUnitsPerMinute: number;
  enqueuePerMinute: number;
  dequeuePerMinute: number;
}

export interface Database {
  branch: string;
  databaseId: string;
  bindingName: string;
  description: string;
  sizeBytes?: number;
  availableRegions: string[];
  createdAt: string;
  updatedAt: string;
}
