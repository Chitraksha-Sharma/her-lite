import { useState, useEffect } from 'react';
import { getRoles } from '@/api/user';
import { getPrivileges } from '@/api/privilege';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function RolesPermissions() {
  const [roles, setRoles] = useState<any[]>([]);
  const [privileges, setPrivileges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  //form state
  const [form, setForm] = useState({
    display: '',
    description: '',
    privilegeUuids: [] as string[],
    inheritedRoleUuids: [] as string[], // Not used in API, but for UI clarity
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
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
    loadData();
  }, []);

  const handleOpenModal = () => {
    setForm({
      display: '',
      description: '',
      privilegeUuids: [],
      inheritedRoleUuids: [],
    });
    setModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrivilegeChange = (selectedValues: string[]) => {
    setForm((prev) => ({ ...prev, privilegeUuids: selectedValues }));
  };

  const handleInheritedRoleChange = (selectedValues: string[]) => {
    setForm((prev) => ({ ...prev, inheritedRoleUuids: selectedValues }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.display.trim()) {
      toast.error('Role Name is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        display: form.display,
        description: form.description,
        privileges: form.privilegeUuids.map((uuid) => ({ uuid })),
      };

      await createRole(payload);

       // Refresh roles list
       const updatedRoles = await getRoles();
       setRoles(updatedRoles.results || []);
 
       toast.success('Role created successfully!');
       setModalOpen(false);
     } catch (error: any) {
       toast.error('Error: ' + (error.message || 'Failed to create role'));
     } finally {
       setSubmitting(false);
     }
   };
 
   if (loading) return <p className="p-4">Loading roles and privileges...</p>;


  return (
    <Card>
      <CardHeader>
        <CardTitle>Roles & Permissions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {roles.length === 0 ? (
            <p>NO roles found</p>
          ) : (
            roles.map((role) => (
              <div key={role.uuid} className="border p-3 rounded">
                <h4 className="font-semibold">{role.display}</h4>
                {role.description && (
                  <p className="text-sm text-gray-600">
                    <strong>Description:</strong> {role.description}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                Privileges: {role.privileges?.length || 0}
                </p>
                <ul className="list-disc list-inside text-sm mt-1">
                  {role.privileges?.slice(0, 3).map((p: any) => (
                    <li key={p.uuid}>{p.display}</li>
                  ))}
                  {role.privileges?.length > 3 && <li>... and more</li>}
                </ul>
              </div>
            ))
          )}
        </div>
      </CardContent>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="display">Role Name *</Label>
                <Input
                  id="display"
                  name="display"
                  value={form.display}
                  onChange={handleChange}
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
                <Label>Inherited Roles</Label>
                <Select
                  onValueChange={(values) => handleInheritedRoleChange(values)}
                  value={form.inheritedRoleUuids}
                  multiple
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select inherited roles..." />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.uuid} value={r.uuid}>
                        {r.display}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Note: Inheritance is conceptual. Privileges must be assigned directly.
                </p>
              </div>

              <div>
                <Label>Privileges *</Label>
                <Select
                  onValueChange={handlePrivilegeChange}
                  value={form.privilegeUuids}
                  multiple
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select privileges..." />
                  </SelectTrigger>
                  <SelectContent>
                    {privileges.map((p) => (
                      <SelectItem key={p.uuid} value={p.uuid}>
                        {p.display}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Role'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
