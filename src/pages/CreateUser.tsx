import { useState, useEffect } from 'react';
import { createPerson } from '@/api/person';
import { createUser, getRoles } from '@/api/user';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner'; // Optional: for notifications

// Define props
interface CreateUserProps {
  onClose?: () => void; // Optional: close modal
  onSuccess?: () => void; // Optional: refresh data
}

const CreateUser = ({ onClose, onSuccess }: CreateUserProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<{ uuid: string; display: string }[]>([]);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    // confirmPassword: '',
    firstName: '',
    lastName: '',
    gender: 'M',
    birthdate: '',
    // personData: '', // You'll need a person first (simplified here)
    // selectedRoles: [] as string[],
  });
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    console.log("CreateUser component loaded!");
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
    setSelectedRoles(selectedOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // if (formData.password !== formData.confirmPassword) {
    //   toast.error('Passwords do not match');
    //   return;
    // }
    if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return;
      }

      // ✅ Validate birthdate is not in the future
    if (formData.birthdate) {
      const birthDate = new Date(formData.birthdate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (birthDate > today) {
        toast.error('Birthdate cannot be in the future');
        return;
      }
    }

    setLoading(true);
    try {
        // Step 1: Create Person
        const personUuid = await createPerson({
            firstName: formData.firstName,
            lastName: formData.lastName,
            gender: formData.gender,
            birthdate: formData.birthdate || null,
          });
      
          if (!personUuid) {
            throw new Error('Person creation failed: No UUID returned');
          }
  

      //create user with new personUuid
      await createUser({
        username: formData.username,
        password: formData.password,
        // confirmPassword: formData.password,
        personUuid, // Default "Unknown Person" (use real person picker later)
        roles: selectedRoles.map((uuid) => ({ uuid })),
      });

      toast.success('User created successfully!');
      // navigate('/admin/users'); // Go back to users list
      // ✅ Callbacks
      onSuccess?.(); // Refresh list
      onClose?.();   // Close modal

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

          {/* <div>
            <Label>Confirm Password</Label>
            <Input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div> */}
          <div>
          <Label>First Name</Label>
            <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
            />
          </div>

          <div>
          <Label>Last Name</Label>
            <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
            />
          </div>

          <div>
          <Label>Gender</Label>
            <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
            >
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
            </select>
          </div>
          <div>
            <label>Date of Birth</label>
            <Input
                type='date'
                name="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
            />
          </div>
          <div>
            <Label>Assign Roles</Label>
            <select
              multiple
              value={selectedRoles}
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
          {/* <input type="hidden" name="personUuid" value={formData.personUuid} /> */}

          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
export default CreateUser