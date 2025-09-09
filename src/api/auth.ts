// src/api/auth.ts

const BASE_URL = "/curiomed/v1";

/**
 * Login with username/password.
 * Returns { success, token, user }
 */
export async function loginApi(username: string, password: string) {
  try{
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error("Login failed:", response.status, data);
      return { success: false, error: data?.message || "Invalid credentials" };
    }

    return {
      success: true,
      token: data.accessToken, // ✅ save this!
      user: data.user,
    };
  }catch (err) {
    console.error("Network/login error:", err);
    return { success: false, error: "Network error" };
  }
}

/**
 * Logout function.
 * If backend supports a logout endpoint, call it.
 * Otherwise, just remove token client-side.
 */
export async function logoutApi(token: string) {
  try {
    const response = await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST", // check your backend spec, could be POST or DELETE
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Logout failed");
    }

    return true;
  } catch (err) {
    console.warn("Logout failed on server, clearing token locally");
    return true;
  }
}

/**
 * Get current user profile from token.
 * (If backend does not provide a `/me` or `/session`, you can decode JWT client-side instead.)
 */
export async function getCurrentUser(token: string) {
  const response = await fetch(`${BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }

  return await response.json();
}