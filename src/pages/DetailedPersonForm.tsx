import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';

const BASE_URL = '/openmrs/ws/rest/v1';

// 🔹 Fetch Person by UUID
async function fetchPerson(uuid: string) {
  const res = await fetch(`${BASE_URL}/person/${uuid}?v=full`, {
    headers: { 'Accept': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch person');
  return res.json();
}

// 🔹 Create or Update Person
async function savePerson(uuid: string | null, personData: any) {
  const method = uuid ? 'POST' : 'POST'; // POST to /person or /person/{uuid}
  const url = uuid ? `${BASE_URL}/person/${uuid}` : `${BASE_URL}/person`;

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(personData),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error?.message || 'Failed to save person');
  }

  return res.json();
}

// 🔹 Delete Person (Void/Retire)
async function deletePerson(uuid: string, reason: string) {
  const res = await fetch(`${BASE_URL}/person/${uuid}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ reason }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error?.message || 'Failed to delete person');
  }
}

export default function DetailedPersonForm() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  // Form state
  const [names, setNames] = useState([
    { givenName: '', middleName: '', familyName: '', preferred: true },
  ]);
  const [addresses, setAddresses] = useState([
    {
      preferred: true,
      address1: '',
      address2: '',
      cityVillage: '',
      stateProvince: '',
      country: '',
      postalCode: '',
    },
  ]);
  const [person, setPerson] = useState({
    gender: 'M',
    birthdate: '',
    birthdateEstimated: false,
    dead: false,
    deathDate: '',
    deathDateEstimated: false,
    causeOfDeath: '',
  });

  // Load person if editing
  useEffect(() => {
    const load = async () => {
      if (!uuid) {
        setLoading(false);
        return;
      }

      try {
        const data = await fetchPerson(uuid);

        // Load names
        if (data.names?.length > 0) {
          setNames(
            data.names.map((n: any) => ({
              givenName: n.givenName || '',
              middleName: n.middleName || '',
              familyName: n.familyName || '',
              preferred: n.preferred || false,
            }))
          );
        }

        // Load addresses
        if (data.addresses?.length > 0) {
          setAddresses(
            data.addresses.map((a: any) => ({
              preferred: a.preferred || false,
              address1: a.address1 || '',
              address2: a.address2 || '',
              cityVillage: a.cityVillage || '',
              stateProvince: a.stateProvince || '',
              country: a.country || '',
              postalCode: a.postalCode || '',
            }))
          );
        }

        // Load person info
        setPerson({
          gender: data.gender || 'M',
          birthdate: data.birthdate || '',
          birthdateEstimated: data.birthdateEstimated || false,
          dead: data.dead || false,
          deathDate: data.deathDate || '',
          deathDateEstimated: data.deathDateEstimated || false,
          causeOfDeath: data.causeOfDeath?.display || '',
        });
      } catch (err: any) {
        toast.error('Load failed: ' + (err.message || 'Not found'));
        navigate('/admin/manage-person');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [uuid, navigate]);

  // Handle Name Changes
  const updateName = (index: number, field: string, value: any) => {
    const newNames = [...names];
    (newNames[index] as any)[field] = value;
    setNames(newNames);
  };

  const addName = () => {
    setNames([
      ...names,
      { givenName: '', middleName: '', familyName: '', preferred: false },
    ]);
  };

  // Handle Address Changes
  const updateAddress = (index: number, field: string, value: any) => {
    const newAddresses = [...addresses];
    (newAddresses[index] as any)[field] = value;
    setAddresses(newAddresses);
  };

  const addAddress = () => {
    setAddresses([
      ...addresses,
      {
        preferred: false,
        address1: '',
        address2: '',
        cityVillage: '',
        stateProvince: '',
        country: '',
        postalCode: '',
      },
    ]);
  };

  // Handle Person Info
  const handlePersonChange = (field: string, value: any) => {
    setPerson((prev) => ({ ...prev, [field]: value }));
  };

  // Validate & Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const validName = names.some((n) => n.givenName.trim());
    if (!validName) {
      toast.error('At least one name must have a Given Name');
      return;
    }

    if (!person.birthdate) {
      toast.error('Birthdate is required');
      return;
    }

    try {
      await savePerson(uuid || null, {
        names: names
          .filter((n) => n.givenName.trim() || n.familyName.trim())
          .map((n) => ({
            givenName: n.givenName,
            middleName: n.middleName || undefined,
            familyName: n.familyName || 'Unknown',
            preferred: n.preferred,
          })),
        addresses: addresses
          .filter((a) => a.address1 || a.cityVillage)
          .map((a) => ({
            address1: a.address1 || undefined,
            address2: a.address2 || undefined,
            cityVillage: a.cityVillage || undefined,
            stateProvince: a.stateProvince || undefined,
            country: a.country || undefined,
            postalCode: a.postalCode || undefined,
            preferred: a.preferred,
          })),
        gender: person.gender,
        birthdate: person.birthdate,
        birthdateEstimated: person.birthdateEstimated,
        dead: person.dead,
        deathDate: person.dead ? person.deathDate : undefined,
        deathDateEstimated: person.dead ? person.deathDateEstimated : undefined,
        causeOfDeath: person.dead ? person.causeOfDeath : undefined,
      });

      toast.success(uuid ? 'Person updated!' : 'Person created!');
      navigate('/admin/manage-person');
    } catch (error: any) {
      toast.error('Save failed: ' + (error.message || 'Permission denied'));
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!uuid) return;
    if (!deleteReason.trim()) {
      toast.error('Reason is required to delete');
      return;
    }

    if (!confirm('Delete this person forever? This cannot be undone.')) return;

    setDeleting(true);
    try {
      await deletePerson(uuid, deleteReason);
      toast.success('Person deleted successfully!');
      navigate('/admin/manage-person');
    } catch (error: any) {
      toast.error('Delete failed: ' + (error.message || 'Permission denied'));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <p className="p-4">Loading person details...</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{uuid ? 'Edit Person' : 'Create Person'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-10">
          {/* Name Section */}
          <div>
            <h3 className="text-lg font-medium mb-4">Name</h3>
            {names.map((name, index) => (
              <div key={index} className="space-y-3 p-4 border rounded-md mb-4 bg-gray-50">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`preferred-name-${index}`}
                    checked={name.preferred}
                    onCheckedChange={(checked) =>
                      updateName(index, 'preferred', checked)
                    }
                  />
                  <Label htmlFor={`preferred-name-${index}`}>Preferred</Label>
                </div>

                <div>
                  <Label htmlFor={`givenName-${index}`}>Given Name *</Label>
                  <Input
                    id={`givenName-${index}`}
                    value={name.givenName}
                    onChange={(e) =>
                      updateName(index, 'givenName', e.target.value)
                    }
                    placeholder="Enter first name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`middleName-${index}`}>Middle Name</Label>
                    <Input
                      id={`middleName-${index}`}
                      value={name.middleName}
                      onChange={(e) =>
                        updateName(index, 'middleName', e.target.value)
                      }
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`familyName-${index}`}>Family Name</Label>
                    <Input
                      id={`familyName-${index}`}
                      value={name.familyName}
                      onChange={(e) =>
                        updateName(index, 'familyName', e.target.value)
                      }
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addName}>
              + Add New Name
            </Button>
          </div>

          {/* Address Section */}
          <div>
            <h3 className="text-lg font-medium mb-4">Address</h3>
            {addresses.map((addr, index) => (
              <div key={index} className="space-y-3 p-4 border rounded-md mb-4 bg-gray-50">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`preferred-addr-${index}`}
                    checked={addr.preferred}
                    onCheckedChange={(checked) =>
                      updateAddress(index, 'preferred', checked)
                    }
                  />
                  <Label htmlFor={`preferred-addr-${index}`}>Preferred</Label>
                </div>

                <div>
                  <Label htmlFor={`address1-${index}`}>Address</Label>
                  <Input
                    id={`address1-${index}`}
                    value={addr.address1}
                    onChange={(e) =>
                      updateAddress(index, 'address1', e.target.value)
                    }
                    placeholder="Street, Building, etc."
                  />
                </div>

                <div>
                  <Label htmlFor={`address2-${index}`}>Address 2</Label>
                  <Input
                    id={`address2-${index}`}
                    value={addr.address2}
                    onChange={(e) =>
                      updateAddress(index, 'address2', e.target.value)
                    }
                    placeholder="Apartment, Suite, etc."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor={`city-${index}`}>City/Village</Label>
                    <Input
                      id={`city-${index}`}
                      value={addr.cityVillage}
                      onChange={(e) =>
                        updateAddress(index, 'cityVillage', e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`state-${index}`}>State/Province</Label>
                    <Input
                      id={`state-${index}`}
                      value={addr.stateProvince}
                      onChange={(e) =>
                        updateAddress(index, 'stateProvince', e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`country-${index}`}>Country</Label>
                    <Input
                      id={`country-${index}`}
                      value={addr.country}
                      onChange={(e) =>
                        updateAddress(index, 'country', e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`postal-${index}`}>Postal Code</Label>
                    <Input
                      id={`postal-${index}`}
                      value={addr.postalCode}
                      onChange={(e) =>
                        updateAddress(index, 'postalCode', e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addAddress}>
              + Add New Address
            </Button>
          </div>

          {/* General Person Info */}
          <div>
            <h3 className="text-lg font-medium mb-4">General Person Information</h3>
            <div className="space-y-6 p-4 border rounded-md bg-gray-50">
              {/* Gender */}
              <div>
                <Label>Gender *</Label>
                <select
                  value={person.gender}
                  onChange={(e) => handlePersonChange('gender', e.target.value)}
                  className="w-full border rounded p-2"
                  required
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>

              {/* Birthdate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="birthdate">Birthdate *</Label>
                  <Input
                    id="birthdate"
                    type="date"
                    value={person.birthdate}
                    onChange={(e) => handlePersonChange('birthdate', e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-end">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="birthdateEstimated"
                      checked={person.birthdateEstimated}
                      onCheckedChange={(checked) =>
                        handlePersonChange('birthdateEstimated', checked)
                      }
                    />
                    <Label htmlFor="birthdateEstimated">Estimated</Label>
                  </div>
                </div>
              </div>

              {/* Deceased */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dead"
                  checked={person.dead}
                  onCheckedChange={(checked) => handlePersonChange('dead', checked)}
                />
                <Label htmlFor="dead">Deceased?</Label>
              </div>

              {person.dead && (
                <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="deathDate">Death Date</Label>
                      <Input
                        id="deathDate"
                        type="date"
                        value={person.deathDate}
                        onChange={(e) => handlePersonChange('deathDate', e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="deathDateEstimated"
                          checked={person.deathDateEstimated}
                          onCheckedChange={(checked) =>
                            handlePersonChange('deathDateEstimated', checked)
                          }
                        />
                        <Label htmlFor="deathDateEstimated">Estimated</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="causeOfDeath">Cause of Death</Label>
                    <Input
                      id="causeOfDeath"
                      value={person.causeOfDeath}
                      onChange={(e) => handlePersonChange('causeOfDeath', e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                </div>
              )}

              {/* Deleted Info */}
              <div className="pt-2">
                <div className="text-sm">
                  <strong>Deleted:</strong> {uuid ? 'false' : 'N/A'}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Reason for deletion: Not applicable
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6">
            <Button type="submit">Save Person</Button>
          </div>

          {/* Delete Person Forever Section */}
          {uuid && (
            <div className="border-t pt-8 space-y-4">
              <h3 className="text-lg font-medium text-red-700">Delete Person Forever</h3>
              <p className="text-sm text-gray-600">
                This action cannot be undone. Please provide a reason for deletion.
              </p>
              <div>
                <Label htmlFor="deleteReason">Reason *</Label>
                <Input
                  id="deleteReason"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="e.g., Duplicate record, Test data"
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting || !deleteReason.trim()}
                >
                  {deleting ? 'Deleting...' : 'Delete Person'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}