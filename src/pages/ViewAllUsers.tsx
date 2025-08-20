import { useState, useEffect } from 'react';
import { getUsers, deleteUser } from '@/api/user';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import CreateUserModal from './CreateUserModal';
import { toast } from 'sonner';

export default function ViewAllUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);


    const loadUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data.results || []);
        setFilteredUsers(data.results || []);
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    setFilteredUsers(
      users.filter(
        (u) =>
          u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.display?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, users]);

   // ✅ Handle Delete User
   const handleDelete = async (user: any) => {
    if (!confirm(`Are you sure you want to delete user "${user.display}"? This cannot be undone.`)) {
      return;
    }

    setDeleting(user.uuid);
    try {
      await deleteUser(user.uuid);
      toast.success('User deleted successfully');
      setUsers((prev) => prev.filter((u) => u.uuid !== user.uuid));
      setFilteredUsers((prev) => prev.filter((u) => u.uuid !== user.uuid));
      loadUsers(); // Refresh list
    } catch (error: any) {
      toast.error('Delete failed: ' + (error.message || 'You may not have permission'));
    }finally {
      setDeleting(null);
    }
  };

  // Assume you have current user UUID
  // const currentUserId = '...';

  // if (user.uuid === currentUserId) {
  //   toast.error('You cannot delete your own account');
  //   return;
  // }

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center max-w-4xl justify-between flex-wrap gap-4">
        <div className="flex items-center max-w-md">
          <Search className="h-6 w-6 text-gray-500 ml-3" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 ml-3"
          />
        </div>
        <CreateUserModal onSuccess={loadUsers} /> {/* ✅ Auto-refresh */}
         {/* delete User */}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.uuid}>
                  <TableCell>{user.display}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    {user.roles?.slice(0, 2).map((r: any) => r.display).join(', ')}
                    {user.roles?.length > 2 && ' + more'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(user)}
                      disabled={deleting === user.uuid}
                      // className="flex items-center gap-1"
                    >
                      {deleting === user.uuid ? (
                        'Deleting...'
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6 text-gray-500">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}