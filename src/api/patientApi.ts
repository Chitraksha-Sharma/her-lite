
  
//   /**
//    * Search patients across multiple safe fields by issuing multiple queries (client-side OR)
//    * Only uses safe search parameters to avoid 400 responses.
//    */
//   export const searchPatients = async (query: string): Promise<Patient[]> => {
//     if (!query || !query.trim()) return [];
  
//     const token = getSessionToken();
//     const headers: Record<string, string> = {
//       "Content-Type": "application/json",
//       Accept: "application/fhir+json",
//     };
//     if (token) headers.Authorization = `Bearer ${token}`;
  
//     const safeFields = [
//       "name", // searches name
//       "birthdate",
//       "address-city",
//       "address-postalcode",
//       "identifier",
//       "_content", // server full text search (if supported)
//     ];
  
//     const requests = safeFields.map((field) => {
//       const url = `${BASE_URL}/v1/fhir/Patient?${field}=${encodeURIComponent(query)}&_count=20`;
//       return fetch(url, { headers })
//         .then((r) => (r.ok ? r.json() : null))
//         .then((data) => {
//           if (!data) return [];
//           if (Array.isArray(data.patients) && data.patients.length > 0) {
//             return data.patients.map((p: any) => mapToPatient(p));
//           }
//           if (Array.isArray(data.entry) && data.entry.length > 0) {
//             return data.entry.map((e: any) => mapToPatient(e.resource ?? e));
//           }
//           return [];
//         })
//         .catch((e) => {
//           console.warn("ignored search error for field", field, e);
//           return [];
//         });
//     });
  
//     const results = await Promise.all(requests);
//     const merged = results.flat();
  
//     // deduplicate by id
//     const unique = Array.from(new Map(merged.map((p) => [p.id, p])).values());
//     return unique;
//   };


import { format } from "date-fns";

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

export interface Patient {
  id: string;
  identifier: string;
  name: string;
  birthdate?: string;
  age?: number | null;
  gender?: string;
  phone?: string;
  city?: string;
  status?: string;
  state: string;
  postalCode: string;
  country: string;
}

export const getSessionToken = (): string | null => {
  try {
    const authSession = localStorage.getItem("authSession");
    if (authSession) {
      const parsed = JSON.parse(authSession);
      return parsed.token || null;
    }
    const legacy = localStorage.getItem("session");
    if (legacy) {
      const parsed = JSON.parse(legacy);
      return parsed.token || null;
    }
    return localStorage.getItem("authToken");
  } catch (error) {
    console.error("Invalid token in localStorage:", error);
    return null;
  }
};

export const getSelectedLocation = (): string | null => {
  try {
    const stored = localStorage.getItem("selectedLocation");
    if (stored) return stored;
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

/** safe helpers */
const safeFirst = (arr: any) =>
  Array.isArray(arr) && arr.length > 0 ? arr[0] : undefined;

const calculateAge = (birthDate?: string | null): number | undefined => {
  if (!birthDate) return undefined;
  const d = new Date(birthDate);
  if (isNaN(d.getTime())) return undefined;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
};

// Normalize FHIR → Patient model
export const mapToPatient = (input: any): Patient => {
  const resource = input?.resource ?? input ?? {};
  const id = resource.id ?? "-";

  const identObj = safeFirst(resource.identifier);
  const identifier =
    identObj?.value ?? identObj?.system ?? identObj?.type?.text ?? "-";

  const birthdate = resource.birthDate ?? resource.birthdate ?? "-";

  const nameObj = safeFirst(resource.name);
  let name = "-";
  if (nameObj) {
    if (typeof nameObj.text === "string" && nameObj.text.trim()) {
      name = nameObj.text.trim();
    } else {
      const given = Array.isArray(nameObj.given)
        ? nameObj.given.join(" ")
        : nameObj.given ?? "";
      const family = nameObj.family ?? "";
      const built = `${given} ${family}`.trim();
      name = built || "-";
    }
  }

  let phone = "-";
  if (Array.isArray(resource.telecom) && resource.telecom.length > 0) {
    const tel = resource.telecom.find((t: any) => {
      return (
        (t.system && t.system.toLowerCase() === "phone") ||
        (typeof t.value === "string" && /^\+?\d/.test(t.value))
      );
    });
    phone = tel?.value ?? resource.telecom[0]?.value ?? "-";
  }

  const addr = safeFirst(resource.address);
  const city = addr?.city ?? "-";
  const state = addr?.state ?? "-";
  const postalCode = addr?.postalCode ?? addr?.postalcode ?? "-";
  const country = addr?.country ?? "-";

  const gender =
    resource.gender ??
    (typeof resource.gender === "string" ? resource.gender : "-");
  const status = resource.active === true ? "Active" : "Inactive";

  const age = calculateAge(resource.birthDate ?? resource.birthdate);

  return {
    id,
    identifier,
    name,
    birthdate,
    age,
    gender,
    phone,
    city,
    state,
    postalCode,
    country,
    status,
  };
};

// 🔹 Fetch all patients
export const fetchPatients = async (): Promise<Patient[]> => {
  const token = getSessionToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/fhir+json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = `${BASE_URL}/v1/fhir/Patient?name=doe`;

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`fetchPatients failed: ${res.status} ${txt}`);
    }

    const data = await res.json();
    if (Array.isArray(data.patients) && data.patients.length > 0) {
      return data.patients.map((p: any) => mapToPatient(p));
    }
    if (Array.isArray(data.entry) && data.entry.length > 0) {
      return data.entry.map((e: any) => mapToPatient(e.resource ?? e));
    }
    return [];
  } catch (err) {
    console.error("fetchPatients error:", err);
    return [];
  }
};

