// src/api/user.ts
// const BASE_URL = "/curiomed/v1";
import { API_BASE } from "./apiBase";

function getAuthHeaders() {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Get all users
 */
export async function getUsers() {
  try {
    const res = await fetch(`${API_BASE}/v1/user`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        ...getAuthHeaders(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return { success: false, error: `Failed to fetch users: ${res.status} ${res.statusText}` };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.error("getUsers error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

/**
 * Get one user by uuid
 * options.forceReload -> will set fetch cache to no-store to avoid conditional 304 responses
 */
export async function getUser(uuid: string, options?: { forceReload?: boolean }) {
  try {
    const fetchOpts: RequestInit = {
      method: "GET",
      headers: {
        "Accept": "application/json",
        ...getAuthHeaders(),
      },
    };

    if (options?.forceReload) {
      (fetchOpts as any).cache = "no-store";
    }

    const res = await fetch(`${API_BASE}/v1/user/${uuid}`, fetchOpts);
    if (!res.ok) {
      return { success: false, error: `Failed to fetch user: ${res.status} ${res.statusText}` };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.error("getUser error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

/**
 * Create user
 */
export async function createUser(userData: {
  username: string;
  password: string;
  personUuid: string;
  roles: { uuid: string }[];
}) {
  try {
    const payload = {
      username: userData.username,
      password: userData.password,
      person: userData.personUuid,
      userProperties: {},
      roles: userData.roles,
    };

    const res = await fetch(`${API_BASE}/v1/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || `User creation failed: ${res.status}` };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.error("createUser error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

/**
 * Delete user
 */
export async function deleteUser(uuid: string) {
  try {
    const res = await fetch(`${API_BASE}/v1/user/${uuid}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error?.message || `Failed to delete user: ${res.status}` };
    }

    return { success: true };
  } catch (err) {
    console.error("deleteUser error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

/**
 * Create role
 */
export async function createRole(roleData: {
  uuid?: string;
  name: string;
  description?: string;
  privileges?: { uuid: string }[];
  inheritedRoles?: { uuid: string }[];
}) {
  try {
    const payload: any = {
      name: roleData.name,
      description: roleData.description || "",
      privileges: roleData.privileges || [],
    };

    const res = await fetch(`${API_BASE}/v1/role`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error?.message || `Failed to create role: ${res.status}` };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.error("createRole error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

/**
 * Get roles list
 */
export async function getRoles() {
  try {
    const res = await fetch(`${API_BASE}/v1/role?v=full`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        ...getAuthHeaders(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error?.message || `Failed to fetch roles: ${res.status}` };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.error("getRoles error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}