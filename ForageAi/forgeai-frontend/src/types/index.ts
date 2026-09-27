export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  is_active: boolean;
  is_superuser: boolean;
  email_verified: boolean;
  mfa_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface UserSession {
  id: string;
  device_info?: string | null;
  ip_address?: string | null;
  is_current: boolean;
  is_revoked: boolean;
  created_at: string;
  expires_at: string;
}

export interface UserProfileUpdateRequest {
  full_name?: string;
  avatar_url?: string | null;
}

export interface Project {
  id: string;
  organization_id: string;
  created_by: string;
  name: string;
  slug: string;
  description?: string | null;
  repository_url?: string | null;
  tech_stack: Record<string, any>;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface BlueprintArtifact {
  id: string;
  blueprint_id: string;
  version: number;
  agent_type?: string;
  artifact_type: string;
  file_path: string;
  content: string;
  language: string;
  file_size_bytes: number;
  status?: string;
  created_at: string;
  updated_at?: string;
}

export interface Blueprint {
  id: string;
  project_id: string;
  current_version: number;
  title: string;
  summary?: string | null;
  status: string;
  metadata: Record<string, any>;
  artifacts: BlueprintArtifact[];
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  plan_tier: string;
  billing_email: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: "owner" | "admin" | "member" | "viewer" | string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  created_at: string;
}

export interface OrganizationInvitation {
  id: string;
  organization_id: string;
  organization_name?: string;
  email: string;
  role: "owner" | "admin" | "member" | "viewer" | string;
  token: string;
  status: "pending" | "accepted" | "rejected" | "revoked" | "expired" | string;
  invited_by?: string | null;
  expires_at: string;
  created_at: string;
}

export interface InvitationPublic {
  id: string;
  organization_id: string;
  organization_name: string;
  organization_slug: string;
  email: string;
  role: string;
  expires_at: string;
  is_expired: boolean;
}

export interface InvitationAction {
  message: string;
  organization_id: string;
  role: string;
}

export interface Team {
  id: string;
  organization_id: string;
  name: string;
  description?: string | null;
  member_count: number;
  created_at: string;
  updated_at?: string | null;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  created_at: string;
}

export interface AgentRun {
  id: string;
  workflow_execution_id: string;
  agent_name: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped" | string;
  retry_count: number;
  execution_time_ms?: number | null;
  input_payload: Record<string, any>;
  output_payload?: Record<string, any> | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowEvent {
  id: string;
  workflow_execution_id?: string;
  execution_id?: string;
  event_type: string;
  agent_name?: string | null;
  sequence_number: number;
  payload: Record<string, any>;
  message?: string | null;
  timestamp?: string | null;
  created_at: string;
}

export interface WorkflowExecution {
  id: string;
  project_id: string;
  triggered_by_user_id?: string | null;
  blueprint_id?: string | null;
  workflow_name: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled" | string;
  prompt: string;
  tech_stack: Record<string, any>;
  current_agent?: string | null;
  progress_percentage: number;
  error_message?: string | null;
  metadata: Record<string, any>;
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  agent_runs?: AgentRun[];
  events?: WorkflowEvent[];
}

export interface RAGHealth {
  status: string;
  url: string;
  collections_total: number;
  target_collection: string;
  collection_exists: boolean;
  points_count: number;
  embedding_provider: string;
  embedding_dimension: number;
}

export interface RAGIndexResult {
  status: string;
  blueprint_id?: string | null;
  project_id: string;
  organization_id: string;
  artifacts_count: number;
  indexed_chunks: number;
}

export interface RAGQueryResult {
  chunk_id: string;
  artifact_id: string;
  artifact_type: string;
  file_path: string;
  score: number;
  text: string;
}

export interface RAGQueryResponse {
  project_id: string;
  organization_id: string;
  query: string;
  results_count: number;
  results: RAGQueryResult[];
}

export interface CodeFileItem {
  path: string;
  name: string;
  directory: string;
  content: string;
  language: string;
  size_bytes: number;
  source: string;
}

export interface CodeGenerateResponse {
  generation_id: string;
  blueprint_id: string;
  project_id: string;
  project_name: string;
  version: number;
  total_files: number;
  total_bytes: number;
  directories: string[];
  files: CodeFileItem[];
  created_at: string;
}

export interface CodeValidationIssue {
  path?: string | null;
  type: string;
  message: string;
}

export interface CodeValidationResponse {
  valid: boolean;
  errors: CodeValidationIssue[];
  warnings: CodeValidationIssue[];
  checked_files: number;
}


