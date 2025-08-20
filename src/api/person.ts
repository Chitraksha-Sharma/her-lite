import { Row } from "react-day-picker";

const BASE_URL = '/openmrs/ws/rest/v1';

export const createPerson = async (personData: {
    firstName: string;
    lastName: string;
    gender: string;
    birthdate?: string | null;
  }) => {
    const payload = {
        names: [
          {
            givenName: personData.firstName,
            familyName: personData.lastName,
          },
        ],
        gender: personData.gender,
        birthdate: personData.birthdate || null,
        dead: false,
      };
    const response = await fetch(`${BASE_URL}/person`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || 'Failed to create person');
    }
  
    const data = await response.json();
    return data.uuid; // return person uuid
  };
  