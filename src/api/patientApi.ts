// src/api/patientApi.ts

import { format } from "date-fns";

// const BASE_URL = "/curiomed/v1";
const BASE_URL = import.meta.env.VITE_API_URL; 

export interface PatientFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  houseStreet: string;
  postalCode: string;
  gramPanchayat: string;
  tehsil: string;
  cityVillage: string;
  district: string;
  state: string;
  emergencyContact: string;
  emergencyPhone: string;
  bloodType: string;
  allergies: string;
  medicalHistory: string;
  photo: string;
}

export interface SubmitPatientResponse {
  success: boolean;
  data?: any;
  error?: string;
}


export const getSessionToken = (): string | null => {
    try {
      // First try new storage (authSession / authToken)
      const authSession = localStorage.getItem("authSession");
      if (authSession) {
        const parsed = JSON.parse(authSession);
        return parsed.token || null;
      }
  
      // Fallback: old session (if any)
      const legacy = localStorage.getItem("session");
      if (legacy) {
        const parsed = JSON.parse(legacy);
        return parsed.token || null;
      }
  
      // As last fallback: plain token
      return localStorage.getItem("authToken");
    } catch (error) {
      console.error("Invalid token in localStorage:", error);
      return null;
    }
  };
  

// ✅ Check if location is selected
// export const getSelectedLocation = (): string | null => {
//   return localStorage.getItem("selectedLocation"); // or sessionStorage
// };

export const getSelectedLocation = (): string | null => {
    try {
      // ✅ First check new key
      const stored = localStorage.getItem("selectedLocation");
      if (stored) return stored;
  
      // ✅ Fallback: old format (currentLocation as JSON object)
      const current = localStorage.getItem("currentLocation");
      if (current) {
        const parsed = JSON.parse(current);
        return parsed.uuid || null;
      }
  
      return null;
    } catch (err) {
      console.error("Error reading location:", err);
      return null;
    }
  };

/**
 * Submits patient data to Curiomed FHIR endpoint
 */
export const submitPatient = async (
  formData: PatientFormData,
  abhaNumber: string,
  aadhaarNumber: string
): Promise<SubmitPatientResponse> => {
  const token = getSessionToken();
  if (!token) {
    return { success: false, error: "auth_token_missing" };
  }

  // Optional: enforce location selection
  // Remove this block if location is not mandatory
  const location = getSelectedLocation();
  if (!location) {
    return { success: false, error: "location_not_selected" };
  }

  try {
    const patientPayload = {
      resourceType: "Patient",
      meta: {
        profile: ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient"],
      },
      identifier: [
        ...(abhaNumber.trim()
          ? [
              {
                system: "https://abdm.gov.in/id/abha",
                value: abhaNumber.replace(/\s/g, ""),
              },
            ]
          : []),
        ...(aadhaarNumber.trim()
          ? [
              {
                system: "https://uidai.gov.in/aadhaar",
                value: aadhaarNumber.replace(/-/g, ""),
              },
            ]
          : []),
      ],
      name: [
        {
          given: [formData.firstName],
          family: formData.lastName,
        },
      ],
      gender: formData.gender,
      birthDate: formData.dateOfBirth ? format(formData.dateOfBirth, "yyyy-MM-dd") : undefined,
      address: [
        {
          line: [formData.houseStreet || formData.gramPanchayat || formData.tehsil].filter(Boolean),
          city: formData.cityVillage,
          district: formData.district,
          state: formData.state,
          postalCode: formData.postalCode,
          country: "India",
        },
      ],
      telecom: [
        {
          system: "phone",
          use: "mobile",
          value: `+91-${formData.phone.slice(0, 5)}-${formData.phone.slice(5)}`,
        },
        ...(formData.email
          ? [
              {
                system: "email",
                value: formData.email,
                use: "home",
              },
            ]
          : []),
        ...(formData.emergencyPhone
          ? [
              {
                system: "phone",
                use: "mobile",
                value: `+91-${formData.emergencyPhone.slice(0, 5)}-${formData.emergencyPhone.slice(5)}`,
              },
            ]
          : []),
      ],
      extension: [
        {
          url: "http://fhir.openmrs.org/ext/patient/attribute#category",
          valueString: "General",
        },
        ...(formData.bloodType
          ? [
              {
                url: "http://hl7.org/fhir/StructureDefinition/patient-bloodGroup",
                valueString: formData.bloodType,
              },
            ]
          : []),
      ],
    };

    const response = await fetch(`${BASE_URL}/v1/fhir/Patient`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(patientPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 401 || response.status === 403) {
        return { success: false, error: "auth_token_invalid" };
      }
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error: any) {
    if (error.message.includes("network") || error.message.includes("failed to fetch")) {
      return { success: false, error: "network_error" };
    }
    return {
      success: false,
      error: error.message || "Failed to register patient.",
    };
  }
};