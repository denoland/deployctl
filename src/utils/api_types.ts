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
  createdAt: string;
  updatedAt: string;
  envVars: string[];
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

export interface Logs {
  time: string;
  message: string;
  level: "info" | "debug" | "error";
  isolateId: string;
  region:
    | "asia-east1"
    | "asia-east2"
    | "asia-northeast1"
    | "asia-northeast2"
    | "asia-northeast3"
    | "asia-south1"
    | "asia-south2"
    | "asia-southeast1"
    | "asia-southeast2"
    | "australia-southeast1"
    | "australia-southeast2"
    | "europe-central2"
    | "europe-north1"
    | "europe-west1"
    | "europe-west2"
    | "europe-west3"
    | "europe-west4"
    | "europe-west6"
    | "europe-west8"
    | "europe-west9"
    | "europe-southwest1"
    | "northamerica-northeast1"
    | "northamerica-northeast2"
    | "southamerica-east1"
    | "southamerica-west1"
    | "us-central1"
    | "us-east1"
    | "us-east4"
    | "us-east5"
    | "us-south1"
    | "us-west1"
    | "us-west2"
    | "us-west3"
    | "us-west4";
}
