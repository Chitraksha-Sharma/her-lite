// src/api/provider.ts
// const BASE_URL = "/curiomed/v1";
import { API_BASE } from "./apiBase";

function getAuthHeaders() {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface ProviderResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Fetch all providers (no query param). Many backends return { results: [...] } or an array.
 */
export async function getProviders(): Promise<ProviderResponse> {
  try {
    const res = await fetch(`${API_BASE}/v1/provider`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...getAuthHeaders(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { success: false, error: `Failed to fetch providers: ${res.status} ${res.statusText} ${text}` };
    }

    const json = await res.json();
    // Normalize: some backends return { results: [...] }, some return an array
    const list = Array.isArray(json) ? json : (json?.results ?? []);
    return { success: true, data: list };
  } catch (err: any) {
    console.error("getProviders error:", err);
    return { success: false, error: err?.message ?? "Network error" };
  }
}

/**
 * Find a provider object for a given person UUID by fetching all providers and matching person.uuid.
 */
export async function findProviderForPerson(personUuid: string): Promise<ProviderResponse> {
  const all = await getProviders();
  if (!all.success) return { success: false, error: all.error || "Failed to fetch providers" };

  const providers = all.data as any[];
  const found = providers.find((p) => p?.person?.uuid === personUuid);
  if (!found) return { success: false, error: "No provider found for this person" };
  return { success: true, data: found };
}

/**
 * Create a provider for a given person UUID.
 * Payload shape may vary by backend; this uses a minimal body that most OpenMRS variants accept.
 * Adjust `identifier` if your backend requires specific format.
 */
export async function createProvider(personUuid: string, identifier?: string): Promise<ProviderResponse> {
  try {
    const payload = {
      person: personUuid,
      identifier: identifier ?? `prov-${Date.now()}`,
      // attributes: [], // add if backend expects attributes
    };

    const res = await fetch(`${API_BASE}/v1/provider`, {
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
      return { success: false, error: `Failed to create provider: ${res.status} ${res.statusText} ${text}` };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err: any) {
    console.error("createProvider error:", err);
    return { success: false, error: err?.message ?? "Network error" };
  }
}

/**
 * Fetch provider details by provider UUID
 */
export async function getProviderByUuid(providerUuid: string): Promise<ProviderResponse> {
  try {
    const res = await fetch(`${API_BASE}/v1/provider/${providerUuid}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...getAuthHeaders(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { success: false, error: `Failed to fetch provider: ${res.status} ${res.statusText} ${text}` };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err: any) {
    console.error("getProviderByUuid error:", err);
    return { success: false, error: err?.message ?? "Network error" };
  }
}