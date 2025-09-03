import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Settings, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// 🔗 Base URL for OpenMRS REST API
const BASE_URL = '/openmrs/ws/rest/v1';

interface RelationshipType {
  uuid: string;
  display: string;
  description: string;
  aIsToB: string;
  bIsToA: string;
  displayOrder: number;
  preferred: boolean;
}

// 🔹 Fetch Relationship Types from OpenMRS
async function fetchRelationshipTypes(): Promise<RelationshipType[]> {
  const res = await fetch(`${BASE_URL}/relationshiptype`, {
    headers: { 'Accept': 'application/json' },
    credentials: 'include', // Required for session
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error?.message || 'Failed to fetch relationship types');
  }

  const data = await res.json();
  return data.results.map((type: any) => ({
    uuid: type.uuid,
    display: type.display,
    description: type.description,
    aIsToB: type.aIsToB,
    bIsToA: type.bIsToA,
    displayOrder: type.displayOrder || 999,
    preferred: type.preferred || false,
  }));
}

// 🔹 Create New Relationship Type
async function createRelationshipType(payload: {
  aIsToB: string;
  bIsToA: string;
  description: string;
}) {
  const res = await fetch(`${BASE_URL}/relationshiptype`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error?.message || 'Failed to create relationship type');
  }

  return res.json();
}

// 🔹 Update Existing Relationship Type
async function updateRelationshipType(uuid: string, payload: Partial<RelationshipType>) {
  const res = await fetch(`${BASE_URL}/relationshiptype/:uuid`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error?.message || 'Failed to update relationship type');
  }

  return res.json();
}

