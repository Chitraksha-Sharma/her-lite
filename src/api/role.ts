const BASE_URL = '/openmrs/ws/rest/v1';

export const updateRole = async (uuid: string, roleData: {
    name: string;
    description?: string;
    privileges?: { uuid: string }[];
  }) => {
    const payload = {
      name: roleData.name,
      description: roleData.description || '',
      privileges: roleData.privileges || [],
    };
  
    const res = await fetch(`${BASE_URL}/role/${uuid}`, {
      method: 'POST', // OpenMRS uses POST for update
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error?.message || 'Failed to update role');
    }
  
    return res.json();
  };
  
  export const deleteRole = async (uuid: string) => {
    const res = await fetch(`${BASE_URL}/role/{{taget_role_uuid}?purge=true`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error?.message || 'Failed to delete role');
    }
  };