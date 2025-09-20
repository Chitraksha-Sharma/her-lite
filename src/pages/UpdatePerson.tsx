import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { getPersonById, deletePerson, updatePersonName, updatePersonGenderAndBirthdate, updatePersonAddress } from '@/api/person';
import { addPersonAttribute, deletePersonAttribute, getPersonAttributes, updatePersonAttribute } from '@/api/PersonAttribute';
import { getAllAttributeTypes } from '@/api/personAttributeType'; // <- ensure this file name/path matches your project

// --- Types ---
type Name = {
  uuid?: string;
  givenName: string;
  middleName?: string;
  familyName?: string;
  preferred: boolean;
};

type Address = {
  uuid?: string;
  preferred: boolean;
  address1: string;
  address2: string;
  cityVillage: string;
  stateProvince: string;
  country: string;
  postalCode: string;
};

type PersonAttribute = {
  uuid?: string;
  display?: string;
  attributeType: { uuid: string; display: string }; // store both uuid + display
  value: string;
};


export default function UpdatePerson() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  // Form state
  const [names, setNames] = useState<Name[]>([
    { givenName: '', middleName: '', familyName: '', preferred: true },
  ]);
  const [addresses, setAddresses] = useState<Address[]>([
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

  const [attributes, setAttributes] = useState<PersonAttribute[]>([]);
  const [attributeTypeOptions, setAttributeTypeOptions] = useState<{ uuid: string; label: string }[]>([]);

  // Fetch attribute types AND the person's attributes (types first so select options exist)
  useEffect(() => {
    if (!uuid) return;

    const fetchData = async () => {
      try {
        // 1) attribute types
        const types = await getAllAttributeTypes();
        const options = (types || []).map((t: any) => ({
          uuid: t.uuid!,
          label: t.name || t.display || "Unnamed",  // <-- safer mapping
        }));
        setAttributeTypeOptions(options);

        // 2) person attributes
        const res = await getPersonAttributes(uuid);
        if (res.success && res.data) {
          const normalized = res.data.map((attr: any) => ({
            uuid: attr.uuid,
            attributeType: {
              uuid: attr.attributeType?.uuid || "",
              display: attr.attributeType?.display || "Unnamed",
            },
            value: attr.value,
          }));

          setAttributes(normalized);
        }
      } catch (err) {
        console.error('Error fetching data', err);
      }
    };

    fetchData();
  }, [uuid]);

  const updateAttributeField = (
  index: number,
  field: keyof PersonAttribute,
  value: any
) => {
  const updated = [...attributes];
  updated[index] = { ...updated[index], [field]: value };
  setAttributes(updated);
};


  const saveAttribute = async (attr: PersonAttribute, index: number) => {
    if (!uuid) return;

    // basic validation
    if (!attr.attributeType || !attr.attributeType.uuid || !attr.attributeType.uuid.trim()) {
      toast.error('Please select an attribute type before saving');
      return;
    }
    if (!attr.value || !attr.value.trim()) {
      toast.error('Please enter a value before saving');
      return;
    }

    try {
const payload = {
  uuid: attr.attributeType.uuid,
  value: attr.value,
};


      if (attr.uuid) {
        // include attributeType in update payload so type changes are persisted
        const res = await updatePersonAttribute(attr.uuid, uuid, payload);
        if (res.success) toast.success('Attribute updated!');
        else toast.error(res.error || 'Failed to update attribute');
      } else {
        const res = await addPersonAttribute(uuid, payload);
        if (res.success && res.data) {
          const updated = [...attributes];
          updated[index].uuid = res.data.uuid;
          setAttributes(updated);
          toast.success('Attribute added!');
        } else {
          toast.error(res.error || 'Failed to add attribute');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Error saving attribute');
    }
  };

  const removeAttribute = async (index: number, attr: PersonAttribute) => {
    if (!attr.uuid) {
      setAttributes(attributes.filter((_, i) => i !== index));
      return;
    }
    if (!confirm('Delete this attribute?')) return;

    try {
      const res = await deletePersonAttribute(attr.uuid!, uuid!);
      if (res.success) {
        setAttributes(attributes.filter((_, i) => i !== index));
        toast.success('Attribute deleted!');
      } else {
        toast.error(res.error);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete attribute');
    }
  };

  // Load person data (names, address, general info)
  useEffect(() => {
    if (!uuid) {
      setLoading(false);
      return;
    }

    const loadPersonData = async () => {
      try {
        setLoading(true);
        const response = await getPersonById(uuid);

        if (response.success && response.data) {
          const p = response.data;

          if (p.preferredName) {
            setNames([
              {
                uuid: p.preferredName.uuid,
                givenName: p.preferredName.givenName || '',
                middleName: p.preferredName.middleName || '',
                familyName: p.preferredName.familyName || '',
                preferred: true,
              },
            ]);
          }

          if (p.preferredAddress) {
            setAddresses([
              {
                uuid: p.preferredAddress.uuid,
                preferred: true,
                address1: p.preferredAddress.address1 || '',
                address2: p.preferredAddress.address2 || '',
                cityVillage: p.preferredAddress.cityVillage || '',
                stateProvince: p.preferredAddress.stateProvince || '',
                country: p.preferredAddress.country || '',
                postalCode: p.preferredAddress.postalCode || '',
              },
            ]);
          }

          setPerson({
            gender: p.gender || 'M',
            birthdate: p.birthdate?.split('T')[0] || '',
            birthdateEstimated: p.birthdateEstimated || false,
            dead: p.dead || p.voided || false,
            deathDate: p.deathDate ? p.deathDate.split('T')[0] : '',
            deathDateEstimated: p.deathdateEstimated || false,
            causeOfDeath: p.causeOfDeath || '',
          });
        } else {
          throw new Error(response.error || 'Failed to load person data');
        }
      } catch (error: any) {
        toast.error('Failed to load person: ' + (error.message || 'Unknown error'));
        navigate('/admin/person');
      } finally {
        setLoading(false);
      }
    };

    loadPersonData();
  }, [uuid, navigate]);

  // Handlers for form changes
  const updateName = (index: number, field: string, value: any) => {
    const newNames = [...names];
    (newNames[index] as any)[field] = value;
    setNames(newNames);
  };

  const updateAddress = (index: number, field: string, value: any) => {
    const newAddresses = [...addresses];
    (newAddresses[index] as any)[field] = value;
    setAddresses(newAddresses);
  };

  const handlePersonChange = (field: string, value: any) => {
    setPerson((prev) => ({ ...prev, [field]: value }));
  };

  // API update handlers
  const handleUpdateName = async () => {
    if (!names[0]?.uuid) {
      toast.error('No name UUID found for update');
      return;
    }
    const res = await updatePersonName(uuid!, names[0].uuid, names[0]);
    if (res.success) toast.success('Name updated successfully!');
    else toast.error(res.error);
  };

  const handleUpdateAddress = async () => {
    if (!addresses[0]?.uuid) {
      toast.error('No address UUID found for update');
      return;
    }
    const res = await updatePersonAddress(uuid!, addresses[0].uuid, addresses[0]);
    if (res.success) toast.success('Address updated successfully!');
    else toast.error(res.error);
  };

  const handleUpdateGenderAndBirthdate = async () => {
    const res = await updatePersonGenderAndBirthdate(uuid!, person);
    if (res.success) toast.success('Person info updated successfully!');
    else toast.error(res.error);
  };

  // Delete person
  const handleDelete = async () => {
    if (!uuid) return;
    if (!deleteReason.trim()) {
      toast.error('Reason is required to delete');
      return;
    }

    if (!confirm('Delete this person forever? This cannot be undone.')) return;

    setDeleting(true);
    try {
      const response = await deletePerson(uuid);
      if (response.success) {
        toast.success('Person deleted successfully!');
        navigate('/admin/manage-person');
      } else {
        throw new Error(response.error || 'Failed to delete person');
      }
    } catch (error: any) {
      toast.error('Delete failed: ' + (error.message || 'Server error'));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <p className="p-4">Loading person data...</p>;

  if (!uuid) {
    return (
      <div className="p-6">
        <p>No person selected for editing.</p>
        <Button onClick={() => navigate('/admin/person')}>Back to List</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-full bg-primary/10">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-primary">Update Person</h1>
        </div>
      </div>

      <form>
        <div className="grid gap-6">
          {/* Personal Information (names, general info) */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Personal Information</CardTitle>
              <CardDescription>Basic person details</CardDescription>
            </CardHeader>
            <CardContent>
              {/* ... (same as your original markup for names & person info) ... */}
              <div className="grid gap-6">
                {/* Names Section */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Names</h3>
                  {names.map((name, index) => (
                    <div key={index} className="space-y-3 p-4 border rounded-md mb-4 bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <Checkbox id={`preferred-name-${index}`} checked={name.preferred} onCheckedChange={(checked) => updateName(index, 'preferred', checked)} />
                        <Label htmlFor={`preferred-name-${index}`}>Preferred</Label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`givenName-${index}`}>Given Name *</Label>
                          <Input id={`givenName-${index}`} value={name.givenName} onChange={(e) => updateName(index, 'givenName', e.target.value)} placeholder="Enter first name" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`middleName-${index}`}>Middle Name</Label>
                          <Input id={`middleName-${index}`} value={name.middleName} onChange={(e) => updateName(index, 'middleName', e.target.value)} placeholder="Optional" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`familyName-${index}`}>Family Name</Label>
                          <Input id={`familyName-${index}`} value={name.familyName} onChange={(e) => updateName(index, 'familyName', e.target.value)} placeholder="Optional" />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={handleUpdateName}>Update Name</Button>
                </div>

                {/* General Person Info */}
                <div>
                  <h3 className="text-lg font-medium mb-4">General Information</h3>
                  <div className="space-y-6 p-4 border rounded-md mb-4 bg-gray-50">
                    <div className="space-y-2">
                      <Label>Gender *</Label>
                      <Select value={person.gender} onValueChange={(value) => handlePersonChange('gender', value)}>
                        <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Male</SelectItem>
                          <SelectItem value="F">Female</SelectItem>
                          <SelectItem value="O">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="birthdate">Birthdate *</Label>
                        <Input id="birthdate" type="date" value={person.birthdate} onChange={(e) => handlePersonChange('birthdate', e.target.value)} required />
                      </div>
                      <div className="flex items-end">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="birthdateEstimated" checked={person.birthdateEstimated} onCheckedChange={(checked) => handlePersonChange('birthdateEstimated', checked)} />
                          <Label htmlFor="birthdateEstimated">Estimated</Label>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="dead" checked={person.dead} onCheckedChange={(checked) => handlePersonChange('dead', checked)} />
                      <Label htmlFor="dead">Deceased?</Label>
                    </div>

                    {person.dead && (
                      <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="deathDate">Death Date</Label>
                            <Input id="deathDate" type="date" value={person.deathDate} onChange={(e) => handlePersonChange('deathDate', e.target.value)} />
                          </div>
                          <div className="flex items-end">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="deathDateEstimated" checked={person.deathDateEstimated} onCheckedChange={(checked) => handlePersonChange('deathDateEstimated', checked)} />
                              <Label htmlFor="deathDateEstimated">Estimated</Label>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="causeOfDeath">Cause of Death</Label>
                          <Input id="causeOfDeath" value={person.causeOfDeath} onChange={(e) => handlePersonChange('causeOfDeath', e.target.value)} placeholder="Optional" />
                        </div>
                      </div>
                    )}
                  </div>
                  <Button type="button" variant="outline" onClick={handleUpdateGenderAndBirthdate}>Update Gender & Birthdate</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Section */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Address</CardTitle>
              <CardDescription>Person address details</CardDescription>
            </CardHeader>
            <CardContent>
              {addresses.map((addr, index) => (
                <div key={index} className="space-y-3 p-4 border rounded-md mb-4 bg-gray-50">
                  <div className="flex items-center space-x-2">
                    <Checkbox id={`preferred-addr-${index}`} checked={addr.preferred} onCheckedChange={(checked) => updateAddress(index, 'preferred', checked)} />
                    <Label htmlFor={`preferred-addr-${index}`}>Preferred</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`address1-${index}`}>Address</Label>
                    <Input id={`address1-${index}`} value={addr.address1} onChange={(e) => updateAddress(index, 'address1', e.target.value)} placeholder="Street, Building, etc." />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`address2-${index}`}>Address 2</Label>
                    <Input id={`address2-${index}`} value={addr.address2} onChange={(e) => updateAddress(index, 'address2', e.target.value)} placeholder="Apartment, Suite, etc." />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`city-${index}`}>City/Village</Label>
                      <Input id={`city-${index}`} value={addr.cityVillage} onChange={(e) => updateAddress(index, 'cityVillage', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`state-${index}`}>State/Province</Label>
                      <Input id={`state-${index}`} value={addr.stateProvince} onChange={(e) => updateAddress(index, 'stateProvince', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`country-${index}`}>Country</Label>
                      <Input id={`country-${index}`} value={addr.country} onChange={(e) => updateAddress(index, 'country', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`postal-${index}`}>Postal Code</Label>
                      <Input id={`postal-${index}`} value={addr.postalCode} onChange={(e) => updateAddress(index, 'postalCode', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={handleUpdateAddress}>Update Address</Button>
            </CardContent>
          </Card>

          {/* Attributes Section */}
          <Card className="border-primary/20">
  <CardHeader>
    <CardTitle className="text-primary">Attributes</CardTitle>
    <CardDescription>Additional person attributes</CardDescription>
  </CardHeader>
  <CardContent>
    {attributes.map((attr, index) => (
      <div
        key={index}
        className="flex items-center gap-4 mb-4 p-3 border rounded bg-gray-50"
      >
        {/* If attribute already exists, show label instead of dropdown */}
        {attr.uuid ? (
          <span className="w-[180px] font-medium">
            {attr.attributeType?.display || "Unnamed"}
          </span>
        ) : (
          <Select
            value={attr.attributeType?.uuid}
            onValueChange={(val) =>
              updateAttributeField(index, "attributeType", {
                uuid: val,
                display:
                  attributeTypeOptions.find((opt) => opt.uuid === val)?.label ||
                  "",
              })
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {attributeTypeOptions.map((opt) => (
                <SelectItem key={opt.uuid} value={opt.uuid}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Always editable value */}
        <Input
          value={attr.value}
          onChange={(e) => updateAttributeField(index, "value", e.target.value)}
          placeholder="Enter value"
        />

        <Button type="button" onClick={() => saveAttribute(attr, index)}>
          {attr.uuid ? "Update" : "Add"}
        </Button>

        <Button
          type="button"
          variant="destructive"
          onClick={() => removeAttribute(index, attr)}
        >
          Delete
        </Button>
      </div>
    ))}

    {/* Add Attribute Button */}
    <Button
      type="button"
      variant="outline"
      onClick={() =>
        setAttributes([
          ...attributes,
          { attributeType: { uuid: "", display: "" }, value: "" },
        ])
      }
    >
      Add Attribute
    </Button>
  </CardContent>
</Card>


          {/* Delete Section */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Delete Person</CardTitle>
              <CardDescription>Permanently remove this person from the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deleteReason">Reason for Deletion *</Label>
                  <Input id="deleteReason" value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} placeholder="Enter reason for deletion" />
                </div>
                <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleting ? 'Deleting...' : 'Delete Person'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/person')}>Cancel</Button>
          </div>
        </div>
      </form>
    </div>
  );
}