// 🔹 Fetch patient by ID (normalized)
export const fetchPatientById = async (
  patientId: string
): Promise<any | null> => {
  const token = getSessionToken();
  if (!token) {
    console.error("fetchPatientById: missing token");
    return null;
  }

  try {
    const res = await fetch(`${BASE_URL}/v1/fhir/Patient/${patientId}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/fhir+json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`fetchPatientById failed: ${res.status} ${txt}`);
    }

    const data = await res.json();
    return data; // return raw FHIR Patient
  } catch (err) {
    console.error("fetchPatientById error:", err);
    return null;
  }
};

// 🔹 Submit patient
export const submitPatient = async (
  formData: PatientFormData,
  abhaNumber: string,
  aadhaarNumber: string
): Promise<SubmitPatientResponse> => {
  const token = getSessionToken();
  if (!token) return { success: false, error: "auth_token_missing" };

  const location = getSelectedLocation();
  if (!location) return { success: false, error: "location_not_selected" };

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
      birthDate: formData.dateOfBirth
        ? format(formData.dateOfBirth, "yyyy-MM-dd")
        : undefined,
      address: [
        {
          line: [
            formData.houseStreet ||
              formData.gramPanchayat ||
              formData.tehsil,
          ].filter(Boolean),
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
                value: `+91-${formData.emergencyPhone.slice(
                  0,
                  5
                )}-${formData.emergencyPhone.slice(5)}`,
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
    if (
      error.message.includes("network") ||
      error.message.includes("failed to fetch")
    ) {
      return { success: false, error: "network_error" };
    }
    return { success: false, error: error.message || "Failed to register patient." };
  }
};

// 🔹 Update patient
export const updatePatient = async (
  patientId: string,
  payload: any
): Promise<SubmitPatientResponse> => {
  const token = getSessionToken();
  if (!token) return { success: false, error: "auth_token_missing" };

  try {
    const body = {
      resourceType: "Patient",
      id: patientId,
      ...payload,
    };

    const response = await fetch(`${BASE_URL}/v1/fhir/Patient/${patientId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let errorText;
      try {
        errorText = await response.text();
      } catch {
        errorText = response.statusText;
      }

      if (response.status === 401 || response.status === 403) {
        return { success: false, error: "auth_token_invalid" };
      }

      return {
        success: false,
        error: `API Error: ${response.status} - ${errorText}`,
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error: any) {
    if (
      error.message?.toLowerCase().includes("network") ||
      error.message?.toLowerCase().includes("failed to fetch")
    ) {
      return { success: false, error: "network_error" };
    }
    return {
      success: false,
      error: error.message || "Failed to update patient.",
    };
  }
};

