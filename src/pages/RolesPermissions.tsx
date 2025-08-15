import { useState, useEffect } from 'react';
import { getRoles } from '@/api/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RolesPermissions() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const data = await getRoles();
        setRoles(data.results || []);
      } catch (err) {
        console.error('Failed to load roles:', err);
      } finally {
        setLoading(false);
      }
    };
    loadRoles();
  }, []);

  if (loading) return <p>Loading roles...</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roles & Permissions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {roles.map((role) => (
            <div key={role.uuid} className="border p-3 rounded">
              <h4 className="font-semibold">{role.display}</h4>
              <p className="text-sm text-gray-600">
                Privileges: {role.privileges?.length || 0}
              </p>
              <ul className="list-disc list-inside text-sm mt-1">
                {role.privileges?.slice(0, 3).map((p: any) => (
                  <li key={p.uuid}>{p.display}</li>
                ))}
                {role.privileges?.length > 3 && <li>... and more</li>}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
