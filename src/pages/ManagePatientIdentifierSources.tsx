import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
//import { useNavigate } from 'react-router-dom';

const BASE_URL = '/openmrs/ws/rest/v1';

// 🔹 Fetch Identifier Types
async function fetchIdentifierTypes() {
  const res = await fetch(`${BASE_URL}/patientidentifiertype`, {
    headers: { 'Accept': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch identifier types');
  const data = await res.json();
  return data.results.map((type: any) => ({
    value: type.uuid,
    label: type.display,
  }));
}

// 🔹 Fetch Identifier Sources
async function fetchIdentifierSources() {
  const res = await fetch(`${BASE_URL}/idgen/identifiersource?v=full`, {
    headers: { 'Accept': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch identifier sources');
  const data = await res.json();
  return data.results;
}

// 🔹 Create Identifier Source
async function createSequentialSource(payload: any) {
  const res = await fetch(`${BASE_URL}/idgen/identifiersource`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  console.log('POST URL:', `${BASE_URL}/idgen/identifiersource`);
  console.log('Payload:', payload);
  console.log('Status:', res.status);

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error?.message || 'Failed to create source');
  }
  return res.json();
}

export default function ManagePatientIdentifierSources() {
  const [sources, setSources] = useState<any[]>([]);
  const [identifierTypes, setIdentifierTypes] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  //const navigate = useNavigate();

  // Form Selection
  const [selectedIdentifierType, setSelectedIdentifierType] = useState('');
  const [sourceType, setSourceType] = useState('');

  // Modal visibility
  const [modalOpen, setModalOpen] = useState(false);


  const [form, setForm] = useState({
    name: '',
    description: '',
    baseCharacterSet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    firstIdentifierBase: '',
    prefix: '',
    suffix: '',
    minLength: 1,
    maxLength: 20,
    skipValidation: false,
  });


  // Load data
  useEffect(() => {
    const load = async () => {
      try {
        const [types, sources] = await Promise.all([
          fetchIdentifierTypes(),
          fetchIdentifierSources(),
        ]);
        // console.log('Fetched identifierTypes:', types);
        setIdentifierTypes(types);
        setSources(sources);
      } catch (err: any) {
        toast.error('Load failed: ' + (err.message || 'Check IDGen module'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

   // Handle Add Click → Open Modal
   const handleAddClick = () => {
    if (!selectedIdentifierType) {
      toast.error('Please select an Identifier Type');
      return;
    }
    if (!sourceType) {
      toast.error('Please select a Source Type');
      return;
    }
    setModalOpen(true);
  };

  // Handle form input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!form.baseCharacterSet.trim()) {
      toast.error('Base Character Set is required');
      return;
    }
    if (!form.firstIdentifierBase.trim()) {
      toast.error('First Identifier Base is required');
      return;
    }

    try {
      await createSequentialSource({
        name: form.name,
        description: form.description,
        prefix: form.prefix,
        suffix: form.suffix,
        minLength: form.minLength,
        maxLength: form.maxLength,
        startNumber: parseInt(form.firstIdentifierBase, 10),
        baseCharacterSet: form.baseCharacterSet,
        identifierType: { uuid: selectedIdentifierType },
        baseClass: 'org.openmrs.module.idgen.SequentialNumberGenerator',
        skipAutomaticAssignment: form.skipValidation,
      });

      toast.success('Identifier source created!');
      setModalOpen(false);

       // Refresh list
       const updated = await fetchIdentifierSources();
       setSources(updated);
 
       // Reset form
       setForm({
         name: '',
         description: '',
         baseCharacterSet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
         firstIdentifierBase: '1',
         prefix: '',
         suffix: '',
         minLength: 1,
         maxLength: 20,
         skipValidation: false,
       });
     } catch (error: any) {
       toast.error('Create failed: ' + (error.message || 'Permission denied'));
     }
   };


  if (loading) return <p className="p-4">Loading...</p>;

  // Get selected identifier type label
  const selectedTypeLabel = identifierTypes.find(t => t.value === selectedIdentifierType)?.label || 'Unknown';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Patient Identifier Sources</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Add New Source Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Add a new Patient Identifier Source</h3>

          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-48">
              <Label>Identifier Type *</Label>
              <Select value={selectedIdentifierType} onValueChange={setSelectedIdentifierType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select identifier type" />
                </SelectTrigger>
                <SelectContent>
                  {identifierTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-48">
              <Label>Source Type *</Label>
              <Select value={sourceType} onValueChange={setSourceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remote">Remote Identifier Source</SelectItem>
                  <SelectItem value="sequential">Sequential Identifier Source</SelectItem>
                  <SelectItem value="pool">Pool Identifier Source</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleAddClick}
              // disabled={!selectedIdentifierType || !sourceType}
            >
              Create
            </Button>
          </div>
           {/* Modal: Sequential Identifier Source Form */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                New: Local Identifier Generator for {selectedTypeLabel}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g., MRN Source"
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

              {/* Fixed Info */}
              <div className="space-y-2 text-sm border p-3 bg-gray-50 rounded">
                <p><strong>Check Digit Algorithm:</strong> none</p>
                <p><strong>Regular Expression Format:</strong> none</p>
              </div>

               {/* Base Character Set */}
               <div>
                <Label htmlFor="baseCharacterSet">Base Character Set *</Label>
                <Input
                  id="baseCharacterSet"
                  name="baseCharacterSet"
                  value={form.baseCharacterSet}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* First Identifier Base */}
              <div>
                <Label htmlFor="firstIdentifierBase">First Identifier Base *</Label>
                <Input
                  id="firstIdentifierBase"
                  name="firstIdentifierBase"
                  type="number"
                  value={form.firstIdentifierBase}
                  onChange={handleChange}
                  required
                />
              </div>

               {/* Optional Fields */}
               {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> */}
                <div>
                  <Label htmlFor="prefix">Prefix</Label>
                  <Input
                    id="prefix"
                    name="prefix"
                    value={form.prefix}
                    onChange={handleChange}
                    placeholder="e.g., MRN-"
                  />
                </div>
                <div>
                  <Label htmlFor="suffix">Suffix</Label>
                  <Input
                    id="suffix"
                    name="suffix"
                    value={form.suffix}
                    onChange={handleChange}
                    placeholder="e.g., -XYZ"
                  />
                </div>
                <div>
                  <Label htmlFor="minLength">Min Length</Label>
                  <Input
                    id="minLength"
                    name="minLength"
                    type="number"
                    value={form.minLength}
                    onChange={handleChange}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="maxLength">Max Length</Label>
                  <Input
                    id="maxLength"
                    name="maxLength"
                    type="number"
                    value={form.maxLength}
                    onChange={handleChange}
                    min="1"
                  />
                </div>
              {/* </div> */}

              {/* Skip Validation */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="skipValidation"
                  name="skipValidation"
                  checked={form.skipValidation}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({ ...prev, skipValidation: !!checked }))
                  }
                />
                <Label htmlFor="skipValidation">
                  Skip validation during automatic assignment
                </Label>
              </div>

              {/* Buttons */}
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>


          {/* Dynamic Form */}
          {/* {sourceType && (
            <form onSubmit={handleSubmit} className="border rounded-lg p-6 bg-gray-50 space-y-6"> */}
              {/* <h4 className="font-medium text-lg capitalize">
                {sourceType} Identifier Source
              </h4>

              {sourceType === 'remote' && (
                <>
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={remoteForm.name}
                      onChange={(e) => setRemoteForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., External EMR ID Source"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={remoteForm.description}
                      onChange={(e) => setRemoteForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Optional description"
                    />
                  </div>
                  <div>
                    <Label>Check Digit Algorithm</Label>
                    <Input value="None" disabled className="bg-white" />
                  </div>
                  <div>
                    <Label>Regular Expression Format</Label>
                    <Input value="None" disabled className="bg-white" />
                  </div>
                  <div>
                    <Label>URL *</Label>
                    <Input
                      type="url"
                      value={remoteForm.url}
                      onChange={(e) => setRemoteForm(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://external-emr.com/api/ids"
                    />
                  </div>
                  <div>
                    <Label>Username *</Label>
                    <Input
                      value={remoteForm.username}
                      onChange={(e) => setRemoteForm(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Enter username"
                    />
                  </div>
                  <div>
                    <Label>Password *</Label>
                    <Input
                      type="password"
                      value={remoteForm.password}
                      onChange={(e) => setRemoteForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter password"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="skipValidation"
                      checked={remoteForm.skipValidation}
                      onCheckedChange={(checked) =>
                        setRemoteForm(prev => ({ ...prev, skipValidation: !!checked }))
                      }
                    />
                    <Label htmlFor="skipValidation">Skip validation during automatic assignment</Label>
                  </div>
                </>
              )}

              {sourceType === 'sequential' && (
                <>
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={sequentialForm.name}
                      onChange={(e) => setSequentialForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., MRN Source"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={sequentialForm.description}
                      onChange={(e) => setSequentialForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Optional description"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Prefix</Label>
                      <Input
                        value={sequentialForm.prefix}
                        onChange={(e) => setSequentialForm(prev => ({ ...prev, prefix: e.target.value }))}
                        placeholder="e.g., MRN-"
                      />
                    </div>
                    <div>
                      <Label>Suffix</Label>
                      <Input
                        value={sequentialForm.suffix}
                        onChange={(e) => setSequentialForm(prev => ({ ...prev, suffix: e.target.value }))}
                        placeholder="e.g., -XYZ"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Min Length</Label>
                      <Input
                        type="number"
                        value={sequentialForm.minLength}
                        onChange={(e) => setSequentialForm(prev => ({ ...prev, minLength: Number(e.target.value) }))}
                        min="1"
                      />
                    </div>
                    <div>
                      <Label>Max Length</Label>
                      <Input
                        type="number"
                        value={sequentialForm.maxLength}
                        onChange={(e) => setSequentialForm(prev => ({ ...prev, maxLength: Number(e.target.value) }))}
                        min="1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Start At</Label>
                    <Input
                      type="number"
                      value={sequentialForm.startAt}
                      onChange={(e) => setSequentialForm(prev => ({ ...prev, startAt: Number(e.target.value) }))}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label>Base Character Set *</Label>
                    <Input
                      value={sequentialForm.baseCharacterSet}
                      onChange={(e) => setSequentialForm(prev => ({ ...prev, baseCharacterSet: e.target.value }))}
                      placeholder="A-Z, 0-9"
                    />
                  </div>
                </>
              )} */}

              {/* {sourceType === 'pool' && (
                <>
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={poolForm.name}
                      onChange={(e) => setPoolForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., VIP ID Pool"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={poolForm.description}
                      onChange={(e) => setPoolForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Optional description"
                    />
                  </div>
                  <div>
                    <Label>Identifiers (one per line) *</Label>
                    <textarea
                      value={poolForm.identifiers}
                      onChange={(e) => setPoolForm(prev => ({ ...prev, identifiers: e.target.value }))}
                      className="w-full border rounded p-2"
                      rows={4}
                      placeholder="VIP001&#10;VIP002&#10;EMERG999"
                    />
                  </div>
                </>
              )} */}

              
            {/* </form>
          )} */}
        </div>

        {/* Existing Sources Table */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Existing Identifier Sources</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Identifier Type</TableHead>
                  <TableHead>Source Type</TableHead>
                  <TableHead>Source Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources.length > 0 ? (
                  sources.map((source) => {
                    const typeName = source.identifierType?.display || 'Unknown';
                    const sourceTypeLabel =
                      source.baseClass === 'org.openmrs.module.idgen.RemoteIdentifierSource'
                        ? 'Remote'
                        : source.baseClass === 'org.openmrs.module.idgen.SequentialNumberGenerator'
                        ? 'Sequential'
                        : 'Pool';

                    return (
                      <TableRow key={source.uuid}>
                        <TableCell className="font-medium">{source.name}</TableCell>
                        <TableCell>{typeName}</TableCell>
                        <TableCell>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {sourceTypeLabel}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="default"
                            size="sm"
                            // onClick={() => navigate(`/admin/edit-identifier-source/${source.uuid}`)}
                          >
                            Configure
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                      No identifier sources found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}