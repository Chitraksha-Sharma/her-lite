import React from 'react';
import { useState, useEffect } from 'react';
import { getRoles, createRole } from '@/api/user';
import { updateRole, deleteRole } from '@/api/role';
import { getPrivileges } from '@/api/privilege';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export default function RolesPermissions() {
  const [roles, setRoles] = useState<any[]>([]);
  const [privileges, setPrivileges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRole, setCurrentRole] = useState<any>(null);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  //form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    privilegeUuids: [] as string[],
    inheritedRoleUuids: [] as string[], // Not used in API, but for UI clarity
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null); // For delete loading

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const [rolesRes, privsRes] = await Promise.all([getRoles(), getPrivileges()]);
        setRoles(rolesRes.results || []);
        setPrivileges(privsRes.results || []);
      } catch (err) {
        toast.error('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadRoles();
  }, []);

   // Toggle expand/collapse
   const toggleExpand = (uuid: string) => {
    setExpanded((prev) =>
      prev.includes(uuid)
        ? prev.filter((id) => id !== uuid)
        : [...prev, uuid]
    );
  };

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
    if (selected.length === roles.length) {
      setSelected([]);
    } else {
      setSelected(roles.map((r) => r.uuid));
    }
  };

   // 🆕 Open Create Modal
   const handleCreateOpen = () => {
    setEditMode(false);
    setCurrentRole(null);
    setForm({
      name: '',
      description: '',
      privilegeUuids: [],
      inheritedRoleUuids: [] as string[],
    });
    setModalOpen(true);
  };

  // ✏️ Open Edit Modal
  const handleEditOpen = (role: any) => {
    setEditMode(true);
    setCurrentRole(role);
    setForm({
      name: role.name || role.display || '',
      description: role.description || '',
      privilegeUuids: role.privileges?.map((p: any) => p.uuid) || [],
      inheritedRoleUuids: [],
    });
    setModalOpen(true);
  };

  // 🗑️ Delete Role
  const handleDelete = async (uuid: string, display: string) => {
    if (!confirm(`Are you sure you want to delete role "${display}"? This cannot be undone.`)) {
      return;
    }

    setDeleting(uuid);
    try {
      await deleteRole(uuid);
      setRoles((prev) => prev.filter((r) => r.uuid !== uuid));
      setSelected((prev) => prev.filter((id) => id !== uuid));
      setExpanded((prev) => prev.filter((id) => id !== uuid));
      toast.success('Role deleted successfully');
    } catch (error: any) {
      toast.error('Delete failed: ' + (error.message || 'Unknown error'));
    } finally {
      setDeleting(null);
    }
    //Prevent delete of system Roles
    // if (['authenticated', 'anonymous'].includes(role.name)) {
    //   toast.error('Cannot delete system role');
    //   return;
    // }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
  
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selected.length} role(s)? This cannot be undone.`
    );
    if (!confirmed) return;
  
    try {
      // Delete all selected roles
      await Promise.all(
        selected.map(async (uuid) => {
          try {
            await deleteRole(uuid);
            return { success: true, uuid };
          } catch (error) {
            return { success: false, uuid, error };
          }
        })
      );
  
      // Update state: remove deleted roles
      setRoles((prev) => prev.filter((role) => !selected.includes(role.uuid)));
      setSelected([]); // Clear selection
      toast.success(`Successfully deleted ${selected.length} role(s)`);
    } catch (err) {
      toast.error('Bulk delete failed');
      console.error(err);
    }
  };

   // 🧹 Reset Form
  //  const resetForm = () => {
  //   setForm({
  //     name: '',
  //     description: '',
  //     privilegeUuids: [],
  //     inheritedRoleUuids: [] as string[],
  //   });
  // };

  // const handleOpenModal = () => {
  //   setForm({
  //     name: '',
  //     description: '',
  //     privilegeUuids: [],
  //     inheritedRoleUuids: [],
  //   });
  //   setModalOpen(true);
  // };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrivilegeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setForm((prev) => ({ ...prev, privilegeUuids: selected }));
  };

  const handleInheritedRoleChange = (selectedValues: string[]) => {
    setForm((prev) => ({ ...prev, inheritedRoleUuids: selectedValues }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Role Name is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        privileges: form.privilegeUuids.map((uuid) => ({ uuid })),
      };

      if (editMode && currentRole) {
        await updateRole(currentRole.uuid, payload);
        toast.success('Role updated successfully!');
      } else {
        await createRole(payload);
        toast.success('Role created successfully!');
      }

       // Refresh roles list
       const updatedRoles = await getRoles();
       setRoles(updatedRoles.results || []);
 
       setModalOpen(false);
       setForm({
        name: '',
        description: '',
        privilegeUuids: [],
        inheritedRoleUuids: [],
      });
     } catch (error: any) {
       toast.error('Error: ' + (error.message || 'Failed to create role'));
     } finally {
       setSubmitting(false);
     }
   };
 
   if (loading) return <p className="p-4">Loading roles and privileges...</p>;

   // ✅ Flatten roles into rows: one per privilege
  // const flattenedRows = roles.flatMap((role) =>
  //   (role.privileges || []).length > 0
  //     ? role.privileges.map((privilege: any) => ({
  //         roleDisplay: role.display,
  //         roleName: role.name,
  //         privilegeDisplay: privilege.display,
  //         privilegeDescription: privilege.description || '-',
  //         roleUuid: role.uuid,
  //       }))
  //     : [
  //         {
  //           roleDisplay: role.display,
  //           roleName: role.name,
  //           privilegeDisplay: 'No privileges assigned',
  //           privilegeDescription: '-',
  //           roleUuid: role.uuid,
  //         },
  //       ]
  // );



  return (
    <div className='space-y-6'>
      <Card>
      <CardHeader>
        <CardTitle>Roles & Permissions</CardTitle>
        <Button onClick={handleCreateOpen}> Add Role</Button>
      </CardHeader>
      <CardContent>
      <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                <TableHead className="w-8">
                    <Checkbox
                      checked={selected.length === roles.length && roles.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-1/3">Role</TableHead>
                  <TableHead className="w-1/3">Privilege</TableHead>
                  {/* <TableHead className="w-1/3">Description</TableHead> */}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {roles.length > 0 ? (
                  roles.map((role) => (
                    <React.Fragment key={role.uuid}>
                      {/* Main Role Row */}
                      <TableRow
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleExpand(role.uuid)}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selected.includes(role.uuid)}
                            onCheckedChange={() => toggleSelect(role.uuid)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{role.display}</TableCell>
                        <TableCell>
                          {role.privileges?.length || 0} privilege{role.privileges?.length !== 1 ? 's' : ''}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditOpen(role);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(role.uuid, role.display);
                              }}
                              disabled={deleting === role.uuid}
                            >
                              {deleting === role.uuid ? 'Deleting...' : 'Delete'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Privileges Rows */}
                      {expanded.includes(role.uuid) && (
                        <>
                          {role.privileges && role.privileges.length > 0 ? (
                            role.privileges.map((p: any) => (
                              <TableRow key={p.uuid} className="bg-muted/30 border-t">
                                <TableCell></TableCell>
                                <TableCell colSpan={3} className="py-1 pl-12 text-sm">
                                  <div className="font-medium">{p.display}</div>
                                  <div className="text-gray-600 text-xs">
                                    {p.description || '-'}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow className="bg-muted/30 border-t">
                              <TableCell></TableCell>
                              <TableCell colSpan={3} className="py-1 pl-12 text-sm text-gray-500">
                                No privileges assigned.
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                      No roles found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* Bulk Action Bar */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-md mb-4 text-sm">
            <div className="flex items-center gap-3">
              <span className="font-medium">
                {selected.length} role(s) selected
              </span>
              {selected.length === 0 && (
                <span className="text-gray-500">Select roles to delete</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Cancel Button */}
              {selected.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelected([])}
                  className="text-xs"
                >
                  Clear Selection
                </Button>
              )}

              {/* Delete Button (Disabled when no selection) */}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={selected.length === 0}
                className="text-xs min-w-[120px]"
              >
                {selected.length === 0 ? 'No Selection' : `Delete ${selected.length}`}
              </Button>
            </div>
          </div>
        </CardContent>   
      </Card>

      {/* Add/Edit Role Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editMode ? 'Edit Role' : 'Create New Role'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Role Name *</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g., provider, nurse"
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
            <div>
            <Label>Assign Privileges *</Label>

            {/* Select All Checkbox */}
            <div className="border rounded-t p-2 bg-gray-50">
              <div className="flex items-center">
                <Checkbox
                  id="select-all-privileges"
                  checked={form.privilegeUuids.length > 0 && form.privilegeUuids.length === privileges.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      // Select all
                      setForm((prev) => ({
                        ...prev,
                        privilegeUuids: privileges.map((p: any) => p.uuid),
                      }));
                    } else {
                      // Unselect all
                      setForm((prev) => ({ ...prev, privilegeUuids: [] }));
                    }
                  }}
                />
                <label
                 htmlFor="select-all-privileges"
                 className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
               >
                 Select All
               </label>
             </div>
           </div>
         
           {/* Privileges Checkbox List */}
           <div className="border-x border-b rounded-b max-h-60 overflow-y-auto">
             {privileges.length === 0 ? (
               <p className="p-4 text-sm text-gray-500">No privileges available</p>
             ) : (
               privileges.map((p: any) => {
                 const isChecked = form.privilegeUuids.includes(p.uuid);
                 return (
                   <div
                     key={p.uuid}
                     className={`flex items-center p-2 border-b last:border-0 hover:bg-gray-50 ${
                       isChecked ? 'bg-blue-50' : ''
                     }`}
                   >
                     <Checkbox
                        id={`privilege-${p.uuid}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          setForm((prev) => ({
                            ...prev,
                            privilegeUuids: checked
                              ? [...prev.privilegeUuids, p.uuid]
                              : prev.privilegeUuids.filter((id) => id !== p.uuid),
                          }));
                        }}
                      />
                      <label
                        htmlFor={`privilege-${p.uuid}`}
                        className="ml-2 text-sm leading-none cursor-pointer flex-1"
                      >
                        <div className="font-medium">{p.display}</div>
                        {p.description && (
                          <div className="text-xs text-gray-600">{p.description}</div>
                        )}
                      </label>
                    </div>
                  );
                })
              )}
            </div>
          </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (editMode ? 'Updating...' : 'Creating...') : editMode ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
                       
                
              