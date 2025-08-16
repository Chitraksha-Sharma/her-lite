import { Row } from "react-day-picker";

const BASE_URL = '/openmrs/ws/rest/v1';

// Reuse session cookie via credentials: include
export async function getUsers() {
  const response = await fetch(`${BASE_URL}/user`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return await response.json();
}

export async function getUser(uuid: string) {
  const response = await fetch(`${BASE_URL}/user/${uuid}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }

  return await response.json();
}

export async function createUser(userData: {
  username: string;
  password: string;
  // confirmPassword: string;
  personUuid: string;
  roles: { uuid: string }[];
}) {
  const payload = {
    username: userData.username,
    password: userData.password,
    person: userData.personUuid, // 👈 This is correct: "person" field with UUID
    userProperties: {}, // Optional: add user properties if needed
    roles: userData.roles,
  };
 
  const response = await fetch(`${BASE_URL}/user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Accept': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'User creation failed');
  }

  return await response.json();
}

export const createRole = async (roleData: {
  uuid?: string;
  name: string;
  description?: string;
  privileges?: { uuid: string }[];
  inheritedRoles?: { uuid: string }[];
}) => {
  const payload: any = {
    name: roleData.name,
    description: roleData.description || '',
    privileges: roleData.privileges || [],
    // Note: OpenMRS doesn't directly support "inheritedRoles" in POST — handled manually via roles
  };

  const res = await fetch(`${BASE_URL}/role`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error?.message || 'Failed to create role');
  }

  return res.json();
};

export async function getRoles() {
  const response = await fetch(`${BASE_URL}/role`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch roles');
  }

  return await response.json();
}
