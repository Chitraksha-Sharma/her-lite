import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PersonAttributeType {
  id: string;
  name: string;
  format: string;
  searchable: boolean;
  description: string;
  editPrivilege: string;
}

interface AddAttributeForm {
  name: string;
  format: string;
  foreignKey: string;
  searchable: boolean;
  description: string;
  editPrivilege: string;
}

const ManagePersonAttributeType: React.FC = () => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addForm, setAddForm] = useState<AddAttributeForm>({
    name: '',
    format: '',
    foreignKey: '',
    searchable: false,
    description: '',
    editPrivilege: ''
  });

  // Mock data - replace with actual API calls
  const [attributeTypes] = useState<PersonAttributeType[]>([
    {
      id: '1',
      name: 'Phone Number',
      format: 'Text',
      searchable: true,
      description: 'Primary phone number',
      editPrivilege: 'Admin'
    },
    {
      id: '2',
      name: 'Email Address',
      format: 'Email',
      searchable: true,
      description: 'Primary email address',
      editPrivilege: 'User'
    },
    {
      id: '3',
      name: 'Date of Birth',
      format: 'Date',
      searchable: false,
      description: 'Patient date of birth',
      editPrivilege: 'Admin'
    }
  ]);

  const [listingForm, setListingForm] = useState({
    maxSearchResults: '',
    searchDelayMs: '',
    numResultsShown: '',
    viewPrivilege: '',
    editPrivilege: ''
  });

  const formatOptions = ['Text', 'Number', 'Date', 'Email', 'Phone', 'Boolean'];
  const privilegeOptions = ['Admin', 'User', 'Doctor', 'Nurse', 'View Only'];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!addForm.name || !addForm.format) {
      toast({
        title: "Validation Error",
        description: "Name and Format are required fields.",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically make an API call to save the attribute type
    console.log('Adding new person attribute type:', addForm);
    
    toast({
      title: "Success",
      description: "Person attribute type added successfully.",
    });

    // Reset form and close dialog
    setAddForm({
      name: '',
      format: '',
      foreignKey: '',
      searchable: false,
      description: '',
      editPrivilege: ''
    });
    setIsAddDialogOpen(false);
  };

  const handleListingSave = () => {
    // Here you would typically make an API call to save the listing configuration
    console.log('Saving listing configuration:', listingForm);
    
    toast({
      title: "Success",
      description: "Listing configuration saved successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Attribute Type</h2>
      </div>

      {/* Section 1: Add New Person Attribute Type */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Person Attribute Types</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add new person Attribute Type
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Person Attribute Type</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={addForm.name}
                      onChange={(e) => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="format">Format *</Label>
                    <Select value={addForm.format} onValueChange={(value) => setAddForm(prev => ({ ...prev, format: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        {formatOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="foreignKey">Foreign Key</Label>
                    <Input
                      id="foreignKey"
                      value={addForm.foreignKey}
                      onChange={(e) => setAddForm(prev => ({ ...prev, foreignKey: e.target.value }))}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="searchable"
                      checked={addForm.searchable}
                      onCheckedChange={(checked) => setAddForm(prev => ({ ...prev, searchable: !!checked }))}
                    />
                    <Label htmlFor="searchable">Searchable</Label>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={addForm.description}
                      onChange={(e) => setAddForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="editPrivilege">Edit Privilege</Label>
                    <Select value={addForm.editPrivilege} onValueChange={(value) => setAddForm(prev => ({ ...prev, editPrivilege: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select privilege" />
                      </SelectTrigger>
                      <SelectContent>
                        {privilegeOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full">
                    Save Attribute Type
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Section 2: Attribute Types List */}
      <Card>
        <CardHeader>
          <CardTitle>Attribute Types</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Searchable</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Edit Privilege</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attributeTypes.map((attr) => (
                <TableRow key={attr.id}>
                  <TableCell className="font-medium">{attr.name}</TableCell>
                  <TableCell>{attr.format}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      attr.searchable 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {attr.searchable ? 'Yes' : 'No'}
                    </span>
                  </TableCell>
                  <TableCell>{attr.description}</TableCell>
                  <TableCell>{attr.editPrivilege}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Section 3: Listing and Viewing Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Listing and Viewing of Person Attribute Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground min-w-[200px]">Maximum search results:</span>
              <Input
                className="w-32"
                value={listingForm.maxSearchResults}
                onChange={(e) => setListingForm(prev => ({ ...prev, maxSearchResults: e.target.value }))}
                placeholder="100"
              />
              <span className="text-sm text-muted-foreground">results per page</span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground min-w-[200px]">Search delay:</span>
              <Input
                className="w-32"
                value={listingForm.searchDelayMs}
                onChange={(e) => setListingForm(prev => ({ ...prev, searchDelayMs: e.target.value }))}
                placeholder="300"
              />
              <span className="text-sm text-muted-foreground">milliseconds before search</span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground min-w-[200px]">Number of results shown:</span>
              <Input
                className="w-32"
                value={listingForm.numResultsShown}
                onChange={(e) => setListingForm(prev => ({ ...prev, numResultsShown: e.target.value }))}
                placeholder="25"
              />
              <span className="text-sm text-muted-foreground">items in dropdown</span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground min-w-[200px]">View privilege required:</span>
              <Input
                className="w-48"
                value={listingForm.viewPrivilege}
                onChange={(e) => setListingForm(prev => ({ ...prev, viewPrivilege: e.target.value }))}
                placeholder="View Person Attributes"
              />
              <span className="text-sm text-muted-foreground">to view attributes</span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground min-w-[200px]">Edit privilege required:</span>
              <Input
                className="w-48"
                value={listingForm.editPrivilege}
                onChange={(e) => setListingForm(prev => ({ ...prev, editPrivilege: e.target.value }))}
                placeholder="Edit Person Attributes"
              />
              <span className="text-sm text-muted-foreground">to edit attributes</span>
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={handleListingSave}>
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagePersonAttributeType;