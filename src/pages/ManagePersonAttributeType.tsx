import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createAttributeType, getAllAttributeTypes, deleteAttributeType } from '@/api/personAttributeType';
import { getPrivileges } from '@/api/privilege';
import { deletePrivilege } from '@/api/privilege';

interface PersonAttributeType {
  uuid?: string;
  name: string;
  format: string;
  searchable: boolean;
  description: string;
  editPrivilege: string;
}

interface AddAttributeForm {
  name: string;
  format: string;
  // keep as string for input binding to avoid NaN warnings
  foreignKey: string;
  searchable: boolean;
  description: string;
  editPrivilege: string;
}

const ManagePersonAttributeType: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [attributeTypes, setAttributeTypes] = useState<PersonAttributeType[]>([]);
  const [loading, setLoading] = useState(true);

  const formatOptions = ['Text', 'Number', 'Date', 'Email', 'Phone', 'Boolean'];
 
    // ✅ privilege list from API
  const [privilegeOptions, setPrivilegeOptions] = useState<string[]>([]);

  const [addForm, setAddForm] = useState<AddAttributeForm>({
    name: "",
    format: "",
    foreignKey: "",
    searchable: false,
    description: "",
    editPrivilege: "",
  });


  // ✅ fetch privileges when dialog opens
  useEffect(() => {
    async function fetchPrivileges() {
      if (isAddDialogOpen) {
        try {
          const response = await getPrivileges();
          console.log("Privileges API Response:", response); // Debugging log

          // Access the results array from the response
          const options = response.results.map((p: any) => {
            console.log("Mapping privilege:", p); // Log each privilege
            return p.display || p.name || p.uuid;
          });
          console.log("Mapped privilege options:", options); // Log mapped options
          setPrivilegeOptions(options);
        } catch (err) {
          console.error("Error fetching privileges:", err); // Debugging log
          toast({
            title: "Error",
            description: "Failed to load privileges",
            variant: "destructive",
          });
        }
      }
    }
    fetchPrivileges();
  }, [isAddDialogOpen, toast]);

  // ✅ Fetch attribute types on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAllAttributeTypes();
        const mapped: PersonAttributeType[] = data.map((attr: any) => ({
          uuid: attr.uuid,
          name: attr.display ?? attr.name,
          format: attr.format ?? "",
          searchable: attr.searchable ?? false,
          description: attr.description ?? "",
          editPrivilege: attr.editPrivilege ?? "",
        }));
        setAttributeTypes(mapped);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load person attribute types",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  // ✅ Submit new attribute
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Build payload converting foreignKey to number only if provided
      const payload: any = {
        name: addForm.name,
        description: addForm.description || undefined,
        format: addForm.format,
        searchable: addForm.searchable,
        retired: false,
      };

      if (addForm.foreignKey && addForm.foreignKey.trim() !== "") {
        const fk = Number(addForm.foreignKey);
        if (!Number.isNaN(fk)) payload.foreignKey = fk;
      }

      if (addForm.editPrivilege && addForm.editPrivilege.trim() !== "") {
        payload.editPrivilege = addForm.editPrivilege;
      }

      const newAttr = await createAttributeType(payload);

      const mapped: PersonAttributeType = {
        uuid: newAttr.uuid ?? "",
        name: newAttr.display ?? newAttr.name,
        format: newAttr.format ?? "",
        searchable: newAttr.searchable ?? false,
        description: newAttr.description ?? "",
        editPrivilege: newAttr.editPrivilege ?? "",
      };

      setAttributeTypes((prev) => [...prev, mapped]); // update UI immediately
      toast({ title: "Success", description: "Attribute added successfully." });

      // reset form + close dialog
      setAddForm({
        name: "",
        format: "",
        foreignKey: "",
        searchable: false,
        description: "",
        editPrivilege: "",
      });
      setIsAddDialogOpen(false);

      // navigate to the Person tile and select Manage Person Attribute Type
      navigate('/admin');
    } catch (err) {
      console.error('Create attribute failed', err);
      toast({
        title: "Error",
        description: "Failed to add attribute type",
        variant: "destructive",
      });
    }
  };

  // Delete attribute type
  const handleDelete = async (uuid?: string, editPrivilege?: string) => {
    if (!uuid) return;
    const confirmDel = window.confirm('Are you sure you want to delete this attribute type? This cannot be undone.');
    if (!confirmDel) return;
    try {
      await deleteAttributeType(uuid);
      setAttributeTypes((prev) => prev.filter((a) => a.uuid !== uuid));
      toast({ title: 'Deleted', description: 'Attribute type deleted successfully.' });

      // If attribute had an editPrivilege that looks like a UUID, offer to delete that privilege too
      const isUuid = (s: string | undefined) => !!s && /^[0-9a-fA-F-]{36,}$/.test(s);
      if (editPrivilege && isUuid(editPrivilege)) {
        const confirmPriv = window.confirm('This attribute references a privilege. Do you also want to delete the referenced privilege?');
        if (confirmPriv) {
          try {
            await deletePrivilege(editPrivilege);
            toast({ title: 'Privilege deleted', description: 'Associated privilege deleted.' });
          } catch (err) {
            console.error('Failed to delete privilege', err);
            toast({ title: 'Error', description: 'Failed to delete associated privilege', variant: 'destructive' });
          }
        }
      }
    } catch (err) {
      console.error('Delete attribute failed', err);
      toast({ title: 'Error', description: 'Failed to delete attribute type', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Attribute Type</h2>
      </div>

      {/* Section 1: Add New Person Attribute Type */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Person Attribute Types</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add new person Attribute Type
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Person Attribute Type</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={addForm.name}
                      onChange={(e) => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="format">Format *</Label>
                    <Select value={addForm.format} onValueChange={(value) => setAddForm(prev => ({ ...prev, format: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        {formatOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="foreignKey">Foreign Key</Label>
                    <Input
                      id="foreignKey"
                      value={addForm.foreignKey}
                      onChange={(e) => setAddForm(prev => ({ ...prev,  foreignKey: e.target.value }))}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="searchable"
                      checked={addForm.searchable}
                      onCheckedChange={(checked) => setAddForm(prev => ({ ...prev, searchable: !!checked }))}
                    />
                    <Label htmlFor="searchable">Searchable</Label>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={addForm.description}
                      onChange={(e) => setAddForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>

                 <div>
              <Label htmlFor="editPrivilege">Edit Privilege</Label>
              <Select
                value={addForm.editPrivilege}
                onValueChange={(value) =>
                  setAddForm((prev) => ({ ...prev, editPrivilege: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select privilege" />
                </SelectTrigger>
                <SelectContent>
                  {privilegeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


                  <Button type="submit" className="w-full" >
                    Save Attribute Type
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Section 2: Attribute Types List */}
      <Card>
        <CardHeader>
          <CardTitle>Attribute Types</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Searchable</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Edit Privilege</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attributeTypes.map((attr) => (
                  <TableRow key={attr.uuid}>
                    <TableCell className="font-medium">{attr.name}</TableCell>
                    <TableCell>{attr.format}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        attr.searchable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {attr.searchable ? 'Yes' : 'No'}
                      </span>
                    </TableCell>
                    <TableCell>{attr.description}</TableCell>
                    <TableCell>{attr.editPrivilege}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(attr.uuid, attr.editPrivilege)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagePersonAttributeType;