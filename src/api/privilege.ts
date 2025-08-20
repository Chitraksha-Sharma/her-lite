const BASE_URL = '/openmrs/ws/rest/v1';
export const getPrivileges = async () => {
    const res = await fetch(`${BASE_URL}/privilege?v=full`, {
        headers: {'Accept': 'application/json'},
        credentials: "include",
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error?.message || 'Failed to fetch privileges');
      }
    return res.json();
    };