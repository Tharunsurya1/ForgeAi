import {
  Blueprint,
  InvitationAction,
  InvitationPublic,
  Organization,
  OrganizationInvitation,
  OrganizationMember,
  Project,
  Team,
  TeamMember,
  TokenResponse,
  User,
  UserProfileUpdateRequest,
  UserSession,
} from "@/types";
import { authStorage } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
  _retry?: boolean;
}

// In-flight singleton promise to prevent duplicate refresh calls during concurrent 401s
let refreshPromise: Promise<TokenResponse> | null = null;

async function fetchClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { requiresAuth = true, _retry = false, headers = {}, ...rest } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(headers as Record<string, string>),
  };

  if (requiresAuth) {
    const token = authStorage.getAccessToken();
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;
  let response: Response;

  try {
    response = await fetch(url, {
      headers: requestHeaders,
      ...rest,
    });
  } catch (networkError: any) {
    throw new Error(networkError?.message || "Network request failed");
  }

  // Handle 401 Unauthorized for authenticated endpoints
  if (response.status === 401) {
    const isAuthEndpoint =
      endpoint === "/auth/login" ||
      endpoint === "/auth/register" ||
      endpoint === "/auth/refresh";

    // If it's already a retry, unauthenticated endpoint, or auth endpoint: do not retry
    if (_retry || !requiresAuth || isAuthEndpoint) {
      if (endpoint === "/auth/refresh") {
        authStorage.clearAuth();
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }

      let errorDetail = "Unauthorized";
      try {
        const errorJson = await response.json();
        errorDetail = errorJson.detail || errorJson.message || JSON.stringify(errorJson);
      } catch {
        errorDetail = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorDetail);
    }

    const refreshToken = authStorage.getRefreshToken();
    if (!refreshToken) {
      authStorage.clearAuth();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      throw new Error("Authentication session expired. Please log in again.");
    }

    // Mutex: Queue concurrent requests behind a single token refresh call
    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (!refreshRes.ok) {
            throw new Error("Token refresh rejected");
          }

          const tokenData = (await refreshRes.json()) as TokenResponse;
          authStorage.setAuth(tokenData);
          return tokenData;
        } catch (refreshErr) {
          authStorage.clearAuth();
          if (typeof window !== "undefined" && window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
          throw refreshErr;
        } finally {
          refreshPromise = null;
        }
      })();
    }

    try {
      await refreshPromise;
    } catch {
      throw new Error("Session expired. Please log in again.");
    }

    // Retry the original request exactly once with new token
    return fetchClient<T>(endpoint, {
      ...options,
      _retry: true,
    });
  }

  if (!response.ok) {
    let errorDetail = "An unexpected error occurred";
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorJson.message || JSON.stringify(errorJson);
    } catch {
      errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export const authApi = {
  async register(data: { email: string; password: string; full_name: string }): Promise<User> {
    return fetchClient<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: false,
    });
  },

  async login(data: { email: string; password: string }): Promise<TokenResponse> {
    const response = await fetchClient<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: false,
    });
    authStorage.setAuth(response);
    return response;
  },

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await fetchClient<TokenResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
      requiresAuth: false,
    });
    authStorage.setAuth(response);
    return response;
  },

  async logout(refreshToken?: string): Promise<{ message: string }> {
    try {
      const token = refreshToken || authStorage.getRefreshToken() || "";
      const res = await fetchClient<{ message: string }>("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refresh_token: token }),
        requiresAuth: true,
      });
      return res;
    } finally {
      authStorage.clearAuth();
    }
  },

  async getMe(): Promise<User> {
    return fetchClient<User>("/auth/me", {
      method: "GET",
      requiresAuth: true,
    });
  },

  async updateProfile(data: UserProfileUpdateRequest): Promise<User> {
    const user = await fetchClient<User>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
    authStorage.setUser(user);
    return user;
  },

  async listSessions(): Promise<UserSession[]> {
    return fetchClient<UserSession[]>("/auth/sessions", {
      method: "GET",
      requiresAuth: true,
    });
  },

  async revokeSession(sessionId: string): Promise<{ message: string }> {
    return fetchClient<{ message: string }>(`/auth/sessions/${sessionId}`, {
      method: "DELETE",
      requiresAuth: true,
    });
  },

  async revokeOtherSessions(): Promise<{ message: string }> {
    return fetchClient<{ message: string }>("/auth/sessions/revoke-others", {
      method: "POST",
      requiresAuth: true,
    });
  },

  async logoutAllOther(): Promise<{ message: string }> {
    return fetchClient<{ message: string }>("/auth/sessions/revoke-others", {
      method: "POST",
      requiresAuth: true,
    });
  },
};

