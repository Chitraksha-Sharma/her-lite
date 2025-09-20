const BASE_URL = '/curiomed/v1';

const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface privilege {
    uuid: string;
    display: string;
    name: string;
    description: string;
    retired: boolean;
}

export const getPrivileges = async () => {
    const res = await fetch(`${BASE_URL}/privilege`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            ...getAuthHeaders(),
        },
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error?.message || 'Failed to fetch privileges');
      }
    return res.json();
};

export const getPrivilegeByUuid = async (uuid: string) => {
    const res = await fetch(`${BASE_URL}/privilege/${uuid}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            ...getAuthHeaders(),
        },
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error?.message || 'Failed to fetch privilege');
      }
    return res.json();
};


export const createPrivilege = async (privilegeData: {name: string, description: string}) => { 
    const payload = {
        name: privilegeData.name,
        description: privilegeData.description, 
        retired: false,
    };
    const res = await fetch(`${BASE_URL}/privilege`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json', 
            ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error?.message || 'Failed to create privilege');
      }
    return res.json();
}

export const updatePrivilege = async (uuid: string, privilegeData: {description?: string}) => {
    const payload = {
        description: privilegeData.description,
    };
    const res = await fetch(`${BASE_URL}/privilege/${uuid}`, {  
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
    }); 
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error?.message || 'Failed to update privilege');
      }
    return res.json();  
}

export const deletePrivilege = async (uuid: string) => {
    const res = await fetch(`${BASE_URL}/privilege/${uuid}`, {
        method: 'DELETE', 
        headers: {
            'Accept': 'application/json',
            ...getAuthHeaders(),
        },
    }); 
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error?.message || 'Failed to delete privilege');
      } 
    return res.json();
}