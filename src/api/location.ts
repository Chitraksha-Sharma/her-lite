// src/api/location.ts

// Use relative path since Vite proxy will handle the routing
// const OPENMRS_BASE_URL = "/openmrs";
const BASE_URL = "/curiomed/v1";

export interface Location {
  uuid: string;
  display: string;
  links?: Array<{ 
    rel: string;
    uri: string;
    resourceAlias: string;
  }>;
}

export interface LocationsResponse {
  results: Location[];
}

export interface LocationApiResponse {
  success: boolean;
  data?: Location[];
  error?: string;
}

function getAuthHeaders() {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const getLocations = async (): Promise<LocationApiResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/location?v=default`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      // credentials: "include", // Important for session cookies
    });

    console.log("Locations response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to fetch locations:", response.status, errorText);
      
      if (response.status === 401) {
        return { 
          success: false, 
          error: "Session expired. Please login again." 
        };
      }
      
      return { 
        success: false, 
        error: `Failed to fetch locations: ${response.status} ${response.statusText}` 
      };
    }

    const data: LocationsResponse = await response.json();
    console.log("Locations data:", data);

    return { 
      success: true, 
      data: data.results 
    };

  } catch (error) {
    console.error("Location fetch error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error occurred while fetching locations' 
    };
  }
};

// Get a specific location by UUID
export const getLocationByUuid = async (uuid: string): Promise<LocationApiResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/location/${uuid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      // credentials: "include",
    });

    if (!response.ok) {
      return { 
        success: false, 
        error: `Failed to fetch location: ${response.status} ${response.statusText}` 
      };
    }

    const data: Location = await response.json();
    return { 
      success: true, 
      data: [data] 
    };

  } catch (error) {
    console.error("Location fetch error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error occurred' 
    };
  }
};