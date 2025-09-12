import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Eye, Edit, UserPlus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchPatients, Patient } from "@/api/patientApi";

const PatientList = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchPatients();
        setPatients(data);
      } catch (err: any) {
        setError(err.message || "Failed to load patients");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // ✅ Apply search + status filter
  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.identifier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.birthdate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.postalCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.gender?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all"
        ? true
        : p.status?.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            Active
          </Badge>
        );
      case "critical":
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
            Critical
          </Badge>
        );
      case "inactive":
        return (
          <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20">
            Inactive
          </Badge>
        );
      default:
        return <Badge variant="outline">{status || "-"}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Patient Management
            </h1>
            <p className="text-muted-foreground">
              Manage and view all registered patients
            </p>
          </div>
        </div>
        <Button
          variant="animated"
          className="bg-primary hover:bg-primary/90"
          onClick={() => navigate("/patient-registration")}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Register New Patient
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Patients
                </p>
                <p className="text-2xl font-bold text-primary">
                  {patients.length}
                </p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Patients
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {patients.filter((p) => p.status === "Active").length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Critical Cases
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {patients.filter((p) => p.status === "Critical").length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary">Search & Filter Patients</CardTitle>
          <CardDescription>
            Find patients quickly using search and filters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Search Patients</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, city, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-80 pl-10 border-primary/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary">
            Patient List ({filteredPatients.length})
          </CardTitle>
          <CardDescription>
            Complete list of registered patients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading patients...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="rounded-md border border-primary/20">
              <Table>
                <TableHeader>
                  <TableRow className="border-primary/20">
                    <TableHead>Identifier</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>BirthDate</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((p) => (
                    <TableRow
                      key={p.id}
                      className="border-primary/20 hover:bg-muted/50"
                    >
                      {/* <TableCell className="font-medium text-primary">
                        {p.id}
                      </TableCell> */}
                      <TableCell>{p.identifier}</TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.birthdate}</TableCell>
                      <TableCell>{p.gender}</TableCell>
                      <TableCell>{p.phone}</TableCell>
                      <TableCell>{p.city}</TableCell>
                      <TableCell>{getStatusBadge(p.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => navigate(`/patient/${p.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => navigate(`/patient/edit/${p.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientList;
