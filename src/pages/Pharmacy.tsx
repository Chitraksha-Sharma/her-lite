import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { 
  Pill, 
  Search, 
  Plus, 
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  ShoppingCart,
  FileText
} from "lucide-react";

const Pharmacy = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("inventory");

  const medications = [
    {
      id: "MED001",
      name: "Paracetamol 500mg",
      category: "Analgesic",
      stock: 150,
      minStock: 50,
      status: "in-stock",
      price: 2.50,
      supplier: "PharmaCorp",
      expiryDate: "2025-03-15"
    },
    {
      id: "MED002",
      name: "Amoxicillin 250mg",
      category: "Antibiotic", 
      stock: 25,
      minStock: 30,
      status: "low-stock",
      price: 15.75,
      supplier: "MediSupply",
      expiryDate: "2024-12-20"
    },
    {
      id: "MED003",
      name: "Insulin Injection",
      category: "Diabetes",
      stock: 0,
      minStock: 10,
      status: "out-of-stock",
      price: 45.00,
      supplier: "BioPharma",
      expiryDate: "2024-08-30"
    }
  ];

  const prescriptions = [
    {
      id: "RX001",
      patientName: "John Doe",
      patientId: "PAT001",
      prescribedBy: "Dr. Smith",
      status: "pending",
      medications: ["Paracetamol 500mg", "Vitamin D"],
      date: "2024-01-16",
      total: 25.50
    },
    {
      id: "RX002",
      patientName: "Jane Smith", 
      patientId: "PAT002",
      prescribedBy: "Dr. Johnson",
      status: "dispensed",
      medications: ["Amoxicillin 250mg"],
      date: "2024-01-15",
      total: 31.50
    }
  ];

  const getStockBadge = (status: string, stock: number) => {
    switch (status) {
      case "in-stock":
        return <Badge variant="default" className="bg-emerald-100 text-emerald-800"><CheckCircle className="w-3 h-3 mr-1" />In Stock ({stock})</Badge>;
      case "low-stock":
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800"><AlertTriangle className="w-3 h-3 mr-1" />Low Stock ({stock})</Badge>;
      case "out-of-stock":
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><Package className="w-3 h-3 mr-1" />Out of Stock</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "dispensed":
        return <Badge variant="default" className="bg-emerald-100 text-emerald-800"><CheckCircle className="w-3 h-3 mr-1" />Dispensed</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-full bg-primary/10">
          <Pill className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-primary">Pharmacy</h1>
          <p className="text-muted-foreground">Manage medications and prescriptions</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Total Medications</span>
            </div>
            <div className="text-2xl font-bold text-primary">425</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-muted-foreground">Low Stock</span>
            </div>
            <div className="text-2xl font-bold text-amber-600">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-muted-foreground">Pending Prescriptions</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">8</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-muted-foreground">Today's Sales</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600">$1,245</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <Button 
          variant={activeTab === "inventory" ? "default" : "ghost"}
          onClick={() => setActiveTab("inventory")}
          className="rounded-b-none"
        >
          Inventory
        </Button>
        <Button 
          variant={activeTab === "prescriptions" ? "default" : "ghost"}
          onClick={() => setActiveTab("prescriptions")}
          className="rounded-b-none"
        >
          Prescriptions
        </Button>
      </div>

      {/* Inventory Tab */}
      {activeTab === "inventory" && (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Medication Inventory</CardTitle>
                <CardDescription>Manage medication stock and supplies</CardDescription>
              </div>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Medication
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search medications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medication</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medications.map((med) => (
                  <TableRow key={med.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{med.name}</div>
                        <div className="text-sm text-muted-foreground">{med.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>{med.category}</TableCell>
                    <TableCell>{getStockBadge(med.status, med.stock)}</TableCell>
                    <TableCell>${med.price}</TableCell>
                    <TableCell>{med.supplier}</TableCell>
                    <TableCell>{med.expiryDate}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">Reorder</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Prescriptions Tab */}
      {activeTab === "prescriptions" && (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Prescriptions</CardTitle>
                <CardDescription>Manage patient prescriptions and dispensing</CardDescription>
              </div>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                New Prescription
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search prescriptions..."
                  className="pl-10"
                />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prescription ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Prescribed By</TableHead>
                  <TableHead>Medications</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescriptions.map((rx) => (
                  <TableRow key={rx.id}>
                    <TableCell className="font-medium">{rx.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{rx.patientName}</div>
                        <div className="text-sm text-muted-foreground">{rx.patientId}</div>
                      </div>
                    </TableCell>
                    <TableCell>{rx.prescribedBy}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {rx.medications.join(", ")}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(rx.status)}</TableCell>
                    <TableCell>{rx.date}</TableCell>
                    <TableCell>${rx.total}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View</Button>
                        {rx.status === "pending" && (
                          <Button size="sm" className="bg-primary hover:bg-primary/90">Dispense</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Pharmacy;