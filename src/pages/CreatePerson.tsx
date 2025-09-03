import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const BASE_URL = '/openmrs/ws';

// 🔹 Create Person
async function createPerson(data: any) {
  const res = await fetch(`${BASE_URL}//fhir2/R4/Person`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error?.message || 'Failed to create person');
  }

  return res.json();
}

export default function CreatePerson() {
  const [form, setForm] = useState({
    names: { givenName: '', familyName: '' },
    gender: 'M',
    birthdate: '',
  });
  const [errors, setErrors] = useState({ name: '', birthdate: '' });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'givenName' || name === 'familyName') {
      setForm((prev) => ({
        ...prev,
        names: { ...prev.names, [name]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, gender: e.target.value }));
  };

  const validate = () => {
    const newErrors = { name: '', birthdate: '' };
    if (!form.names.givenName.trim() && !form.names.familyName.trim()) {
      newErrors.name = 'At least one name is required';
    }
    if (!form.birthdate) {
      newErrors.birthdate = 'Birthdate is required';
    }
    setErrors(newErrors);
    return !newErrors.name && !newErrors.birthdate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createPerson({
        names: [
          {
            givenName: form.names.givenName,
            familyName: form.names.familyName || 'Unknown',
          },
        ],
        gender: form.gender,
        birthdate: form.birthdate,
        dead: false,
      });

      toast.success('Person created successfully!');
      navigate('/admin/manage-person');
    } catch (error: any) {
      toast.error('Create failed: ' + (error.message || 'Permission denied'));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adding a Person</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="text-md font-medium">Create person</h4>
            <p className="text-sm text-gray-600 mt-1">
              Fill in the details to create a new person in the system.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Person Name */}
            <div>
              <Label htmlFor="givenName">Person Name *</Label>
              <div className="flex gap-2">
                <Input
                  id="givenName"
                  name="givenName"
                  value={form.names.givenName}
                  onChange={handleChange}
                  placeholder="First Name"
                />
                <Input
                  name="familyName"
                  value={form.names.familyName}
                  onChange={handleChange}
                  placeholder="Last Name (optional)"
                />
              </div>
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Birthdate */}
            <div>
              <Label htmlFor="birthdate">Birthdate *</Label>
              <Input
                id="birthdate"
                name="birthdate"
                type="date"
                value={form.birthdate}
                onChange={handleChange}
                required
              />
              {errors.birthdate && (
                <p className="text-sm text-red-500">{errors.birthdate}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <Label>Gender *</Label>
              <select
                value={form.gender}
                onChange={handleGenderChange}
                className="w-full border rounded p-2"
                required
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/admin/manage-person')}
              >
                Cancel
              </Button>
              <Button type="submit">Add</Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}