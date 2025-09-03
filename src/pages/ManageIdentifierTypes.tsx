import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const BASE_URL = '/openmrs/ws/rest/v1';

// 🔹 Fetch Identifier Types
async function getIdentifierTypes() {
  const res = await fetch(`${BASE_URL}/patientidentifiertype`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch identifier types');
  return res.json();
}

// 🔹 Create Identifier Type
async function createIdentifierType(data: any) {
  const res = await fetch(`${BASE_URL}/patientidentifiertype/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error?.message || 'Failed to create identifier type');
  }
  return res.json();
}

// 🔹 Mock Validators (OpenMRS has built-in validators)
const VALIDATORS = [
    { value: 'org.openmrs.validator.IdentifierValidator', label: 'Default Validator' },
    { value: 'org.openmrs.module.idgen.validator.LuhnChecksumIdentifierValidator', label: 'Luhn Checksum Validator' },
    { value: 'org.openmrs.module.idgen.validator.SequentialIdentifierValidator', label: 'Sequential Validator' },
  ];
  
  export default function ManageIdentifierTypes() {
    const [identifierTypes, setIdentifierTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
  
    // Form state
    const [form, setForm] = useState({
      name: '',
      description: '',
      format: '', // regex
      formatDescription: '',
      required: false,
      locationBehavior: '',
      uniquenessBehavior: '',
      validator: '',
    });
  
    // Load identifier types
    useEffect(() => {
      const load = async () => {
        try {
          const data = await getIdentifierTypes();
          setIdentifierTypes(data.results || []);
        } catch (err: any) {
          toast.error('Load failed: ' + (err.message || 'Network error'));
        } finally {
          setLoading(false);
        }
      };
      load();
    }, []);

     // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = 'checked' in e.target ? e.target.checked : false;
        setForm((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // Handle select changes
    const handleSelectChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name.trim()) {
        toast.error('Name is required');
        return;
        }

        const payload = {
        name: form.name,
        description: form.description || null,
        format: form.format || null,
        formatDescription: form.formatDescription || null,
        required: form.required,
        locationBehavior: form.locationBehavior || null,
        uniquenessBehavior: form.uniquenessBehavior || null,
        validator: form.validator || null,
        };

        try {
        const newType = await createIdentifierType(payload);
        setIdentifierTypes((prev) => [newType, ...prev]);
        toast.success('Identifier type created successfully!');
        setForm({
            name: '',
            description: '',
            format: '',
            formatDescription: '',
            required: false,
            locationBehavior: '',
            uniquenessBehavior: '',
            validator: '',
        });
        setModalOpen(false);
        } catch (error: any) {
        toast.error('Create failed: ' + (error.message || 'Permission denied'));
        }
    };
    if(loading) return <p className='p-4'>Loading identifier types...</p>;

    return (
        <Card>
          <CardHeader className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle>Manage Identifier Types</CardTitle>
            <Button onClick={() => setModalOpen(true)}>+ Add Patient Identifier Type</Button>
          </CardHeader>
          <CardContent>
            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {identifierTypes.length > 0 ? (
                    identifierTypes.map((type) => (
                      <TableRow key={type.uuid}>
                        <TableCell className="font-medium">{type.display}</TableCell>
                        <TableCell>{type.description || '-'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-6 text-gray-500">
                        No identifier types found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Add Identifier Type Modal */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                <DialogTitle>Add Patient Identifier Type</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name (Required) */}
                <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g., National ID, Medical Record Number"
                    required
                    />
                </div>

                {/* Description */}
                <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Optional description"
                    />
                </div>

                {/* Regex Format */}
                <div>
                    <Label htmlFor="format">Regex Format</Label>
                    <Input
                    id="format"
                    name="format"
                    value={form.format}
                    onChange={handleChange}
                    placeholder=""
                    />
                </div>

                {/* Format Description */}
                <div>
                    <Label htmlFor="formatDescription">Description of Format (to help guide user) </Label>
                    <Input
                    id="formatDescription"
                    name="formatDescription"
                    value={form.formatDescription}
                    onChange={handleChange}
                    placeholder=""
                    />
                </div>

                {/* Is Required */}
                <div className="flex items-center space-x-2">
                    <Checkbox
                    id="required"
                    name="required"
                    checked={form.required}
                    onCheckedChange={(checked) =>
                        setForm((prev) => ({ ...prev, required: !!checked }))
                    }
                    />
                    <Label htmlFor="required">Is Required</Label>
                </div>

                {/* Location Behavior */}
              <div>
                <Label>Location Behavior</Label>
                <Select
                  value={form.locationBehavior}
                  onValueChange={(value) => handleSelectChange('locationBehavior', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location behavior" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REQUIRED">Required</SelectItem>
                    <SelectItem value="NOT_USED">Not Used</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Uniqueness Behavior */}
              <div>
                <Label>Uniqueness Behavior</Label>
                <Select
                  value={form.uniquenessBehavior}
                  onValueChange={(value) => handleSelectChange('uniquenessBehavior', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select uniqueness behavior" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNIQUE">Must be unique</SelectItem>
                    <SelectItem value="NOT_UNIQUE">Can be duplicated</SelectItem>
                    <SelectItem value="UNIQUE_EACH_LOCATION">Unique per location</SelectItem>
                  </SelectContent>
                </Select>
              </div>


               {/* Identifier Validator */}
               <div>
                <Label>Identifier Validator</Label>
                <Select
                  value={form.validator}
                  onValueChange={(value) => handleSelectChange('validator', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select validator" />
                  </SelectTrigger>
                  <SelectContent>
                    {VALIDATORS.map((v) => (
                      <SelectItem key={v.value} value={v.value}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
