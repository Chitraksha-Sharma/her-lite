// src/api/provider.ts
const BASE_URL = "/curiomed/v1";

function getAuthHeaders() {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Fetch provider by person UUID → returns the provider UUID
 */
export interface Provider {
  uuid: string;
  display: string;
  person: {
    uuid: string;
    display: string;
    links: any[];
  };
  identifier: string;
  attributes: any[];
  retired: boolean;
  links: any[];
  resourceVersion: string;
}

export interface ProviderResponse {
  success: boolean;
  data?: Provider;
  error?: string;
}

// ✅ Fetch provider by person UUID (return single provider)
export const getProviderForPerson = async (personUuid: string): Promise<ProviderResponse> => {
  try {
    const res = await fetch(`${BASE_URL}/provider/${personUuid}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        ...getAuthHeaders(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Failed to fetch provider:", res.status, errorText);
      return {
        success: false,
        error: `Failed to fetch provider: ${res.status} ${res.statusText}`,
      };
    }

    const data: Provider = await res.json();
    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error("Error fetching provider:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
};
