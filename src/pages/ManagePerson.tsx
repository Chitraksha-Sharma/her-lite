import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { searchPerson, getPersonById, deletePerson } from '@/api/person'; // 🔹 Import deletePerson

export default function ManagePerson() {
  const [persons, setPersons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [viewingPerson, setViewingPerson] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null); // 🔹 Track deletion state
  const navigate = useNavigate();

  // Load on search
  useEffect(() => {
    if (searchTerm.trim().length > 0 && !viewingPerson) {
      handleSearch();
    } else if (!viewingPerson) {
      setPersons([]);   
    }
  }, [searchTerm, includeDeleted, viewingPerson]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      console.log('Searching for:', searchTerm);
      const response = await searchPerson(searchTerm);
      console.log('Search response:', response);
      
      if (response.success) {
        let results = [];
        
        if (Array.isArray(response.data)) {
          results = response.data;
        } else if (response.data && Array.isArray(response.data.results)) {
          results = response.data.results;
        } else if (response.data && typeof response.data === 'object') {
          const dataArray = Object.values(response.data).find(Array.isArray);
          if (dataArray) {
            results = dataArray;
          } else {
            results = [response.data];
          }
        }
        
        console.log('Processed results:', results);
        
        if (!includeDeleted) {
          results = results.filter((person: any) => {
            return !(person.voided || person.deleted || person.isVoided);
          });
        }
        
        setPersons(results);
      } else {
        throw new Error(response.error || 'Failed to search persons');
      }
    } catch (err: any) {
      console.error('Search error:', err);
      toast.error('Search failed: ' + (err.message || 'Network error'));
      setPersons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPerson = async (personUuid: string) => {
    setLoading(true);
    try {
      const response = await getPersonById(personUuid);
      
      if (response.success) {
        setSelectedPerson(response.data);
        setViewingPerson(true);
      } else {
        throw new Error(response.error || 'Failed to fetch person details');
      }
    } catch (err: any) {
      toast.error('Failed to load person: ' + (err.message || 'Network error'));
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Delete person function
  const handleDeletePerson = async (personUuid: string, personName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${personName}? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(personUuid);
    try {
      const response = await deletePerson(personUuid);
      
      if (response.success) {
        toast.success('Person deleted successfully');
        // Remove deleted person from the list
        setPersons(prev => prev.filter(person => (person.uuid || person.id) !== personUuid));
        // If viewing the deleted person, go back to search
        if (selectedPerson && (selectedPerson.uuid === personUuid || selectedPerson.id === personUuid)) {
          setViewingPerson(false);
          setSelectedPerson(null);
        }
      } else {
        throw new Error(response.error || 'Failed to delete person');
      }
    } catch (err: any) {
      toast.error('Failed to delete person: ' + (err.message || 'Network error'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleBackToSearch = () => {
    setViewingPerson(false);
    setSelectedPerson(null);
  };

   

  const handleEditPerson = (personUuid: string) => {
    navigate(`/admin/update-person/${personUuid}`);
  };

  // Render person details view
  if (viewingPerson && selectedPerson) {
    return (
      <Card>
        <div className='flex justify-center items-center p-4 border-b'>
             <CardTitle className=''>Person Details</CardTitle>
        </div>

        <CardContent className="space-y-6">
          {loading && <p>Loading person details...</p>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              {/* <h3 className="text-lg font-semibold mb-4">Personal Information</h3> */}
              <div className="space-y-3">
                <div>
                  <Label className="text-sm text-muted-foreground">Name</Label>
                  <p className="font-medium">
                    {selectedPerson.names?.[0]?.givenName} {selectedPerson.names?.[0]?.familyName}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Gender</Label>
                  <p className="font-medium">
                    {selectedPerson.gender === 'M' ? 'Male' : selectedPerson.gender === 'F' ? 'Female' : 'Other'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Birthdate</Label>
                  <p className="font-medium">
                    {selectedPerson.birthdate 
                      ? new Date(selectedPerson.birthdate).toLocaleDateString()
                      : 'Not specified'}
                  </p>
                </div>
              </div>
            </div>

            {selectedPerson.addresses?.[0] && (
              <div>
                {/* <h3 className="text-lg font-semibold mb-4">Address</h3> */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Address</Label>
                    <p className="font-medium">{selectedPerson.addresses[0].address1 || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">City</Label>
                    <p className="font-medium">{selectedPerson.addresses[0].cityVillage || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Postal Code</Label>
                    <p className="font-medium">{selectedPerson.addresses[0].postalCode || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {selectedPerson.voided && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800 font-medium">⚠️ This person has been deleted</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-wrap items-center justify-end gap-4">
          <div className="flex gap-2">
            <Button onClick={handleBackToSearch} variant="outline">
              Back to Search
            </Button>
            <Button onClick={() => handleEditPerson(selectedPerson.uuid)}>
              Edit
            </Button>
            <Button 
              onClick={() => handleDeletePerson(selectedPerson.uuid, 
                `${selectedPerson.names?.[0]?.givenName} ${selectedPerson.names?.[0]?.familyName}`)}
              variant="destructive"
              disabled={deletingId === selectedPerson.uuid}
            >
              {deletingId === selectedPerson.uuid ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  }

  // Render search view
  return (
    <Card>
      <CardContent className="space-y-8">
        {/* Find a Person */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Find a person</h3>

          <div className="grid gap-4 md:grid-cols-2 md:items-end">
            {/* Left side: Search + checkbox */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <Label className="shrink-0">Person Name:</Label>
                <Input
                  placeholder="Enter name to search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
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

            {/* Right side: Create button */}
            <div className="flex justify-start md:justify-end">
              <Button onClick={() => navigate('/admin/create-person')}>
                Create New Person
              </Button>
            </div>
          </div>
        </div>


        {/* Debug info */}
        {loading && <p className="text-blue-600">Searching...</p>}
        {!loading && persons.length > 0 && (
          <p className="text-green-600">Found {persons.length} person(s)</p>
        )}

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
                {persons.map((person: any, index: number) => {
                  console.log(`Person ${index}:`, person);
                  
                  const displayName = person.display || 
                    person.name || 
                    person.preferredName?.display ||
                    `${person.names?.[0]?.givenName || ''} ${person.names?.[0]?.familyName || ''}`.trim() ||
                    'Unknown Name';
                  
                  const gender = person.gender || person.sex || 'Unknown';
                  const personId = person.uuid || person.id;
                  
                  return (
                    <TableRow key={personId || index}>
                      <TableCell className="font-medium">
                        {displayName}
                      </TableCell>
                      <TableCell>
                        {gender === 'M' ? 'Male' : gender === 'F' ? 'Female' : gender}
                      </TableCell>
                      <TableCell>
                        {person.birthdate
                          ? new Date(person.birthdate).toLocaleDateString()
                          : 'Unknown'}
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (personId) {
                              handleViewPerson(personId);
                            } else {
                              toast.error('Person ID not found');
                            }
                          }}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if (personId) {
                              handleEditPerson(personId);
                            } else {
                              toast.error('Person ID not found');
                            }
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletePerson(personId, displayName)}
                          disabled={deletingId === personId}
                        >
                          {deletingId === personId ? 'Deleting...' : 'Delete'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {!loading && searchTerm && persons.length === 0 && (
          <p>No persons found for "{searchTerm}".</p>
        )}
      </CardContent>
    </Card>
  );
}