import { Row } from "react-day-picker";

const BASE_URL = '/openmrs/ws/rest/v1';

export const createPerson = async (personData: {
    firstName: string;
    lastName: string;
    gender: string;
  }) => {
    const response = await fetch(`${BASE_URL}/person`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Accept': 'application/json',
        // Include auth if needed (e.g., Basic Auth or session)
        // 'Authorization': 'Basic ' + btoa('admin:Admin123'), // replace with real auth
      },
      credentials: 'include',
      body: JSON.stringify({
        names: [
          {
            givenName: personData.firstName,
            familyName: personData.lastName,
          },
        ],
        gender: personData.gender,
        birthdate: null, // optional
        dead: false,
      }),
    });
  
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || 'Failed to create person');
    }
  
    return await response.json();
  };
  