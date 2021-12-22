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

export interface ManifestEntryFile {
  kind: "file";
  hash: string;
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
  production: boolean;
  manifest: { entries: Record<string, ManifestEntry> };
}

export type CodeUploadProgress =
  | CodeUploadProgressError
  | CodeUploadProgressLoad
  | CodeUploadProgressUploadComplete
  | CodeUploadProgressSuccess;

export interface CodeUploadProgressError {
  type: "error";
  code: string;
  ctx: string;
}

export interface CodeUploadProgressLoad {
  type: "load";
  url: string;
  seen: number;
  total: number;
}

export interface CodeUploadProgressUploadComplete {
  type: "uploadComplete";
}

export interface CodeUploadProgressSuccess extends Deployment {
  type: "success";
}
