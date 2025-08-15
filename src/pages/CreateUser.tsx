import { useState, useEffect } from 'react';
import { createUser, getRoles } from '@/api/user';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner'; // Optional: for notifications

export default function CreateUserComponent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<{ uuid: string; display: string }[]>([]);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    personUuid: '', // You'll need a person first (simplified here)
    selectedRoles: [] as string[],
  });

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const data = await getRoles();
        setRoles(data.results || []);
      } catch (err) {
        toast.error('Failed to load roles');
      }
    };
    loadRoles();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setFormData((prev) => ({ ...prev, selectedRoles: selectedOptions }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await createUser({
        username: formData.username,
        password: formData.password,
        confirmPassword: formData.password,
        person: { uuid: formData.personUuid || '82e0a560-7eac-11e0-8c9e-0017a4787fac' }, // Default "Unknown Person" (use real person picker later)
        roles: formData.selectedRoles.map((uuid) => ({ uuid })),
      });

      toast.success('User created successfully!');
      navigate('/admin/users'); // Go back to users list
    } catch (error: any) {
      toast.error('Error: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New User</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Username</Label>
            <Input
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label>Password</Label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label>Confirm Password</Label>
            <Input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label>Assign Roles</Label>
            <select
              multiple
              value={formData.selectedRoles}
              onChange={handleRoleChange}
              className="w-full border rounded p-2 h-32"
            >
              {roles.map((role) => (
                <option key={role.uuid} value={role.uuid}>
                  {role.display}
                </option>
              ))}
            </select>
          </div>

          {/* Hidden field for person UUID – in real app, use person picker */}
          <input type="hidden" name="personUuid" value={formData.personUuid} />

          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}