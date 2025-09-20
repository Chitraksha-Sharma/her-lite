const BASE_URL = "/curiomed/v1";

function getAuthHeaders() {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ✅ Domain types
export interface PersonAttribute {
  uuid?: string;
  display?: string;
  name?: string;
   attributeType: { uuid: string; display: string }; // expects object
  value: string;
}

/**
 * Add an attribute to a person
 */
export async function addPersonAttribute(
  personUuid: string,
  attributeData: { uuid: string; value: string }
): Promise<{ success: boolean; data?: PersonAttribute; error?: string }> {
  try {
    const payload = {
      attributeType: attributeData.uuid,
      value: attributeData.value,
    };

    const res = await fetch(`${BASE_URL}/person/${personUuid}/attribute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || "Failed to add attribute",
      };
    }

    const data: PersonAttribute = await res.json();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || "An error occurred" };
  }
}

/**
 * Fetch attributes for a person
 * ✅ Normalized to return PersonAttribute[]
 */
export async function getPersonAttributes(
  personUuid: string
): Promise<{ success: boolean; data?: PersonAttribute[]; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/person/${personUuid}/attribute`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || "Failed to fetch attributes",
      };
    }

    const data = await res.json();

    if (!data.results || !Array.isArray(data.results)) {
      return {
        success: false,
        error: "Invalid response format",
      };
    }

   // 🔑 Normalize response into PersonAttribute[]
const attributes: PersonAttribute[] = data.results.map((a: any) => ({
  uuid: a.uuid,
  attributeType: {
    uuid: a.attributeType?.uuid || "",
    display: a.attributeType?.display || "",
  },
  value: a.value,
}));


    return { success: true, data: attributes };
  } catch (error: any) {
    return { success: false, error: error.message || "An error occurred" };
  }
}

/**
 * Update an attribute for a person
 */
export async function updatePersonAttribute(
  attributeUuid: string,
  personUuid: string,
  attributeData: { value: string }
): Promise<{ success: boolean; data?: PersonAttribute; error?: string }> {
  try {
    const payload = { value: attributeData.value };

    const res = await fetch(
      `${BASE_URL}/person/${personUuid}/attribute/${attributeUuid}`,
      {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || "Failed to update attribute",
      };
    }

    const data: PersonAttribute = await res.json();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || "An error occurred" };
  }
}

/**
 * Delete an attribute for a person
 */
export async function deletePersonAttribute(
  attributeUuid: string,
  personUuid: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(
      `${BASE_URL}/person/${personUuid}/attribute/${attributeUuid}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          ...getAuthHeaders(),
        },
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || "Failed to delete attribute",
      };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "An error occurred" };
  }
}