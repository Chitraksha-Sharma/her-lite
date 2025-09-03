import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const BASE_URL = '/openmrs/ws/rest/v1';

// 🔹 Fetch Persons
async function fetchPersons(name: string, includeVoided = false) {
  const params = new URLSearchParams({
    q: name,
    v: 'full',
    ...(includeVoided && { voided: 'true' }),
  });

  const res = await fetch(`${BASE_URL}/person?${params}`, {
    headers: { 'Accept': 'application/json' },
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error?.message || 'Failed to fetch persons');
  }

  const data = await res.json();
  return data.results || [];
}

export default function ManagePerson() {
  const [persons, setPersons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const navigate = useNavigate();

  // Load on search
  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      handleSearch();
    } else {
      setPersons([]);
    }
  }, [searchTerm, includeDeleted]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const results = await fetchPersons(searchTerm, includeDeleted);
      setPersons(results);
    } catch (err: any) {
      toast.error('Search failed: ' + (err.message || 'Network error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-center justify-between gap-4">
        <CardTitle>Person</CardTitle>
        <Button  onClick={() => navigate('/admin/create-person')}>
          Create
        </Button>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Find a Person */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Find a person</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <Label htmlFor="search">Person Name</Label>
              <Input
                id="search"
                placeholder="Enter name to search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeDeleted"
                  checked={includeDeleted}
                  onCheckedChange={(checked) =>
                    setIncludeDeleted(!!checked)
                  }
                />
                <Label htmlFor="includeDeleted">Include Deleted</Label>
              </div>
            </div>
          </div>
        </div>

        {/* Results Table */}
        {persons.length > 0 && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Birthdate</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {persons.map((person) => (
                  <TableRow key={person.uuid}>
                    <TableCell className="font-medium">
                      {person.display}
                    </TableCell>
                    <TableCell>{person.gender === 'M' ? 'Male' : 'Female'}</TableCell>
                    <TableCell>
                      {person.birthdate
                        ? new Date(person.birthdate).toLocaleDateString()
                        : 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/edit-person/${person.uuid}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {loading && <p>Searching...</p>}
      </CardContent>
    </Card>
  );
}