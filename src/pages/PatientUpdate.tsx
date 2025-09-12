import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchPatientById,
  updatePatient,
  PatientFormData,
} from "@/api/patientApi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PatientUpdate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<PatientFormData>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    email: "",
    houseStreet: "",
    postalCode: "",
    gramPanchayat: "",
    tehsil: "",
    cityVillage: "",
    district: "",
    state: "",
    emergencyContact: "",
    emergencyPhone: "",
    bloodType: "",
    allergies: "",
    medicalHistory: "",
    photo: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const p = await fetchPatientById(id);
        if (p) {
          const nameObj = p.name?.[0] || {};
          const given = Array.isArray(nameObj.given)
            ? nameObj.given[0]
            : nameObj.given || "";
          const family = nameObj.family || "";
  
          const addr = p.address?.[0] || {};
          const tel = Array.isArray(p.telecom) ? p.telecom[0]?.value : "";
  
          setForm({
            firstName: given,
            lastName: family,
            dateOfBirth: p.birthDate || "",
            gender: p.gender || "",
            phone: tel || "",
            email: p.telecom?.find((t: any) => t.system === "email")?.value || "",
            houseStreet: addr.line?.[0] || "",
            gramPanchayat: addr.line?.[1] || "",
            tehsil: addr.line?.[2] || "",
            cityVillage: addr.city || "",
            district: addr.district || "",
            state: addr.state || "",
            postalCode: addr.postalCode || "",
            emergencyContact: "",
            emergencyPhone: "",
            bloodType:
              p.extension?.find((e: any) =>
                e.url?.includes("patient-bloodGroup")
              )?.valueString || "",
            allergies: "",
            medicalHistory: "",
            photo: "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch patient:", err);
        alert("Failed to load patient details. Please try again.");
      } finally {
        setLoading(false); // ✅ always runs
      }
    };
    load();
  }, [id]);
  

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);

    const payload = {
      name: [{ given: [form.firstName], family: form.lastName }],
      gender: form.gender,
      birthDate: form.dateOfBirth,
      address: [
        {
          line: [form.houseStreet, form.gramPanchayat, form.tehsil].filter(
            Boolean
          ),
          city: form.cityVillage,
          district: form.district,
          state: form.state,
          postalCode: form.postalCode,
          country: "India",
        },
      ],
      telecom: [
        { system: "phone", value: form.phone, use: "mobile" },
        ...(form.email ? [{ system: "email", value: form.email }] : []),
        ...(form.emergencyPhone
          ? [{ system: "phone", value: form.emergencyPhone, use: "mobile" }]
          : []),
      ],
      extension: [
        ...(form.bloodType
          ? [
              {
                url: "http://hl7.org/fhir/StructureDefinition/patient-bloodGroup",
                valueString: form.bloodType,
              },
            ]
          : []),
      ],
    };

    const result = await updatePatient(id, payload);
    setLoading(false);

    if (result.success) {
      alert("Patient updated successfully!");
      navigate("/patients");
    } else {
      alert("Failed to update: " + result.error);
    }
  };

  if (loading) {
    return <p className="p-6">Loading patient details...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Update Patient</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>First Name</Label>
            <Input name="firstName" value={form.firstName} onChange={handleChange} />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input name="lastName" value={form.lastName} onChange={handleChange} />
          </div>
        </div>

        {/* DOB + Gender */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Date of Birth</Label>
            <Input
              type="date"
              name="dateOfBirth"
              value={form.dateOfBirth}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Gender</Label>
            <Select
              value={form.gender}
              onValueChange={(val) => setForm((prev) => ({ ...prev, gender: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Phone</Label>
            <Input name="phone" value={form.phone} onChange={handleChange} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" name="email" value={form.email} onChange={handleChange} />
          </div>
        </div>

        {/* Address */}
        <div>
          <Label>House/Street</Label>
          <Input name="houseStreet" value={form.houseStreet} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Gram Panchayat</Label>
            <Input
              name="gramPanchayat"
              value={form.gramPanchayat}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Tehsil</Label>
            <Input name="tehsil" value={form.tehsil} onChange={handleChange} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>City/Village</Label>
            <Input name="cityVillage" value={form.cityVillage} onChange={handleChange} />
          </div>
          <div>
            <Label>District</Label>
            <Input name="district" value={form.district} onChange={handleChange} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>State</Label>
            <Input name="state" value={form.state} onChange={handleChange} />
          </div>
          <div>
            <Label>Postal Code</Label>
            <Input name="postalCode" value={form.postalCode} onChange={handleChange} />
          </div>
        </div>

        {/* Emergency */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Emergency Contact</Label>
            <Input
              name="emergencyContact"
              value={form.emergencyContact}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Emergency Phone</Label>
            <Input
              name="emergencyPhone"
              value={form.emergencyPhone}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Blood Type */}
        <div>
          <Label>Blood Type</Label>
          <Input name="bloodType" value={form.bloodType} onChange={handleChange} />
        </div>

        {/* Allergies */}
        <div>
          <Label>Allergies</Label>
          <Textarea name="allergies" value={form.allergies} onChange={handleChange} />
        </div>

        {/* Medical History */}
        <div>
          <Label>Medical History</Label>
          <Textarea
            name="medicalHistory"
            value={form.medicalHistory}
            onChange={handleChange}
          />
        </div>

        {/* Photo */}
        {/* <div>
          <Label>Photo URL</Label>
          <Input name="photo" value={form.photo} onChange={handleChange} />
        </div> */}

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Patient"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PatientUpdate;
