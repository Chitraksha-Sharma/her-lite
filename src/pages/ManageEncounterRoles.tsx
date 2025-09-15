import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Search } from 'lucide-react';
import { Value } from '@radix-ui/react-select';

const BASE_URL = '/openmrs/ws/rest/v1';

// 🔹 Fetch Visit Attribute Types
// async function getVisitAttributeTypes() {
//   const res = await fetch(`${BASE_URL}/visitattributetype?v=full`, {
//     headers: { 'Accept': 'application/json' },
//     credentials: 'include',
//   });
//   if (!res.ok) throw new Error('Failed to fetch visit attribute types');
//   return res.json();
// }

// 🔹 Create Visit Attribute Type
// async function createVisitAttributeType(data: any) {
//     const res = await fetch(`${BASE_URL}/visitattributetype`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       credentials: 'include',
//       body: JSON.stringify(data),
//     });
//     if (!res.ok) {
//       const error = await res.json().catch(() => ({}));
//       throw new Error(error.error?.message || 'Failed to create visit attribute type');
//     }
//     return res.json();
//   }

 // 🔹 Mock Data Types (OpenMRS supports these)
const DATA_TYPES = [
    { value: 'org.openmrs.FreeText', label: 'org.openmrs.customdatatype.datatype.FreeTextDatatype' },
    { value: 'org.openmrs.Concept', label: 'org.openmrs.customdatatype.datatype.LongFreeTextDatatype' },
    { value: 'org.openmrs.Patient', label: 'org.openmrs.customdatatype.datatype.BooleanDatatype' },
    // { value: 'org.openmrs.Provider', label: 'Provider' },
    // { value: 'org.openmrs.Location', label: 'Location' },
    // { value: 'org.openmrs.Form', label: 'Form' },
    // { value: 'org.openmrs.Order', label: 'Order' },
    // { value: 'org.openmrs.User', label: 'User' },
  ];
  
  // 🔹 Mock Handlers (Optional)
  const HANDLERS = [
    {Value: 'Default', Label: 'Default'},
    { value: 'org.openmrs.web.attribute.FreeTextHandler', label: 'Default' },
    { value: 'org.openmrs.web.attribute.ConceptHandler', label: 'Concept Handler' },
  ];

  export default function ManageEncounterRoles() {
    const [attributeTypes, setAttributeTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
  
    // Form state
    const [form, setForm] = useState({
      name: '',
      description: '',
      datatypeClassname: '',
      datatypeConfig: '',
      preferredHandler: '',
    });

     // Load attribute types
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getVisitAttributeTypes();
        setAttributeTypes(data.results || []);
      } catch (err: any) {
        toast.error('Load failed: ' + (err.message || 'Network error'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Handle form input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

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
    if (!form.datatypeClassname) {
      toast.error('Data Type is required');
      return;
    }

    const payload = {
      name: form.name,
      description: form.description || null,
      datatypeClassname: form.datatypeClassname,
      datatypeConfig: form.datatypeConfig || null,
      preferredHandler: form.preferredHandler || null,
    };

    // try {
    //     const newType = await createVisitAttributeType(payload);
    //     setAttributeTypes((prev) => [newType, ...prev]);
    //     toast.success('Visit Attribute Type created!');
    //     setForm({
    //       name: '',
    //       description: '',
    //       datatypeClassname: '',
    //       datatypeConfig: '',
    //       preferredHandler: '',
    //     });
    //     setModalOpen(false);
    //   } catch (error: any) {
    //     toast.error('Create failed: ' + (error.message || 'Permission denied'));
    //   }
    };
  
    if (loading) return <p className="p-4">Loading visit attribute types...</p>;

    return (
        <Card>
          <CardHeader className="flex flex-wrap justify-between gap-2">
            <CardTitle>Encounter Role Management</CardTitle>
            {/* <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none" />      
            <Input
                placeholder="Search provider attribute types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
            />
            </div> */}
            <div>
            <Button onClick={() => setModalOpen(true)} className='item-start'>+ Add Encounter Role</Button>
            </div>
            <h1><b>Current Encounter Roles</b></h1>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attributeTypes.length > 0 ? (
                    attributeTypes.map((type) => (
                      <TableRow key={type.uuid}>
                        <TableCell className="font-medium">{type.display}</TableCell>
                        <TableCell>{type.description || '-'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                    <TableCell colSpan={2} className="text-center py-6 text-gray-500">
                      No Encounter roles found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Add Provider Attribute Type Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Encounter Type</DialogTitle>
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
                  placeholder="e.g., Referral Source, Visit Purpose"
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
             

                {/* Data Type (Required) */}
                {/* <div>
                <Label htmlFor="datatypeClassname">Edit Privilege</Label>
                <Select
                  value={form.datatypeClassname}
                  onValueChange={(value) => handleSelectChange('datatypeClassname', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select data type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DATA_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div> */}

               {/* Preferred Handler */}
               {/* <div>
                <Label htmlFor="preferredHandler">View Privilege</Label>
                <Select
                  value={form.preferredHandler}
                  onValueChange={(value) => handleSelectChange('preferredHandler', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select handler" />
                  </SelectTrigger>
                  <SelectContent>
                    {HANDLERS.map((handler) => (
                      <SelectItem key={handler.value} value={handler.value}>
                        {handler.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div> */}
              
              <DialogFooter className="mt-6">
                {/* <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button> */}
                <Button type="submit">Save Encounter Role</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
