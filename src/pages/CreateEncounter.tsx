import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const BASE_URL = '/openmrs/ws/rest/v1';

interface Patient {
  uuid: string;
  display: string;
}

interface Location {
  uuid: string;
  display: string;
}

interface EncounterType {
  uuid: string;
  display: string;
}

interface Form {
  uuid: string;
  display: string;
}

interface Provider {
  uuid: string;
  display: string;
  identifier: string;
}
// roles added
interface Role {
    uuid: string;
    display: string;
}

interface ProviderRow {
  role: string;
  provider: string;
}

export default function CreateEncounter() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [encounterTypes, setEncounterTypes] = useState<EncounterType[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [roles, setRoles] =useState<Role[]>([]); //added role
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    patient: '',
    location: '',
    encounterDate: '',
    visit: '',
    encounterType: '',
    form: '',
  });

  const [providerRows, setProviderRows] = useState<ProviderRow[]>([]);

  // Fetch data
  useEffect(() => {
    const load = async () => {
      try {
        const [locs, types, forms, provs, roles] = await Promise.all([
          fetch(`${BASE_URL}/location`).then(r => r.json()).then(d => d.results),
          fetch(`${BASE_URL}/encountertype`).then(r => r.json()).then(d => d.results),
          fetch(`${BASE_URL}/form`).then(r => r.json()).then(d => d.results),
          fetch(`${BASE_URL}/provider`).then(r => r.json()).then(d => d.results),
          fetch(`${BASE_URL}/encounterrole`).then(r => r.json()).then(d => d.results),
        ]);
        setLocations(locs);
        setEncounterTypes(types);
        setForms(forms);
        setProviders(provs);
        setRoles(roles);
      } catch (err) {
        toast.error('Failed to load dropdowns');
      }
    };
    load();
  }, []);

  const searchPatients = async (query: string) => {
    if (query.length < 2) return;
    try {
    const res = await fetch(`${BASE_URL}/patient?q=${query}&v=full`, {
        // const res = await fetch(`${BASE_URL}/patient?q=b52ec6f9-0e26-424c-a4a1-c64f9d571eb3`, {
        credentials: 'include',
      });
      const data = await res.json();
      setPatients((data.results || []).map((p: any) => ({
        uuid: p.uuid,
        display: p.person.display,
      })));
    } catch (err) {
      console.error('Search patients failed');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProvider = () => {
    setProviderRows([...providerRows, { role: '', provider: '' }]);
  };

  const updateProviderRow = (index: number, field: 'role' | 'provider', value: string) => {
    const newRows = [...providerRows];
    newRows[index][field] = value;
    setProviderRows(newRows);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patient || !form.encounterDate) {
      toast.error('Patient and Encounter Date are required');
      return;
    }

    const payload = {
      patient: { uuid: form.patient },
      encounterDatetime: form.encounterDate,
      location: form.location ? { uuid: form.location } : undefined,
      encounterType: { uuid: form.encounterType },
      form: form.form ? { uuid: form.form } : undefined,
      providers: providerRows
        .filter(p => p.role && p.provider)
        .map(p => ({
          encounterRole: { uuid: p.role }, // You may need to fetch roles
          provider: { uuid: p.provider },
        })),
    };

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/encounter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to create encounter');
      const data = await res.json();

      toast.success('Encounter created!');
      navigate(`/admin/edit-encounter/${data.uuid}`);
    } catch (err: any) {
      toast.error('Create failed: ' + (err.message || 'Permission denied'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Encounter Management</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Encounter Summary */}
          <div>
            <h3 className="text-lg font-medium mb-4">Encounter Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Patient *</Label>
                <div className="space-y-1">
                  <Input
                    placeholder="Enter patient name or ID"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      searchPatients(e.target.value);
                    }}
                  />
                  <div className="max-h-32 overflow-y-auto text-sm border rounded p-2 bg-gray-50">
                    {patients.length > 0 ? (
                      patients.map((p) => (
                        <div
                          key={p.uuid}
                          className="p-1 hover:bg-gray-200 cursor-pointer"
                          onClick={() => setForm((prev) => ({ ...prev, patient: p.uuid }))}
                        >
                          {p.display}
                        </div>
                      ))
                    ) : (
                      <div className="p-1 text-gray-500">No patients found</div>
                    )}
                  </div>
                </div>
                <div>
                <Label htmlFor="location">Location</Label>
                <Select name="location" value={form.location} onValueChange={(value) => handleChange({ target: { name: 'location', value } } as any)}>

                    <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                        {locations.map((loc) => (
                        <SelectItem key={loc.uuid} value={loc.uuid}>
                            {loc.display}
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                </div>
                <div>
                    <Label htmlFor="encounterDate">Encounter Date *</Label>
                    <Input
                    id="encounterDate"
                    name="encounterDate"
                    type="datetime-local"
                    value={form.encounterDate}
                    onChange={handleChange}
                    required
                    />
                </div>
                <div>
                    <Label htmlFor="visit">Visit</Label>
                    <Input
                    id="visit"
                    name="visit"
                    placeholder="e.g., Initial Visit"
                    />
                </div>
                <div>
                    <Label htmlFor="encounterType">Encounter Type *</Label>
                    <Select name="encounterType" value={form.encounterType} onValueChange={(value) => handleChange({ target: { name: 'encounterType', value } } as any)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        {encounterTypes.map((type) => (
                        <SelectItem key={type.uuid} value={type.uuid}>
                            {type.display}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="form">Form</Label>
                    <Select name="form" value={form.form} onValueChange={(value) => handleChange({ target: { name: 'form', value } } as any)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select form" />
                    </SelectTrigger>
                    <SelectContent>
                        {forms.map((f) => (
                        <SelectItem key={f.uuid} value={f.uuid}>
                            {f.display}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Providers */}
          <div>
            <h3 className="text-lg font-medium mb-4">Providers</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role *</TableHead>
                    <TableHead>Provider Name *</TableHead>
                    <TableHead>Identifier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providerRows.length > 0 ? (
                    providerRows.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Select
                            value={row.role}
                            onValueChange={(value) => updateProviderRow(index, 'role', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((p) => (
                                    <SelectItem key={p.uuid} value={p.uuid}>
                                        {p.display}
                                    </SelectItem>
                                ))}
                              {/* <SelectItem value="doctor">Doctor</SelectItem>
                              <SelectItem value="nurse">Nurse</SelectItem>
                              <SelectItem value="clinician">Clinician</SelectItem> */}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={row.provider}
                            onValueChange={(value) => updateProviderRow(index, 'provider', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                            <SelectContent>
                              {providers.map((p) => (
                                <SelectItem key={p.uuid} value={p.uuid}>
                                  {p.display}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {providers.find(p => p.uuid === row.provider)?.identifier || '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                        No providers added
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <Button type="button" variant="outline" className="mt-2" onClick={handleAddProvider}>
              + Add Provider
            </Button>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="secondary" onClick={() => navigate('/admin/manage-encounters')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Save'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}