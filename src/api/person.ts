const BASE_URL = "/curiomed/v1";

function getAuthHeaders() {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface PersonResponse {
  success: boolean;
  data?: any;
  error?: string;
}
 
/**
 * Create a new person with the given details
 */
export async function createPerson(personData: {
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: string;
  birthdate?: string | null;
  address?: {
    address1?: string;
    cityVillage?: string;
    country?: string;
    postalCode?: string;
  } | null;
}): Promise<PersonResponse> {
  try {
    const payload: any = {
      names: [
        {
          givenName: personData.firstName,
          familyName: personData.lastName,
        },
      ],
      gender: personData.gender,
      birthdate: personData.birthdate || null,
      // dead: false,
    };

    // Add addresses if provided
    if (personData.address) {
      payload.addresses = [
        {
          address1: personData.address.address1 || null,
          cityVillage: personData.address.cityVillage || null,
          country: personData.address.country || null,
          postalCode: personData.address.postalCode || null,
        }
      ];
    }

    const res = await fetch(`${BASE_URL}/person`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { success: false, error: `Failed to create person: ${res.status} ${res.statusText} ${text}` };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err: any) {
    console.error("createPerson error:", err);
    return { success: false, error: err?.message ?? "Network error" };
  }
}

/**
 * Search for persons by query string
 */
export async function searchPerson(query: string): Promise<PersonResponse> {
  try {
    const res = await fetch(`${BASE_URL}/person/search?q=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...getAuthHeaders(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { success: false, error: `Failed to search person: ${res.status} ${res.statusText} ${text}` };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err: any) {
    console.error("searchPerson error:", err);
    return { success: false, error: err?.message ?? "Network error" };
  }
}

/**
 * Fetch person details by person UUID
 */
export async function getPersonById(personUuid: string): Promise<PersonResponse> {
  try {
    const res = await fetch(`${BASE_URL}/person/${personUuid}?v=fll`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...getAuthHeaders(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { success: false, error: `Failed to fetch person: ${res.status} ${res.statusText} ${text}` };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err: any) {
    console.error("getPersonById error:", err);
    return { success: false, error: err?.message ?? "Network error" };
  }
}

/**
 * Delete a person by UUID
 */
export async function deletePerson(personUuid: string): Promise<PersonResponse> {
  try {
    const res = await fetch(`${BASE_URL}/person/${personUuid}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { success: false, error: `Failed to delete person: ${res.status} ${res.statusText} ${text}` };
    }

    return { success: true };
  } catch (err: any) {
    console.error("deletePerson error:", err);
    return { success: false, error: err?.message ?? "Network error" };
  }
}


/**
 * Update basic person details (gender, birthdate)
 */
export async function updatePersonGenderAndBirthdate(
  personUuid: string,
  updateData: {
    gender?: string;
    birthdate?: string | null;
    dead?: boolean;
  }
): Promise<PersonResponse> {
  try {
    const payload: any = {
      gender: updateData.gender,
      birthdate: updateData.birthdate ?? null,
      dead: updateData.dead,
    };

    const res = await fetch(`${BASE_URL}/person/${personUuid}`, {
      method: "POST", // or "PUT" — adjust based on backend
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        success: false, 
        error: `Failed to update person: ${res.status} ${res.statusText} ${text}`,
      };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err: any) {
    console.error("updatePerson error:", err);
    return { success: false, error: err?.message ?? "Network error" };
  }
}


// --- Update Name ---
export async function updatePersonName(
  personUuid: string,
  nameUuid: string, 
  nameData: {
    givenName?: string;
    middleName?: string;
    familyName?: string;
    preferred?: boolean;
  }
): Promise<PersonResponse> {
  try {
    const payload: any = {};
    if (nameData.givenName) payload.givenName = nameData.givenName;
    if (nameData.middleName) payload.middleName = nameData.middleName;
    if (nameData.familyName) payload.familyName = nameData.familyName;
    if (nameData.preferred !== undefined) payload.preferred = nameData.preferred;

    const res = await fetch(`${BASE_URL}/person/${personUuid}/name/${nameUuid}`, {
      method: "POST", // ✅ your backend requires POST
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        success: false,
        error: `Failed to update person name: ${res.status} ${res.statusText} ${text}`,
      };
    }

    return { success: true, data: await res.json() };
  } catch (err: any) {
    console.error("updatePersonName error:", err);
    return { success: false, error: err?.message ?? "Network error" };
  }
}

// --- Update Address ---
export async function updatePersonAddress(
  personUuid: string,
  addressUuid: string,
  addressData: {
    address1?: string;
    address2?: string;
    cityVillage?: string;
    stateProvince?: string;
    country?: string;
    postalCode?: string;
    latitude?: string;
    longitude?: string;
    preferred?: boolean;
  }
): Promise<PersonResponse> {
  try {
    const payload: any = {};
    if (addressData.address1) payload.address1 = addressData.address1;
    if (addressData.address2) payload.address2 = addressData.address2;
    if (addressData.cityVillage) payload.cityVillage = addressData.cityVillage;
    if (addressData.stateProvince) payload.stateProvince = addressData.stateProvince;
    if (addressData.country) payload.country = addressData.country;
    if (addressData.postalCode) payload.postalCode = addressData.postalCode;
    if (addressData.latitude) payload.latitude = addressData.latitude;
    if (addressData.longitude) payload.longitude = addressData.longitude;
    if (addressData.preferred !== undefined) payload.preferred = addressData.preferred;

    const res = await fetch(`${BASE_URL}/person/${personUuid}/address/${addressUuid}`, {
      method: "POST", // ✅ your backend requires POST
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        success: false,
        error: `Failed to update person address: ${res.status} ${res.statusText} ${text}`,
      };
    }

    return { success: true, data: await res.json() };
  } catch (err: any) {
    console.error("updatePersonAddress error:", err);
    return { success: false, error: err?.message ?? "Network error" };
  }
}