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

interface Encounter {
  uuid: string;
  encounterDatetime: string;
  patient: {
    uuid: string;
    display: string;
  };
  location: {
    display: string;
  };
  encounterType: {
    display: string;
  };
  voided: boolean;
}

export default function ManageEncounters() {
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchEncounters = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchTerm,
        v: 'full',
        ...(includeDeleted && { voided: 'true' }),
      });

      const res = await fetch(`${BASE_URL}/encounter?${params}`, {
        headers: { 'Accept': 'application/json' },
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to fetch encounters');
      const data = await res.json();

      const list: Encounter[] = (data.results || []).map((e: any) => ({
        uuid: e.uuid,
        encounterDatetime: e.encounterDatetime,
        patient: e.patient,
        location: e.location,
        encounterType: e.encounterType,
        voided: e.voided || false,
      }));

      setEncounters(list);
    } catch (err: any) {
      toast.error('Load failed: ' + (err.message || 'Network error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEncounters();
  }, [searchTerm, includeDeleted]);

  const filteredEncounters = encounters.filter((e) =>
    e.patient.display.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.uuid.includes(searchTerm)
  );

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-center justify-between gap-4">
        <CardTitle>Manage Encounters</CardTitle>
        <Button onClick={() => navigate('/admin/create-encounter')}>
          Add Encounter
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Find Encounters */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Find Encounters</h3>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-64">
              <Label htmlFor="search">Encounter ID, Patient ID, or Name</Label>
              <Input
                id="search"
                placeholder="Enter ID or name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeDeleted"
                checked={includeDeleted}
                onCheckedChange={(checked) => setIncludeDeleted(!!checked)}
              />
              <Label htmlFor="includeDeleted">Include Deleted</Label>
            </div>
          </div>
        </div>

        {/* Encounters List */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Encounter Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEncounters.length > 0 ? (
                filteredEncounters.map((e) => (
                  <TableRow
                    key={e.uuid}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/admin/edit-encounter/${e.uuid}`)}
                  >
                    <TableCell className="font-medium">{e.patient.display}</TableCell>
                    <TableCell>{e.encounterType.display}</TableCell>
                    <TableCell>{e.location.display}</TableCell>
                    <TableCell>
                      {new Date(e.encounterDatetime).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          e.voided
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {e.voided ? 'Deleted' : 'Active'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                    No encounters found.
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