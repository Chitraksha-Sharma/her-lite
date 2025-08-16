const BASE_URL = '/openmrs/ws/rest/v1';
export const getPrivileges = async () => {
    const res = await fetch(`${BASE_URL}/privilege`, {
        headers: {'Accept': 'application/json'},
    });
    if (!res.ok) throw new Error('Failed to fetch privileges');
    return res.json();
    };