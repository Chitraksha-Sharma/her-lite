// src/api/auth.ts

const BASE_URL = '/openmrs/ws/rest/v1';

export async function loginWithOpenMRS(username: string, password: string) {
  // Step 1: kill any existing session first
  await fetch(`${BASE_URL}/session`, {
    method: "DELETE",
    credentials: "include",
  });

  // Step 2: attempt login with provided credentials
  const credentials = btoa(`${username}:${password}`);
  const response = await fetch(`${BASE_URL}/session`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${credentials}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    return { success: false, error: 'Invalid credentials' };
  }

  const data = await response.json();
  return {
    success: data.authenticated,
    user: data.user,
  };
}


export async function logoutFromOpenMRS() {
  const response = await fetch(`${BASE_URL}/session`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Logout failed');
  }

  return true;
}

export async function getSession() {
  const response = await fetch(`${BASE_URL}/session`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Session fetch failed');
  }

  return await response.json();
}
