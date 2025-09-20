import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Search, 
  Plus, 
  Download,
  Eye,
  Calendar,
  Stethoscope,
  Activity,
  File
} from "lucide-react";

const MedicalRecords = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const medicalRecords = [
    {
      id: "REC001",
      patientName: "John Doe",
      patientId: "PAT001",
      type: "Consultation",
      date: "2024-01-15",
      doctor: "Dr. Sarah Wilson",
      department: "Cardiology",
      diagnosis: "Hypertension",
      status: "completed",
      attachments: 2
    },
    {
      id: "REC002",
      patientName: "Jane Smith",
      patientId: "PAT002",
      type: "Lab Report",
      date: "2024-01-14",
      doctor: "Dr. Michael Johnson",
      department: "Laboratory",
      diagnosis: "Blood Test Results",
      status: "final",
      attachments: 1
    },
    {
      id: "REC003",
      patientName: "Mike Johnson",
      patientId: "PAT003",
      type: "Imaging",
      date: "2024-01-13",
      doctor: "Dr. Emily Davis",
      department: "Radiology",
      diagnosis: "X-Ray Chest",
      status: "reviewed",
      attachments: 3
    }
  ];

  const vitalSigns = [
    {
      date: "2024-01-16",
      bloodPressure: "120/80",
      heartRate: "72",
      temperature: "98.6°F",
      weight: "70kg",
      height: "175cm"
    },
    {
      date: "2024-01-10",
      bloodPressure: "118/78",
      heartRate: "70",
      temperature: "98.4°F",
      weight: "69.5kg",
      height: "175cm"
    }
  ];

  const labResults = [
    {
      test: "Complete Blood Count",
      date: "2024-01-14",
      result: "Normal",
      reference: "Within range",
      status: "final"
    },
    {
      test: "Lipid Profile",
      date: "2024-01-12",
      result: "Elevated Cholesterol",
      reference: "200-240 mg/dL",
      status: "final"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "final":
        return <Badge variant="default" className="bg-gray-20 text-emerald-900 hover:bg-black/4 border-emerald-200">Final</Badge>;
      case "reviewed":
        return <Badge variant="secondary" className="bg-gray-20 text-blue-800 hover:bg-black/4 border-blue-300">Reviewed</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-gray-20 text-amber-800 hover:bg-black/4">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case "Consultation":
        return <Stethoscope className="h-4 w-4" />;
      case "Lab Report":
        return <Activity className="h-4 w-4" />;
      case "Imaging":
        return <File className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-full bg-primary/10">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-black">Medical Records</h1>
          <p className="text-muted-foreground">View and manage patient medical records</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Total Records</span>
            </div>
            <div className="text-2xl font-bold">1,247</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-muted-foreground">Consultations</span>
            </div>
            <div className="text-2xl font-bold">856</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-muted-foreground">Lab Reports</span>
            </div>
            <div className="text-2xl font-bold">234</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <File className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-muted-foreground">Imaging</span>
            </div>
            <div className="text-2xl font-bold">157</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="records" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="records">Records</TabsTrigger>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="labs">Lab Results</TabsTrigger>
          <TabsTrigger value="imaging">Imaging</TabsTrigger>
        </TabsList>

        {/* Medical Records Tab */}
        <TabsContent value="records">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Medical Records</CardTitle>
                  <CardDescription>All patient medical records and documents</CardDescription>
                </div>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" />
                  New Record
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by patient name, diagnosis, or record ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="lab">Lab Report</SelectItem>
                    <SelectItem value="imaging">Imaging</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Records Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Record ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medicalRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.patientName}</div>
                          <div className="text-sm text-muted-foreground">{record.patientId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRecordTypeIcon(record.type)}
                          {record.type}
                        </div>
                      </TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.doctor}</div>
                          <div className="text-sm text-muted-foreground">{record.department}</div>
                        </div>
                      </TableCell>
                      <TableCell>{record.diagnosis}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vital Signs Tab */}
        <TabsContent value="vitals">
          <Card>
            <CardHeader>
              <CardTitle>Vital Signs</CardTitle>
              <CardDescription>Patient vital signs history</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Blood Pressure</TableHead>
                    <TableHead>Heart Rate</TableHead>
                    <TableHead>Temperature</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Height</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vitalSigns.map((vital, index) => (
                    <TableRow key={index}>
                      <TableCell>{vital.date}</TableCell>
                      <TableCell>{vital.bloodPressure}</TableCell>
                      <TableCell>{vital.heartRate} bpm</TableCell>
                      <TableCell>{vital.temperature}</TableCell>
                      <TableCell>{vital.weight}</TableCell>
                      <TableCell>{vital.height}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lab Results Tab */}
        <TabsContent value="labs">
          <Card>
            <CardHeader>
              <CardTitle>Laboratory Results</CardTitle>
              <CardDescription>Patient laboratory test results</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Reference Range</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {labResults.map((lab, index) => (
                    <TableRow key={index}>
                      <TableCell>{lab.test}</TableCell>
                      <TableCell>{lab.date}</TableCell>
                      <TableCell>{lab.result}</TableCell>
                      <TableCell>{lab.reference}</TableCell>
                      <TableCell>{getStatusBadge(lab.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Imaging Tab */}
        <TabsContent value="imaging">
          <Card>
            <CardHeader>
              <CardTitle>Medical Imaging</CardTitle>
              <CardDescription>Patient imaging studies and reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No imaging studies available</p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Imaging Study
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MedicalRecords;