export const projectsApi = {
  async list(): Promise<Project[]> {
    return fetchClient<Project[]>("/projects", {
      method: "GET",
      requiresAuth: true,
    });
  },

  async create(data: {
    name: string;
    description?: string;
    organization_id?: string;
    tech_stack?: Record<string, any>;
    repository_url?: string;
  }): Promise<Project> {
    return fetchClient<Project>("/projects", {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  async get(projectId: string): Promise<Project> {
    return fetchClient<Project>(`/projects/${projectId}`, {
      method: "GET",
      requiresAuth: true,
    });
  },

  async update(
    projectId: string,
    data: {
      name?: string;
      description?: string;
      tech_stack?: Record<string, any>;
      repository_url?: string;
      status?: string;
    }
  ): Promise<Project> {
    return fetchClient<Project>(`/projects/${projectId}`, {
      method: "PUT",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  async delete(projectId: string): Promise<{ message: string }> {
    return fetchClient<{ message: string }>(`/projects/${projectId}`, {
      method: "DELETE",
      requiresAuth: true,
    });
  },
};

export const blueprintsApi = {
  async generate(
    projectId: string,
    data: {
      prompt: string;
      title?: string;
      tech_stack?: Record<string, any>;
    }
  ): Promise<Blueprint> {
    return fetchClient<Blueprint>(`/blueprints/generate/${projectId}`, {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  async getLatest(projectId: string): Promise<Blueprint> {
    return fetchClient<Blueprint>(`/blueprints/latest/${projectId}`, {
      method: "GET",
      requiresAuth: true,
    });
  },

  async getLatestForProject(projectId: string): Promise<Blueprint> {
    return fetchClient<Blueprint>(`/blueprints/latest/${projectId}`, {
      method: "GET",
      requiresAuth: true,
    });
  },

  async getById(blueprintId: string): Promise<Blueprint> {
    return fetchClient<Blueprint>(`/blueprints/${blueprintId}`, {
      method: "GET",
      requiresAuth: true,
    });
  },

  async get(blueprintId: string): Promise<Blueprint> {
    return fetchClient<Blueprint>(`/blueprints/${blueprintId}`, {
      method: "GET",
      requiresAuth: true,
    });
  },
};

export const orgsApi = {
  async list(): Promise<Organization[]> {
    return fetchClient<Organization[]>("/orgs", {
      method: "GET",
      requiresAuth: true,
    });
  },

  async create(data: { name: string; plan_tier?: string }): Promise<Organization> {
    return fetchClient<Organization>("/orgs", {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  async get(orgId: string): Promise<Organization> {
    return fetchClient<Organization>(`/orgs/${orgId}`, {
      method: "GET",
      requiresAuth: true,
    });
  },

  async update(
    orgId: string,
    data: { name?: string; logo_url?: string; plan_tier?: string; billing_email?: string }
  ): Promise<Organization> {
    return fetchClient<Organization>(`/orgs/${orgId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  async delete(orgId: string): Promise<{ message: string }> {
    return fetchClient<{ message: string }>(`/orgs/${orgId}`, {
      method: "DELETE",
      requiresAuth: true,
    });
  },

  async transferOwnership(
    orgId: string,
    data: { new_owner_user_id: string }
  ): Promise<Organization> {
    return fetchClient<Organization>(`/orgs/${orgId}/transfer-ownership`, {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  async leave(orgId: string): Promise<{ message: string }> {
    return fetchClient<{ message: string }>(`/orgs/${orgId}/leave`, {
      method: "POST",
      requiresAuth: true,
    });
  },

  async listMembers(orgId: string): Promise<OrganizationMember[]> {
    return fetchClient<OrganizationMember[]>(`/orgs/${orgId}/members`, {
      method: "GET",
      requiresAuth: true,
    });
  },

  async updateMemberRole(
    orgId: string,
    userId: string,
    data: { role: string }
  ): Promise<OrganizationMember> {
    return fetchClient<OrganizationMember>(`/orgs/${orgId}/members/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  async removeMember(orgId: string, userId: string): Promise<{ message: string }> {
    return fetchClient<{ message: string }>(`/orgs/${orgId}/members/${userId}`, {
      method: "DELETE",
      requiresAuth: true,
    });
  },

  async listInvitations(orgId: string): Promise<OrganizationInvitation[]> {
    return fetchClient<OrganizationInvitation[]>(`/orgs/${orgId}/invitations`, {
      method: "GET",
      requiresAuth: true,
    });
  },

  async inviteMember(
    orgId: string,
    data: { email: string; role?: string }
  ): Promise<OrganizationInvitation> {
    return fetchClient<OrganizationInvitation>(`/orgs/${orgId}/invitations`, {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  async revokeInvitation(orgId: string, invitationId: string): Promise<{ message: string }> {
    return fetchClient<{ message: string }>(`/orgs/${orgId}/invitations/${invitationId}`, {
      method: "DELETE",
      requiresAuth: true,
    });
  },

  async listTeams(orgId: string): Promise<Team[]> {
    return fetchClient<Team[]>(`/orgs/${orgId}/teams`, {
      method: "GET",
      requiresAuth: true,
    });
  },

  async createTeam(
    orgId: string,
    data: { name: string; description?: string }
  ): Promise<Team> {
    return fetchClient<Team>(`/orgs/${orgId}/teams`, {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },
};

export const invitationsApi = {
  async getPreview(token: string): Promise<InvitationPublic> {
    return fetchClient<InvitationPublic>(`/invitations/${token}`, {
      method: "GET",
      requiresAuth: false,
    });
  },

  async accept(token: string): Promise<InvitationAction> {
    return fetchClient<InvitationAction>(`/invitations/${token}/accept`, {
      method: "POST",
      requiresAuth: true,
    });
  },

  async reject(token: string): Promise<InvitationAction> {
    return fetchClient<InvitationAction>(`/invitations/${token}/reject`, {
      method: "POST",
      requiresAuth: true,
    });
  },
};

export const teamsApi = {
  async get(teamId: string): Promise<Team> {
    return fetchClient<Team>(`/teams/${teamId}`, {
      method: "GET",
      requiresAuth: true,
    });
  },

  async update(
    teamId: string,
    data: { name?: string; description?: string }
  ): Promise<Team> {
    return fetchClient<Team>(`/teams/${teamId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  async listMembers(teamId: string): Promise<TeamMember[]> {
    return fetchClient<TeamMember[]>(`/teams/${teamId}/members`, {
      method: "GET",
      requiresAuth: true,
    });
  },

  async addMember(teamId: string, userId: string): Promise<TeamMember> {
    return fetchClient<TeamMember>(`/teams/${teamId}/members`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
      requiresAuth: true,
    });
  },

  async removeMember(teamId: string, userId: string): Promise<{ message: string }> {
    return fetchClient<{ message: string }>(`/teams/${teamId}/members/${userId}`, {
      method: "DELETE",
      requiresAuth: true,
    });
  },

  async delete(teamId: string): Promise<{ message: string }> {
    return fetchClient<{ message: string }>(`/teams/${teamId}`, {
      method: "DELETE",
      requiresAuth: true,
    });
  },
};
