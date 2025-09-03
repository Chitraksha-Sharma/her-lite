import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

// 🔗 Base URL
const BASE_URL = '/openmrs/ws/rest/v1';

interface Person {
  uuid: string;
  display: string;
}

interface Provider {
  uuid: string;
  identifier: string;
  person: Person;
  name: string;
  display: string;
  retired: boolean;
  attributes: {
    licenseNumber?: string;
    phoneExtension?: string;
    providerLocation?: string;
    specialty?: string;
  };
  creator?: {
    display: string;
  };
  dateCreated?: string;
}

export default function ManageProviders() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [includeRetired, setIncludeRetired] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);

  // Create/Edit form state
  const [form, setForm] = useState({
    identifier: '',
    person: '',
    licenseNumber: '',
    phoneExtension: '',
    providerLocation: '',
    specialty: '',
  });

  // Retire/Delete
  const [retireReason, setRetireReason] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Fetch Providers
  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        v: 'full',
        ...(includeRetired && { retired: 'true' }),
      });

      const res = await fetch(`${BASE_URL}//provider?limit=<integer>&startIndex=<integer>&v=custom&q=<string>&user=<string>`, {
        headers: { 'Accept': 'application/json' },
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to fetch providers');
      const data = await res.json();

      const list: Provider[] = (data.results || []).map((p: any): Provider => ({
        uuid: p.uuid,
        identifier: p.identifier || '',
        person: p.person,
        name: p.name || p.display?.split(' - ')[0] || 'Unknown',
        display: p.display,
        retired: p.retired || false,
        attributes: {
          licenseNumber: p.attributes?.find((a: any) => a.attributeType?.display === 'License Number')?.value,
          phoneExtension: p.attributes?.find((a: any) => a.attributeType?.display === 'Phone Extension')?.value,
          providerLocation: p.attributes?.find((a: any) => a.attributeType?.display === 'Provider Location')?.value,
          specialty: p.attributes?.find((a: any) => a.attributeType?.display === 'Specialty')?.value,
        },
        creator: p.creator,
        dateCreated: p.dateCreated,
      }));

      setProviders(list);
    } catch (err: any) {
      toast.error('Load failed: ' + (err.message || 'Network error'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch Persons (for person lookup)
  const fetchPersons = async (query: string) => {
    if (!query) return;
    try {
      const res = await fetch(`${BASE_URL}//person?q=`, {
        headers: { 'Accept': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) return;
      const data = await res.json();
      setPersons(
        (data.results || []).map((p: any) => ({
          uuid: p.uuid,
          display: p.display,
        }))
      );
    } catch (err) {
      console.error('Fetch persons failed', err);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [includeRetired]);

  useEffect(() => {
    if (searchTerm.length > 2) {
      fetchPersons(searchTerm);
    }
  }, [searchTerm]);

  // Handle Add Provider
  const handleAddProvider = () => {
    setForm({
      identifier: '',
      person: '',
      licenseNumber: '',
      phoneExtension: '',
      providerLocation: '',
      specialty: '',
    });
    setRetireReason('');
    setIsAddOpen(true);
  };

  // Handle Edit Provider
  const handleEditProvider = (provider: Provider) => {
    setEditingProvider(provider);
    setForm({
      identifier: provider.identifier,
      person: provider.person.uuid,
      licenseNumber: provider.attributes.licenseNumber || '',
      phoneExtension: provider.attributes.phoneExtension || '',
      providerLocation: provider.attributes.providerLocation || '',
      specialty: provider.attributes.specialty || '',
    });
    setRetireReason('');
    setIsEditOpen(true);
  };

  // Handle Form Input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePersonSelect = (uuid: string) => {
    setForm((prev) => ({ ...prev, person: uuid }));
  };

  // Create/Update Provider
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.identifier) return toast.error('Identifier is required');
    if (!form.person) return toast.error('Person is required');

    const payload = {
      identifier: form.identifier,
      person: { uuid: form.person },
      attributes: [
        { attributeType: { display: 'License Number' }, value: form.licenseNumber },
        { attributeType: { display: 'Phone Extension' }, value: form.phoneExtension },
        { attributeType: { display: 'Provider Location' }, value: form.providerLocation },
        { attributeType: { display: 'Specialty' }, value: form.specialty },
      ].filter(attr => attr.value),
    };

    try {
      const url = isAddOpen
        ? `${BASE_URL}/provider`
        : `${BASE_URL}/provider/${editingProvider?.uuid}`;

      const res = await fetch(url, {
        method: isAddOpen ? 'POST' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save provider');

      toast.success(isAddOpen ? 'Provider created!' : 'Provider updated!');
      setIsAddOpen(false);
      setIsEditOpen(false);
      fetchProviders();
    } catch (err: any) {
      toast.error('Save failed: ' + (err.message || 'Permission denied'));
    }
  };

  // Retire Provider
  const handleRetire = async () => {
    if (!retireReason.trim()) {
      toast.error('Retire reason is required');
      return;
    }

    try {
      await fetch(`${BASE_URL}/provider/${editingProvider?.uuid}?retire=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: retireReason }),
      });

      toast.success('Provider retired!');
      setIsEditOpen(false);
      fetchProviders();
    } catch (err: any) {
      toast.error('Retire failed: ' + (err.message || 'Permission denied'));
    }
  };

  // Delete Provider Forever
  const handleDeleteForever = async () => {
    if (!confirm('Delete this provider forever? This cannot be undone.')) return;
    setDeleting(true);

    try {
      await fetch(`${BASE_URL}/provider/${editingProvider?.uuid}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      toast.success('Provider deleted!');
      setIsEditOpen(false);
      fetchProviders();
    } catch (err: any) {
      toast.error('Delete failed: ' + (err.message || 'Permission denied'));
    } finally {
      setDeleting(false);
    }
  };

  // Filter providers by search
  const filteredProviders = providers.filter((p) =>
    p.display.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.identifier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-center justify-between gap-4">
        <CardTitle>Manage Providers</CardTitle>
        <Button onClick={handleAddProvider}>Add Provider</Button>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Find Provider */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Find Provider</h3>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-64">
              <Label htmlFor="search">Name or ID</Label>
              <Input
                id="search"
                placeholder="Enter provider name or ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeRetired"
                checked={includeRetired}
                onCheckedChange={(checked) => setIncludeRetired(!!checked)}
              />
              <Label htmlFor="includeRetired">Include Retired</Label>
            </div>
          </div>
        </div>

        {/* Providers List */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Identifier</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProviders.length > 0 ? (
                filteredProviders.map((p) => (
                  <TableRow
                    key={p.uuid}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleEditProvider(p)}
                  >
                    <TableCell className="font-medium">{p.display}</TableCell>
                    <TableCell>{p.identifier}</TableCell>
                    <TableCell>{p.attributes.specialty || '-'}</TableCell>
                    <TableCell>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          p.retired
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {p.retired ? 'Retired' : 'Active'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                    No providers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add Provider Modal */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Provider</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-6">
              <h4 className="text-md font-medium">Create Provider</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="identifier">Identifier *</Label>
                  <Input
                    id="identifier"
                    name="identifier"
                    value={form.identifier}
                    onChange={handleChange}
                    placeholder="e.g., PROV-123"
                  />
                </div>
                <div>
                  <Label htmlFor="person">Person *</Label>
                  <div className="space-y-1">
                    <Input
                      placeholder="Enter person name or ID"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="max-h-32 overflow-y-auto text-sm border rounded p-2 bg-gray-50">
                      {persons.length > 0 ? (
                        persons.map((person) => (
                          <div
                            key={person.uuid}
                            className="p-1 hover:bg-gray-200 cursor-pointer"
                            onClick={() => handlePersonSelect(person.uuid)}
                          >
                            {person.display}
                          </div>
                        ))
                      ) : (
                        <div className="p-1 text-gray-500">No persons found</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    name="licenseNumber"
                    value={form.licenseNumber}
                    onChange={handleChange}
                    placeholder="e.g., MED12345"
                  />
                </div>
                <div>
                  <Label htmlFor="phoneExtension">Phone Extension</Label>
                  <Input
                    name="phoneExtension"
                    value={form.phoneExtension}
                    onChange={handleChange}
                    placeholder="e.g., x123"
                  />
                </div>
                <div>
                  <Label htmlFor="providerLocation">Provider Location</Label>
                  <Input
                    name="providerLocation"
                    value={form.providerLocation}
                    onChange={handleChange}
                    placeholder="e.g., Outpatient Dept"
                  />
                </div>
                <div>
                  <Label htmlFor="specialty">Specialty</Label>
                  <Input
                    name="specialty"
                    value={form.specialty}
                    onChange={handleChange}
                    placeholder="e.g., Cardiology"
                  />
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" variant="secondary" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Provider</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit/Retire/Delete Modal */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Provider</DialogTitle>
            </DialogHeader>

            {/* Section 1: Edit Provider */}
            <form onSubmit={handleSave} className="space-y-6">
              <h4 className="text-md font-medium">Edit Provider</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="identifier">Identifier *</Label>
                  <Input
                    name="identifier"
                    value={form.identifier}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label>Person</Label>
                  <Input value={editingProvider?.person.display} disabled />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>License Number</Label>
                  <Input
                    name="licenseNumber"
                    value={form.licenseNumber}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label>Phone Extension</Label>
                  <Input
                    name="phoneExtension"
                    value={form.phoneExtension}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label>Provider Location</Label>
                  <Input
                    name="providerLocation"
                    value={form.providerLocation}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label>Specialty</Label>
                  <Input
                    name="specialty"
                    value={form.specialty}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <hr className="my-6" />

              {/* Section 2: Retire */}
              <div>
                <h4 className="text-md font-medium text-orange-700">Retire Provider</h4>
                {editingProvider && (
                  <p className="text-sm text-gray-600 mb-2">
                    Created by <strong>{editingProvider.creator?.display || 'Unknown'}</strong> on{' '}
                    <strong>
                      {editingProvider.dateCreated
                        ? new Date(editingProvider.dateCreated).toLocaleDateString()
                        : 'Unknown'}
                    </strong>
                  </p>
                )}
                <div>
                  <Label htmlFor="retireReason">Reason *</Label>
                  <Input
                    id="retireReason"
                    value={retireReason}
                    onChange={(e) => setRetireReason(e.target.value)}
                    placeholder="Why retire this provider?"
                  />
                </div>
                <Button
                  variant="destructive"
                  className="mt-3"
                  onClick={handleRetire}
                  disabled={!retireReason.trim()}
                >
                  Retire Provider
                </Button>
              </div>

              <hr className="my-6" />

              {/* Section 3: Delete Forever */}
              <div>
                <h4 className="text-md font-medium text-red-700">Delete Provider Forever</h4>
                <p className="text-sm text-gray-600">
                  This action cannot be undone. Only proceed if this was a test entry.
                </p>
                <Button
                  variant="destructive"
                  className="mt-3 bg-red-600 hover:bg-red-700"
                  onClick={handleDeleteForever}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete Provider Forever'}
                </Button>
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)}>
                  Close
                </Button>
                <Button type="submit">Update Provider</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}