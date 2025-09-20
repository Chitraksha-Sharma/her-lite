import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, User } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { createPerson } from '@/api/person'; // Import the createPerson function
import { addPersonAttribute } from '@/api/PersonAttribute';
import { getAllAttributeTypes } from '@/api/personAttributeType';


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

  // --- inside DetailedPersonForm component ---

   const [attributeTypeOptions, setAttributeTypeOptions] = useState<{ uuid: string; label: string }[]>([]);
  const [attributes, setAttributes] = useState<{ attributeType: string; value: string }[]>([]);

  // Fetch attribute types on mount
  useEffect(() => {
    async function loadAttributeTypes() {
      const types = await getAllAttributeTypes();
      const mapped = types.map((t) => ({
        uuid: t.uuid,
        label: t.name || t.display || "Unnamed",  // <-- safer mapping
      }));
      setAttributeTypeOptions(mapped);

      // initialize first attribute if available
      if (mapped.length > 0) {
        setAttributes([{ attributeType: mapped[0].uuid, value: "" }]);
      }
    }

    loadAttributeTypes();

    if (!uuid) {
      setLoading(false);
    }
  }, [uuid]);

  // Handle Attribute Changes
  const updateAttribute = (index: number, field: string, value: any) => {
    const newAttributes = [...attributes];
    (newAttributes[index] as any)[field] = value;
    setAttributes(newAttributes);
  };

  const addAttribute = () => {
    setAttributes([
      ...attributes,
      { attributeType: attributeTypeOptions[0].uuid, value: "" },
    ]);
  };


  // Load person if editing (removed API calls)
  useEffect(() => {
    if (!uuid) {
      setLoading(false);
      return;
    }
    
    // For editing, you might want to load from local state or props
    // Since we removed fetch API, just set loading to false
    setLoading(false);
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


const handleSave = async (e: React.FormEvent) => {
  e.preventDefault();

  const validName = names.some((n) => n.givenName.trim());
  if (!validName) {
    toast.error("At least one name must have a Given Name");
    return;
  }

  if (!person.birthdate) {
    toast.error("Birthdate is required");
    return;
  }

  try {
    // Prepare person data for createPerson API
    const personData = {
      firstName:
        names.find((n) => n.givenName.trim())?.givenName ||
        names[0].givenName ||
        "",
      lastName:
        names.find((n) => n.familyName?.trim())?.familyName ||
        names[0].familyName ||
        "",
      gender: person.gender,
      birthdate: person.birthdate || null,
      address:
        addresses[0] && (addresses[0].address1 || addresses[0].cityVillage)
          ? {
              address1: addresses[0].address1 || undefined,
              cityVillage: addresses[0].cityVillage || undefined,
              country: addresses[0].country || undefined,
              postalCode: addresses[0].postalCode || undefined,
            }
          : null,
    };

    // Step 1: Create Person
    const result = await createPerson(personData);

    if (!result.success) {
      throw new Error(result.error);
    }

    const createdPerson = result.data; // assume API returns person with uuid
    const personUuid = createdPerson?.uuid;

     // Step 2: save attributes
      if (personUuid && attributes.length > 0) {
        for (const attr of attributes) {
          if (!attr.value.trim()) continue;

          const attrRes = await addPersonAttribute(personUuid, {
            uuid: attr.attributeType, // ✅ UUID
            value: attr.value,
          });

          if (!attrRes.success) {
            toast.error(`Failed to save attribute: ${attrRes.error}`);
          }
        }
      }

      toast.success("Person created successfully with attributes!");
      navigate("/admin/manage-person");
    } catch (error: any) {
      toast.error("Save failed: " + (error.message || "Server error"));
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;

  // Remove edit functionality since we only support creation
  if (uuid) {
    return (
      <div className="p-6">
        <p>Editing not supported in this version. Please create a new person.</p>
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
          <h1 className="text-3xl font-bold text-primary">Create Person</h1>
          <p className="text-muted-foreground">Create new person in the system</p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="grid gap-6">
          {/* Personal Information */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Personal Information</CardTitle>
              <CardDescription>Basic person details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {/* Names Section */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Names</h3>
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
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
                        <div className="space-y-2">
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
                        <div className="space-y-2">
                          <Label htmlFor={`familyName-${index}`}>Last Name</Label>
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

                {/* General Person Info */}
                <div>
                  <h3 className="text-lg font-medium mb-4">General Information</h3>
                  <div className="space-y-6 p-4 border rounded-md bg-gray-50">
                    {/* Gender */}
                    <div className="space-y-2">
                      <Label>Gender *</Label>
                      <Select 
                        value={person.gender} 
                        onValueChange={(value) => handlePersonChange('gender', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Male</SelectItem>
                          <SelectItem value="F">Female</SelectItem>
                          <SelectItem value="O">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Birthdate */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
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
                          <div className="space-y-2">
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

                        <div className="space-y-2">
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
                  </div>
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
                    <Checkbox
                      id={`preferred-addr-${index}`}
                      checked={addr.preferred}
                      onCheckedChange={(checked) =>
                        updateAddress(index, 'preferred', checked)
                      }
                    />
                    <Label htmlFor={`preferred-addr-${index}`}>Preferred</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`address1-${index}`}>Address 1*</Label>
                    <Input
                      id={`address1-${index}`}
                      value={addr.address1}
                      onChange={(e) =>
                        updateAddress(index, 'address1', e.target.value)
                      }
                      placeholder="Street, Building, etc."
                      // required
                    />
                  </div>

                  <div className="space-y-2">
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
                    <div className="space-y-2">
                      <Label htmlFor={`city-${index}`}>City/Village*</Label>
                      <Input
                        id={`city-${index}`}
                        value={addr.cityVillage}
                        onChange={(e) =>
                          updateAddress(index, 'cityVillage', e.target.value)
                        }
                        // required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`state-${index}`}>State/Province</Label>
                      <Input
                        id={`state-${index}`}
                        value={addr.stateProvince}
                        onChange={(e) =>
                          updateAddress(index, 'stateProvince', e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`country-${index}`}>Country</Label>
                      <Input
                        id={`country-${index}`}
                        value={addr.country}
                        onChange={(e) =>
                          updateAddress(index, 'country', e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
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
                  className="space-y-3 p-4 border rounded-md mb-4 bg-gray-50"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Dropdown for Attribute Type */}
                    <div className="space-y-2">
                      <Label htmlFor={`attrType-${index}`}>Attribute Type</Label>
                      <Select
                        value={attr.attributeType}
                        onValueChange={(value) =>
                          updateAttribute(index, "attributeType", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select attribute type" />
                        </SelectTrigger>
                        <SelectContent>
                          {attributeTypeOptions.map((opt) => (
                            <SelectItem key={opt.uuid} value={opt.uuid}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Input for Attribute Value */}
                    <div className="space-y-2">
                      <Label htmlFor={`attrValue-${index}`}>Value</Label>
                      <Input
                        id={`attrValue-${index}`}
                        value={attr.value}
                        onChange={(e) =>
                          updateAttribute(index, "value", e.target.value)
                        }
                        placeholder="Enter value"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addAttribute}>
                + Add New Attribute
              </Button>
            </CardContent>
          </Card>

          


          {/* Save Button */}
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/person')}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" />
              Save Person
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}