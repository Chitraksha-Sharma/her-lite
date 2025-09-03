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

// 🔗 Base URL for OpenMRS REST API
const BASE_URL = '/openmrs/ws/rest/v1';

// ✅ API 1: GET /patientidentifiertype → List of identifier types
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

// ✅ API 2: GET /location → List of locations
async function fetchLocations() {
  const res = await fetch(`${BASE_URL}/location?limit=<integer>&startIndex=<integer>&v=custom&q=<string>&tag=<string>`, {
    headers: { 'Accept': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch locations');
  const data = await res.json();
  return data.results.map((loc: any) => ({
    value: loc.uuid,
    label: loc.display,
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

// ✅ API 3: GET /idgen/idsourceassignment → List of auto-generation rules
async function fetchAutoGenerationOptions() {
  const res = await fetch(`${BASE_URL}/idgen/autogenerationoption`, {
    headers: { 'Accept': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch auto generation options');
  const data = await res.json();
  return data.results || [];
}

// ✅ API 4: POST /idgen/idsourceassignment → Create new rule
async function createAutoGenerationOption(payload: any) {
  const res = await fetch(`${BASE_URL}/idgen/autogenerationoption`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let errorMessage = 'Failed to create rule';
    try {
      const error = await res.json();
      errorMessage = error.error?.message || errorMessage;
    } catch (e) {
      // If response is not JSON (e.g., HTML error page)
      errorMessage = await res.text().then(text => text.slice(0, 200)) || errorMessage;
    }
    console.error('Create failed:', errorMessage);
    throw new Error(errorMessage);
  }
  return res.json();
}

// ✅ API 5: DELETE /idgen/idsourceassignment/{uuid} → Delete rule
async function deleteAutoGenerationOption(uuid: string) {
  const res = await fetch(`${BASE_URL}/idgen/autogenerationoption/:uuid?purge=true`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error?.message || 'Failed to delete rule');
  }
}

export default function AutoGenerationConfiguration() {
  const [identifierTypes, setIdentifierTypes] = useState<{ value: string; label: string }[]>([]);
  const [locations, setLocations] = useState<{ value: string; label: string }[]>([]);
  const [identifierSources, setIdentifierSources] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection
  const [selectedIdentifierType, setSelectedIdentifierType] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);

  // Delete state
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    identifierTypeUuid: '',
    locationUuid: 'global', // 'global' = All Locations
    idSourceUuid: '',
    automaticGeneration: false,
    manualEntry: false,
  });


  // Load data
  useEffect(() => {
    const load = async () => {
      try {
        const [types, locs, sources] = await Promise.all([
          fetchIdentifierTypes(),
          fetchLocations(),
          fetchIdentifierSources(),
        ]);
        setIdentifierTypes(types);
        setLocations(locs);
        setIdentifierSources(sources);
      } catch (err: any) {
        toast.error('Load failed: ' + (err.message || 'Check IDGen module or login'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filter sources by selected identifier type UUID
const filteredSources = identifierSources.filter(
    (source) => source.identifierType?.uuid === selectedIdentifierType
  );

  // Handle Add Click
  const handleAddClick = () => {
    if (!selectedIdentifierType) {
      toast.error('Please select an Identifier Type');
      return;
    }
     // ✅ Reset form with new type
    setForm({
        identifierTypeUuid: selectedIdentifierType,
        locationUuid: 'global',
        idSourceUuid: '',
        automaticGeneration: false,
        manualEntry: false,
    });
    setModalOpen(true);
  };

  // Handle form input
  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Submitting payload:', {
        patientIdentifierType: { uuid: form.identifierTypeUuid },
        location: form.locationUuid === 'global' ? null : { uuid: form.locationUuid },
        identifierSource: { uuid: form.idSourceUuid },
        automaticGeneration: form.automaticGeneration,
        manualEntry: form.manualEntry
      });

    if (!form.idSourceUuid) {
      toast.error('Source is required');
      return;
    }

    try {
      await createAutoGenerationOption({
        patientIdentifierType: { uuid: form.identifierTypeUuid },
        location: form.locationUuid === 'global' ? null : { uuid: form.locationUuid },
        identifierSource: { uuid: form.idSourceUuid },
        automaticGeneration: form.automaticGeneration,
        manualEntry: form.manualEntry,
      });

      toast.success('Auto generation rule created!');
      setModalOpen(false);

      // Refresh list
      const updated = await fetchAutoGenerationOptions();
      setOptions(updated);

      // Reset form
      setForm({
        identifierTypeUuid: '',
        locationUuid: 'global',
        idSourceUuid: '',
        automaticGeneration: false,
        manualEntry: false,
      });
    } catch (error: any) {
      toast.error('Create failed: ' + (error.message || 'Permission denied'));
    }
  };

  // Handle Delete
  const handleDelete = async (uuid: string, sourceName: string) => {
    if (!confirm(`Delete rule for "${sourceName}"? This cannot be undone.`)) return;

    setDeleting(uuid);
    try {
      await deleteAutoGenerationOption(uuid);
      toast.success('Rule deleted!');
      setOptions((prev) => prev.filter((opt) => opt.uuid !== uuid));
    } catch (error: any) {
      toast.error('Delete failed: ' + (error.message || 'Permission denied'));
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <p className="p-4">Loading configuration...</p>;

  // Get selected identifier type label
  const selectedTypeLabel =
    identifierTypes.find((t) => t.value === selectedIdentifierType)?.label || 'Unknown';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Auto Generation Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Add New Option */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Add a new Auto Generation option</h3>

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

            <Button onClick={handleAddClick}>Add</Button>
          </div>
        </div>

        {/* Existing Options Table */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Auto generation options</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Identifier Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Source Name</TableHead>
                  <TableHead>Manual Entry Enabled?</TableHead>
                  <TableHead>Automatic Generation Enabled?</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {options.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                      No auto generation options configured.
                    </TableCell>
                  </TableRow>
                ) : (
                  options
                    .filter((opt) => opt.identifierSource) // Skip invalid
                    .map((opt) => (
                      <TableRow key={opt.uuid}>
                        <TableCell>{opt.patientIdentifierType?.display || 'Unknown'}</TableCell>
                        <TableCell>{opt.location?.display || 'All Locations'}</TableCell>
                        <TableCell>{opt.identifierSource?.name || 'Unknown Source'}</TableCell>
                        <TableCell>{opt.manualEntry ? 'Yes' : 'No'}</TableCell>
                        <TableCell>{opt.automaticGeneration ? 'Yes' : 'No'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleDelete(opt.uuid, opt.identifierSource?.name)
                            }
                            disabled={deleting === opt.uuid}
                          >
                            {deleting === opt.uuid ? 'Deleting...' : 'Delete'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Add Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Auto Generation options</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Identifier Type (Key-Value Pair) */}
              <div>
                <Label>Identifier Type</Label>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  <strong>{selectedTypeLabel}</strong> ({selectedIdentifierType})
                </div>
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="location">Location</Label>
                <Select
                  value={form.locationUuid}
                  onValueChange={(value) => handleChange('locationUuid', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">All Locations</SelectItem>
                    {locations.map((loc) => (
                      <SelectItem key={loc.value} value={loc.value}>
                        {loc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Source to Auto Generate From */}
              <div>
                <Label htmlFor="idSource">Source to Auto Generation From *</Label>
                <Select
                  value={form.idSourceUuid}
                  onValueChange={(value) => handleChange('idSourceUuid', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSources.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">
                        No sources found for this identifier type
                        </div>
                    ) : (
                        filteredSources.map((source) => (
                        <SelectItem key={source.uuid} value={source.uuid}>
                            {source.name || 'Unnamed Source'} ({source.baseClass?.split('.').pop()})
                        </SelectItem>
                        ))
                    )}
                </SelectContent>
                </Select>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="automaticGeneration"
                    checked={form.automaticGeneration}
                    onCheckedChange={(checked) =>
                      handleChange('automaticGeneration', checked)
                    }
                  />
                  <Label htmlFor="automaticGeneration">
                    Automatic generation enabled?
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="manualEntry"
                    checked={form.manualEntry}
                    onCheckedChange={(checked) => handleChange('manualEntry', checked)}
                  />
                  <Label htmlFor="manualEntry">Manual entry enabled?</Label>
                </div>
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
      </CardContent>
    </Card>
  );
}