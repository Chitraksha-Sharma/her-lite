import { useState, useEffect } from 'react';
import { getPrivileges } from '@/api/privilege';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

export default function Privileges() {
  const [privileges, setPrivileges] = useState<any[]>([]);
  const [filteredPrivileges, setFilteredPrivileges] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPrivileges = async () => {
      try {
        const data = await getPrivileges();
        setPrivileges(data.results || []);
        setFilteredPrivileges(data.results || []);
      } catch (err) {
        console.error('Failed to load privileges:', err);
        toast.error('Failed to load privileges');
      } finally {
        setLoading(false);
      }
    };
    loadPrivileges();
  }, []);

  useEffect(() => {
    setFilteredPrivileges(
      privileges.filter((p) =>
        p.display?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.uuid?.includes(searchTerm)
      )
    );
  }, [searchTerm, privileges]);

  if (loading) return <p>Loading privileges...</p>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Privileges</CardTitle>
          <div className="flex items-center max-w-md">
            <Search className="h-6 w-6 text-gray-500 ml-3" />
            <Input
              placeholder="Search privileges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 ml-3"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrivileges.length > 0 ? (
                filteredPrivileges.map((privilege) => (
                  <TableRow key={privilege.uuid}>
                    <TableCell className="font-medium">{privilege.display}</TableCell>
                    <TableCell>
                      {privilege.description || '-'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                <TableCell colSpan={2} className="text-center py-6 text-gray-500">
                  No privileges found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
);
}