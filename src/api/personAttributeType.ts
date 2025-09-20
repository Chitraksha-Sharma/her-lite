// const BASE_URL = "/curiomed/v1";
import { API_BASE } from "./apiBase";

function getAuthHeaders() {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface PersonAttributeType {
  uuid?: string; 
  display?: string;
  name: string;
  description?: string;
  format: string;
  searchable?: boolean;
  foreignKey?: number;
  editPrivilege?: string;
  retired?: boolean;
}

// 🔹 Get single attribute type by UUID
export async function getAttributeType(uuid: string): Promise<PersonAttributeType> {
  const res = await fetch(`${API_BASE}/v1/personattributetype/${uuid}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error?.message || "Failed to fetch attribute type");
  }
  const data = await res.json();
  return data;  
}

// 🔹 Get all attribute types
export async function getAllAttributeTypes(): Promise<PersonAttributeType[]> {
  const res = await fetch(`${API_BASE}/v1/personattributetype`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error?.message || "Failed to fetch attribute types");
  }
  const data = await res.json();
  // Some APIs return { results: [...] }, others return just [...]
  return Array.isArray(data) ? data : data.results || [];
}



// 🔹 Create attribute type
export async function createAttributeType(attributeData: PersonAttributeType): Promise<PersonAttributeType> {
  const payload: any = {
    name: attributeData.name,
    description: attributeData.description,
    format: attributeData.format,
    searchable: attributeData.searchable,
    foreignKey: attributeData.foreignKey,
    editPrivilege: attributeData.editPrivilege,
    // Note: do NOT send `retired` — backend rejects this property on create
  };
  const res = await fetch(`${API_BASE}/v1/personattributetype`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error?.message || "Failed to create attribute type");
  }
  const data = await res.json();
  return data;
}

// 🔹 Update attribute type
export async function updateAttributeType(uuid: string, attributeData: Partial<PersonAttributeType>): Promise<PersonAttributeType> {
  const res = await fetch(`${API_BASE}/v1/personattributetype/${uuid}`, {
    method: "POST", 
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(attributeData), // ✅ send only provided fields
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error?.message || "Failed to update attribute type");
  }
  const data = await res.json();
  return data;
}

// 🔹 Delete attribute type
export async function deleteAttributeType(uuid: string): Promise<void> {
  const res = await fetch(`${API_BASE}/v1/personattributetype/${uuid}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error?.message || "Failed to delete attribute type");
  }
  return;
}