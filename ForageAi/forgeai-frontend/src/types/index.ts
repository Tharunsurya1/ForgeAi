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
  artifact_type: string;
  file_path: string;
  content: string;
  language: string;
  file_size_bytes: number;
  created_at: string;
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
