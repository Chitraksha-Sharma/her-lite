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
  confirmPassword: string;
  person: { uuid: string };
  roles: { uuid: string }[];
}) {
  const response = await fetch(`${BASE_URL}/user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'User creation failed');
  }

  return await response.json();
}

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
