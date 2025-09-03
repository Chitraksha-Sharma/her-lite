import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Patient {
  uuid: string;
  display: string;
  identifier: string;
  age: number;
  gender: 'M' | 'F' | 'O';
}

export default function ViewAllPatients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [form, setForm] = useState({
    fullName: '',
    birthdate: '',
    age: '',
    gender: 'M' as 'M' | 'F' | 'O',
    identifier: '',
    identifierType: '',
    location: '',
    preferred: false,
  });

  // Dropdown options
  const [identifierTypes, setIdentifierTypes] = useState<{ value: string; label: string }[]>([]);
  const [locations, setLocations] = useState<{ value: string; label: string }[]>([]);

  const BASE_URL = '/openmrs/ws/rest/v1';

  // Fetch Identifier Types
  const fetchIdentifierTypes = async () => {
    try {
      const res = await fetch(`${BASE_URL}//patientidentifiertype`, {
        headers: { 'Accept': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch identifier types');
      const data = await res.json();
      setIdentifierTypes(
        data.results.map((t: any) => ({ value: t.uuid, label: t.display }))
      );
    } catch (err: any) {
      toast.error('Load failed: ' + (err.message || 'Identifier types'));
    }
  };

  // Fetch Locations
  const fetchLocations = async () => {
    try {
      const res = await fetch(`${BASE_URL}//location?limit=<integer>&startIndex=<integer>&v=custom&q=<string>&tag=<string>`, {
        headers: { 'Accept': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch locations');
      const data = await res.json();
      setLocations(
        data.results.map((l: any) => ({ value: l.uuid, label: l.display }))
      );
    } catch (err: any) {
      toast.error('Load failed: ' + (err.message || 'Locations'));
    }
  };

  // Fetch Patients
  const fetchPatients = async () => {
    setLoading(true);
    try {
       // ✅ Build URL manually
      let url = `${BASE_URL}/patient`;
      const params = new URLSearchParams();

      if (searchTerm) params.append('q', searchTerm);
      if (includeDeleted) params.append('voided', 'true');
      params.append('v', 'full'); // Get full representation

      url += '?' + params.toString();
      // const url = new URL(`${BASE_URL}//patient?q=`);
      // if (searchTerm) url.searchParams.append('q', searchTerm);
      // if (includeDeleted) url.searchParams.append('voided', 'true');
      // url.searchParams.append('v', 'full');

      const res = await fetch(url.toString(), {
        headers: { 'Accept': 'application/json' },
        credentials: 'include',
      });

      const text = await res.text();
      let data: any;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Invalid JSON: ${text.slice(0, 120)}...`);
      }

      if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`);

      const list: Patient[] = (data.results || []).map((p: any): Patient => {
        const person = p.person || p;
        return {
          uuid: p.uuid,
          display: person.display || 'Unknown',
          identifier: (p.identifiers?.[0]?.identifier) || '',
          age: person.age || 0,
          gender: ['M', 'F', 'O'].includes(person.gender) ? person.gender : 'O',
        };
      });

      setPatients(list);
    } catch (err: any) {
      console.error('Error fetching patients:', err);
      toast.error(`Failed to fetch patients: ${err?.message || 'Network error'}`);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchIdentifierTypes();
    fetchLocations();
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [searchTerm, includeDeleted]);

  // Handle form input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, gender: e.target.value as 'M' | 'F' | 'O' }));
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const age = e.target.value;
    setForm((prev) => ({ ...prev, age }));
    if (age) {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - parseInt(age, 10));
      const isoDate = birthDate.toISOString().split('T')[0];
      setForm((prev) => ({ ...prev, birthdate: isoDate }));
    } else {
      setForm((prev) => ({ ...prev, birthdate: '' }));
    }
  };

  const handleBirthdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setForm((prev) => ({ ...prev, birthdate: date, age: '' }));
  };

  // Submit Patient Creation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName.trim()) return toast.error('Person Name is required');
    if (!form.birthdate) return toast.error('Birthdate is required');
    if (!form.gender) return toast.error('Gender is required');
    if (!form.identifier.trim()) return toast.error('Identifier is required');
    if (!form.identifierType) return toast.error('Identifier Type is required');

    // Split name
    const nameParts = form.fullName.trim().split(' ');
    const givenName = nameParts[0];
    const familyName = nameParts.slice(1).join(' ') || 'Unknown';

    const payload = {
      identifiers: [
        {
          identifier: form.identifier,
          identifierType: { uuid: form.identifierType },
          location: form.location ? { uuid: form.location } : undefined,
          preferred: form.preferred,
        },
      ],
      person: {
        names: [
          {
            givenName,
            familyName,
          },
        ],
        gender: form.gender,
        birthdate: form.birthdate,
      },
    };

    // Remove undefined fields
    if (!payload.identifiers[0].location) delete payload.identifiers[0].location;

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}//patient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data: any;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Invalid response: ${text.slice(0, 120)}...`);
      }

      if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`);

      toast.success('Patient created successfully!');
      setModalOpen(false);
      setForm({
        fullName: '',
        birthdate: '',
        age: '',
        gender: 'M',
        identifier: '',
        identifierType: '',
        location: '',
        preferred: false,
      });
      fetchPatients();
    } catch (error: any) {
      toast.error(`Failed: ${error?.message || 'Check console'}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((p) => {
    const name = (p.display ?? '').toLowerCase();
    const idf = (p.identifier ?? '').toLowerCase();
    const q = searchTerm.toLowerCase();
    return name.includes(q) || idf.includes(q);
  });

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-center justify-between gap-4">
        <Button onClick={() => setModalOpen(true)} disabled={loading}>
          Create New Patient
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Find Patient(s)</h3>
          <div className="flex max-w-2xl gap-6">
            <Label>Patient Identifier or Name:</Label>
            <Input
              placeholder="Enter identifier or name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex items-end">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeDeleted"
                  checked={includeDeleted}
                  onCheckedChange={(checked) => setIncludeDeleted(!!checked)}
                />
                <Label htmlFor="includeDeleted">Include Deleted</Label>
              </div>
            </div>
          </div>
        </div>

        {/* Patients Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Identifier</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">Loading...</TableCell>
                </TableRow>
              ) : filteredPatients.length > 0 ? (
                filteredPatients.map((p) => (
                  <TableRow key={p.uuid}>
                    <TableCell className="font-medium">{p.display}</TableCell>
                    <TableCell>{p.identifier || '-'}</TableCell>
                    <TableCell>{p.age}</TableCell>
                    <TableCell>{p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                    No patients found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Create Patient Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="md:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Patient</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Patient Identifiers Section */}
              <div className="border p-4 rounded-md bg-gray-50">
                <h3 className="text-md font-medium mb-4">Patient Identifiers</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="preferred"
                      checked={form.preferred}
                      onCheckedChange={(checked) => handleChange({ target: { name: 'preferred', checked, type: 'checkbox' } } as any)}
                    />
                    <Label htmlFor="preferred">Preferred</Label>
                  </div>

                  <div>
                    <Label htmlFor="identifier">Identifier *</Label>
                    <Input
                      id="identifier"
                      name="identifier"
                      value={form.identifier}
                      onChange={handleChange}
                      placeholder="e.g., MRN123"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="identifierType">Identifier Type *</Label>
                    <Select
                      value={form.identifierType}
                      onValueChange={(value) => handleSelectChange('identifierType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {identifierTypes.length === 0 ? (
                          <div className="p-2 text-sm text-gray-500">No types available</div>
                        ) : (
                          identifierTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Select
                      value={form.location}
                      onValueChange={(value) => handleSelectChange('location', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Locations</SelectItem>
                        {locations.map((loc) => (
                          <SelectItem key={loc.value} value={loc.value}>
                            {loc.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Person Details */}
              <div>
                <Label htmlFor="fullName">Person Name *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="birthdate">Birthdate *</Label>
                  <Input
                    id="birthdate"
                    name="birthdate"
                    type="date"
                    value={form.birthdate}
                    onChange={handleBirthdateChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age (Years)</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    value={form.age}
                    onChange={handleAgeChange}
                    placeholder="e.g., 25"
                    min="0"
                    max="120"
                  />
                </div>
              </div>

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
                  <option value="O">Other</option>
                </select>
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Patient'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}