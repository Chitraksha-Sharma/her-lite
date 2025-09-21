// src/api/auth.ts
import { apiRequest } from "./apiBase";

/**
 * Login with username/password.
 */
export async function loginApi(username: string, password: string) {
  try {
    const response = await apiRequest("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error("Login failed:", response.status, data);
      return { success: false, error: data?.message || "Invalid credentials" };
    }

    return {
      success: true,
      token: data.accessToken,
      user: data.user,
    };
  } catch (err) {
    console.error("Network/login error:", err);
    return { success: false, error: "Network error" };
  }
}

/**
 * Logout function
 */
export async function logoutApi(token: string) {
  try {
    const response = await apiRequest("/v1/auth/logout", {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) throw new Error("Logout failed");
    return true;
  } catch (err) {
    console.warn("Logout failed on server, clearing token locally");
    return true;
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUser(token: string) {
  const response = await apiRequest("/v1/auth/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Failed to fetch user profile");
  return await response.json();
};
