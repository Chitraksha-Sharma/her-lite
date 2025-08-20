import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// Base URL for OpenMRS REST API
const BASE_URL = '/openmrs/ws/rest/v1';

// 🔹 Fetch Visit Types
async function getVisitTypes() {
  const res = await fetch(`${BASE_URL}/visittype?v=full`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch visit types');
  return res.json();
}

// 🔹 Create Visit Type
async function createVisitType(data: { name: string; description: string }) {
  const res = await fetch(`${BASE_URL}/visittype`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error?.message || 'Failed to create visit type');
  }
  return res.json();
}

// 🔹 Delete Visit Type
async function deleteVisitType(uuid: string) {
    const res = await fetch(`${BASE_URL}/visittype/${uuid}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error?.message || 'Failed to delete visit type');
    }
  }

export default function ManageVisitTypes() {
    const [visitTypes, setVisitTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selected, setSelected] = useState<string[]>([]); // Track selected UUIDs
  
    // Form state
    const [form, setForm] = useState({
      name: '',
      description: '',
    });
  
    // Load visit types on mount
    useEffect(() => {
      const load = async () => {
        try {
          const data = await getVisitTypes();
          setVisitTypes(data.results || []);
        } catch (err: any) {
          toast.error('Load failed: ' + (err.message || 'Network error'));
        } finally {
          setLoading(false);
        }
      };
      load();
    }, []);

     // Filtered visit types
    const filteredTypes = visitTypes.filter(
        (type) =>
        type.display?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (type.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Toggle select
    const toggleSelect = (uuid: string) => {
        setSelected((prev) =>
        prev.includes(uuid)
            ? prev.filter((id) => id !== uuid)
            : [...prev, uuid]
        );
    };

    // Select all
    const toggleSelectAll = () => {
        if (selected.length === filteredTypes.length) {
        setSelected([]);
        } else {
        setSelected(filteredTypes.map((t) => t.uuid));
        }
    };

   // Handle single delete
   const handleDelete = async (uuid: string, display: string) => {
    if (!confirm(`Delete visit type "${display}"? This cannot be undone.`)) return;

    try {
      await deleteVisitType(uuid);
      setVisitTypes((prev) => prev.filter((t) => t.uuid !== uuid));
      setSelected((prev) => prev.filter((id) => id !== uuid));
      toast.success('Visit type deleted');
    } catch (error: any) {
      toast.error('Delete failed: ' + (error.message || 'Permission denied'));
    }
    };

   // Handle bulk delete
   const handleBulkDelete = async () => {
    if (selected.length === 0) return;

    const confirmed = window.confirm(
      `Delete ${selected.length} visit type(s)? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await Promise.all(
        selected.map(async (uuid) => {
          try {
            await deleteVisitType(uuid);
            return { success: true, uuid };
          } catch (error) {
            return { success: false, uuid, error };
          }
        })
        );

        setVisitTypes((prev) => prev.filter((t) => !selected.includes(t.uuid)));
        setSelected([]);
        toast.success(`Deleted ${selected.length} visit type(s)`);
        } catch (err) {
        toast.error('Bulk delete failed');
        }
    };

  
    // Handle form input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    };
  
    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.name.trim()) {
        toast.error('Name is required');
        return;
      }

      try {
        const newType = await createVisitType(form);
        setVisitTypes((prev) => [newType, ...prev]);
        toast.success('Visit type created successfully!');
        setForm({ name: '', description: '' });
        setModalOpen(false);
      } catch (error: any) {
        toast.error('Create failed: ' + (error.message || 'Permission denied'));
      }
    };
  
    if (loading) return <p className="p-4">Loading visit types...</p>;
    
    return (
      <Card>

        <CardHeader className="flex item-center justify-between gap-4">
            <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none" />      
            <Input
                placeholder="Search visit types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
            />
            </div>

            <Button onClick={() => setModalOpen(true)} className="item-start">
            + Add Visit Type
            </Button>
        </CardHeader>
        <CardContent className='space-y-4' >
          <div className="rounded-md border">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-12">
                    <Checkbox
                        checked={selected.length > 0 && selected.length === filteredTypes.length}
                        onCheckedChange={toggleSelectAll}
                    />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredTypes.length > 0 ? (
                        filteredTypes.map((type) => (
                          <TableRow key={type.uuid}>
                            <TableCell>
                              <Checkbox 
                               checked={selected.includes(type.uuid)}
                               onCheckedChange={() => toggleSelect(type.uuid)}
                              />                     
                            </TableCell>                       
                            <TableCell className="font-medium">{type.display}</TableCell>
                            <TableCell>{type.description || '-'}</TableCell>
                            <TableCell className="text-right">                          
                                <Button
                                 variant="destructive"
                                 size="sm"
                                 onClick={() => handleDelete(type.uuid, type.display)}
                                >                     
                                    Delete
                                </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                            No visit types found.
                        </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
          </div>

          {/* ✅ Bulk Delete Button - Always Visible When Selected */}
          <div className="flex justify-end">
            <Button
                variant="destructive"
                size="sm"
                onClick={selected.length > 0 ? handleBulkDelete : undefined}
                disabled={selected.length === 0}
                className="flex items-center gap-2"
            >
                <Trash2 className="h-4 w-4" />
                {selected.length === 0 ? 'No Selection' : `Delete ${selected.length} Selected`}
            </Button>
          </div>

          {/* Add Visit Type Modal */}
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
            <DialogTitle>Add Visit Type</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-2">
                    <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g., Outpatient, Emergency"
                        required
                    />
                    </div>
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
                </div>
                <DialogFooter className="mt-4">
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