const ManageRelationshipType: React.FC = () => {
  const [relationshipTypes, setRelationshipTypes] = useState<RelationshipType[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Form state for adding new relationship type
  const [newRelationship, setNewRelationship] = useState({
    aIsToB: '',
    bIsToA: '',
    description: '',
  });

  async function retireRelationshipType(uuid: string, reason: string) {
    await fetch(`${BASE_URL}/relationshiptype/${uuid}?retire=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ reason }),
    });
  }

  // Form state for managing existing relationship types
  const [managingTypes, setManagingTypes] = useState<RelationshipType[]>([]);

  const [editingType, setEditingType] = useState<RelationshipType | null>(null);

  // Load data from API
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const types = await fetchRelationshipTypes();
        setRelationshipTypes(types);
        setManagingTypes([...types]); // Copy for management
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'Failed to load relationship types: ' + (error.message || 'Network error'),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Handle Add New Relationship Type
  const handleAddRelationshipType = async () => {
    if (!newRelationship.aIsToB || !newRelationship.bIsToA || !newRelationship.description) {
      toast({
        title: 'Validation Error',
        description: 'All fields are required',
        variant: 'destructive',
      });
      return;
    }
  
    try {
      if (editingType) {
        // ✅ Update existing
        await updateRelationshipType(editingType.uuid, {
          aIsToB: newRelationship.aIsToB,
          bIsToA: newRelationship.bIsToA,
          description: newRelationship.description,
        });
  
        setRelationshipTypes((prev) =>
          prev.map((t) =>
            t.uuid === editingType.uuid
              ? {
                  ...t,
                  aIsToB: newRelationship.aIsToB,
                  bIsToA: newRelationship.bIsToA,
                  description: newRelationship.description,
                  display: `${newRelationship.aIsToB}/${newRelationship.bIsToA}`,
                }
              : t
          )
        );
        setManagingTypes((prev) =>
          prev.map((t) =>
            t.uuid === editingType.uuid
              ? {
                  ...t,
                  aIsToB: newRelationship.aIsToB,
                  bIsToA: newRelationship.bIsToA,
                  description: newRelationship.description,
                  display: `${newRelationship.aIsToB}/${newRelationship.bIsToA}`,
                }
              : t
          )
        );
  
        toast({
          title: 'Success',
          description: 'Relationship type updated!',
        });
      } else {
        // ✅ Create new
        const payload = {
          aIsToB: newRelationship.aIsToB,
          bIsToA: newRelationship.bIsToA,
          description: newRelationship.description,
        };
  
        const created = await createRelationshipType(payload);
  
        const newType: RelationshipType = {
          uuid: created.uuid,
          display: created.display,
          description: created.description,
          aIsToB: created.aIsToB,
          bIsToA: created.bIsToA,
          displayOrder: relationshipTypes.length + 1,
          preferred: false,
        };
  
        setRelationshipTypes((prev) => [...prev, newType]);
        setManagingTypes((prev) => [...prev, newType]);
  
        toast({
          title: 'Success',
          description: 'Relationship type added successfully',
        });
      }
  
      setNewRelationship({ aIsToB: '', bIsToA: '', description: '' });
      setIsAddDialogOpen(false);
      setEditingType(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to save: ' + (error.message || 'Permission denied'),
        variant: 'destructive',
      });
    }
  };

  // Handle Save Managing Types (Update displayOrder & preferred)
  const handleSaveManagingTypes = async () => {
    try {
      // Update each modified type
      await Promise.all(
        managingTypes.map(async (type) => {
          const original = relationshipTypes.find((t) => t.uuid === type.uuid);
          if (
            original?.displayOrder !== type.displayOrder ||
            original?.preferred !== type.preferred
          ) {
            await updateRelationshipType(type.uuid, {
              displayOrder: type.displayOrder,
              preferred: type.preferred,
            });
          }
        })
      );

      setRelationshipTypes([...managingTypes]);
      setIsManageDialogOpen(false);

      toast({
        title: 'Success',
        description: 'Relationship types updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update: ' + (error.message || 'Permission denied'),
        variant: 'destructive',
      });
    }
  };

  // Update managing type locally
  const updateManagingType = (
    uuid: string,
    field: 'displayOrder' | 'preferred',
    value: any
  ) => {
    setManagingTypes((prev) =>
      prev.map((type) =>
        type.uuid === uuid ? { ...type, [field]: value } : type
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Relationship Type Management</h2>
        <p className="text-muted-foreground">Manage relationship types and their configurations</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            if (!open) {
                setEditingType(null); // Reset when closed
                setNewRelationship({ aIsToB: '', bIsToA: '', description: '' });
            }
            setIsAddDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Relationship Type
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
          {/* <DialogHeader>
            <DialogTitle>
                {editingType ? 'Edit Relationship Type' : 'Add New Relationship Type'}
            </DialogTitle>
          </DialogHeader> */}
          <DialogHeader>
            <DialogTitle>Add New Relationship Type</DialogTitle>
            <DialogDescription>
                Define a new relationship type (e.g., Parent/Child, Spouse). 
                This will be used when linking persons in the system.
            </DialogDescription>
        </DialogHeader>
          <div className="space-y-4">
            {/* Show Created By + Date only in edit mode */}
            {editingType && (              
                <div className="text-sm text-gray-600 border-b pb-3">
                    Created by <strong>admin</strong> on <strong>2023-11-15 10:30</strong>
                    {/* In real app: use type.creator.display and type.dateCreated */}
                </div>
            )}

            <div>
            <Label htmlFor="aIsToB">A is to B *</Label>
            <Input
                id="aIsToB"
                value={newRelationship.aIsToB}
                onChange={(e) =>
                setNewRelationship((prev) => ({ ...prev, aIsToB: e.target.value }))
                }
                placeholder="e.g., Parent"
                required
            />
            </div>
            <div>
            <Label htmlFor="bIsToA">B is to A *</Label>
            <Input
                id="bIsToA"
                value={newRelationship.bIsToA}
                onChange={(e) =>
                setNewRelationship((prev) => ({ ...prev, bIsToA: e.target.value }))
                }
                placeholder="e.g., Child"
                required
            />
            </div>
            <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
                id="description"
                value={newRelationship.description}
                onChange={(e) =>
                setNewRelationship((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Describe this relationship type"
                required
            />
            </div>

            {/* Save Button */}
            <Button onClick={handleAddRelationshipType} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {editingType ? 'Update Relationship Type' : 'Save Relationship Type'}
            </Button>

            {/* Retire Section */}
            {editingType && (
            <div className="border-t pt-4 space-y-3">
                <h3 className="text-lg font-medium text-orange-700">Retire Relationship Type</h3>
                <div>
                <Label htmlFor="retireReason">Reason *</Label>
                <Textarea
                    id="retireReason"
                    placeholder="Why are you retiring this relationship type?"
                />
                </div>
                <Button variant="destructive" className="w-full">
                Retire Relationship Type
                </Button>
            </div>
            )}

            {/* Delete Forever Section */}
            {editingType && (
            <div className="border-t pt-4 space-y-3">
                <h3 className="text-lg font-medium text-red-700">Delete Relationship Type Forever</h3>
                <p className="text-sm text-gray-600">
                This action cannot be undone. Only proceed if this was a test or duplicate.
                </p>
                <Button variant="destructive" className="w-full bg-red-600 hover:bg-red-700">
                Delete Relationship Type Forever
                </Button>
            </div>
            )}
        </div>
        </DialogContent>
        </Dialog>

        <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Manage Relationship Type Views
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>
                {editingType ? 'Edit Relationship Type' : 'Add New Relationship Type'}
                </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
                {/* Show Created By + Date only in edit mode */}
                {editingType && (
                <div className="text-sm text-gray-600 border-b pb-3">
                    Created by <strong>admin</strong> on <strong>2023-11-15 10:30</strong>
                    {/* In real app: use type.creator.display and type.dateCreated */}
                </div>
                )}

                <div>
                <Label htmlFor="aIsToB">A is to B *</Label>
                <Input
                    id="aIsToB"
                    value={newRelationship.aIsToB}
                    onChange={(e) =>
                    setNewRelationship((prev) => ({ ...prev, aIsToB: e.target.value }))
                    }
                    placeholder="e.g., Parent"
                    required
                />
                </div>
                <div>
                <Label htmlFor="bIsToA">B is to A *</Label>
                <Input
                    id="bIsToA"
                    value={newRelationship.bIsToA}
                    onChange={(e) =>
                    setNewRelationship((prev) => ({ ...prev, bIsToA: e.target.value }))
                    }
                    placeholder="e.g., Child"
                    required
                />
                </div>
                <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                    id="description"
                    value={newRelationship.description}
                    onChange={(e) =>
                    setNewRelationship((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Describe this relationship type"
                    required
                />
                </div>

                {/* Save Button */}
                <Button onClick={handleAddRelationshipType} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {editingType ? 'Update Relationship Type' : 'Save Relationship Type'}
                </Button>

                {/* Retire Section */}
                {editingType && (
                <div className="border-t pt-4 space-y-3">
                    <h3 className="text-lg font-medium text-orange-700">Retire Relationship Type</h3>
                    <div>
                    <Label htmlFor="retireReason">Reason *</Label>
                    <Textarea
                        id="retireReason"
                        placeholder="Why are you retiring this relationship type?"
                    />
                    </div>
                    <Button variant="destructive" className="w-full">
                    Retire Relationship Type
                    </Button>
                </div>
                )}

                {/* Delete Forever Section */}
                {editingType && (
                <div className="border-t pt-4 space-y-3">
                    <h3 className="text-lg font-medium text-red-700">Delete Relationship Type Forever</h3>
                    <p className="text-sm text-gray-600">
                    This action cannot be undone. Only proceed if this was a test or duplicate.
                    </p>
                    <Button variant="destructive" className="w-full bg-red-600 hover:bg-red-700">
                    Delete Relationship Type Forever
                    </Button>
                </div>
                )}
            </div>
            </DialogContent>
        </Dialog>
      </div>

      {/* Current Relationship Types List */}
      <Card>
      <CardHeader>
        <CardTitle>Current Relationship Types</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
        <div className="text-center py-4">
            <p className="text-muted-foreground">Loading relationship types...</p>
        </div>
        ) : relationshipTypes.length === 0 ? (
        <div className="text-center py-8">
            <p className="text-muted-foreground">No relationship types found</p>
        </div>
        ) : (
        <div className="rounded-md border">
            <table className="w-full">
            <thead className="bg-muted">
                <tr>
                <th className="text-left p-3 text-sm font-medium">Name</th>
                <th className="text-left p-3 text-sm font-medium">Description</th>
                </tr>
            </thead>
            <tbody>
                {relationshipTypes.map((type) => (
                <tr
                    key={type.uuid}
                    className="border-t hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                    setEditingType(type);
                    setNewRelationship({
                        aIsToB: type.aIsToB,
                        bIsToA: type.bIsToA,
                        description: type.description,
                    });
                    setIsAddDialogOpen(true);
                    }}
                >
                    <td className="p-3 font-medium">{type.display}</td>
                    <td className="p-3 text-muted-foreground">{type.description}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
};

export default ManageRelationshipType;