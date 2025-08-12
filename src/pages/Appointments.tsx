import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  CalendarIcon, 
  Search, 
  Plus, 
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Calendar as CalendarDays
} from "lucide-react";
import { format } from "date-fns";
import ScheduleAppointmentModal from "@/components/ScheduleAppointmentModal";

const Appointments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [activeView, setActiveView] = useState("list");

  const appointments = [
    {
      id: "APT001",
      patientName: "John Doe",
      patientId: "PAT001",
      doctor: "Dr. Sarah Wilson",
      department: "Cardiology",
      date: "2024-01-17",
      time: "09:00 AM",
      status: "scheduled",
      type: "Follow-up",
      duration: "30 min"
    },
    {
      id: "APT002",
      patientName: "Jane Smith",
      patientId: "PAT002", 
      doctor: "Dr. Michael Johnson",
      department: "General Medicine",
      date: "2024-01-17",
      time: "10:30 AM",
      status: "confirmed",
      type: "Consultation",
      duration: "45 min"
    },
    {
      id: "APT003",
      patientName: "Mike Johnson",
      patientId: "PAT003",
      doctor: "Dr. Emily Davis",
      department: "Orthopedics",
      date: "2024-01-17",
      time: "02:00 PM",
      status: "completed",
      type: "Check-up",
      duration: "30 min"
    },
    {
      id: "APT004",
      patientName: "Sarah Brown",
      patientId: "PAT004",
      doctor: "Dr. Robert Chen",
      department: "Dermatology",
      date: "2024-01-17",
      time: "03:30 PM",
      status: "cancelled",
      type: "Consultation",
      duration: "30 min"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Scheduled</Badge>;
      case "confirmed":
        return <Badge variant="default" className="bg-emerald-100 text-emerald-800"><CheckCircle className="w-3 h-3 mr-1" />Confirmed</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const todaysAppointments = appointments.filter(apt => apt.date === "2024-01-17");
  const upcomingAppointments = todaysAppointments.filter(apt => apt.status !== "completed" && apt.status !== "cancelled");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-full bg-primary/10">
          <CalendarIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-primary">Appointments</h1>
          <p className="text-muted-foreground">Manage patient appointments and scheduling</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Today's Appointments</span>
            </div>
            <div className="text-2xl font-bold text-primary">{todaysAppointments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-muted-foreground">Upcoming</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{upcomingAppointments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-muted-foreground">Completed</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600">1</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-muted-foreground">Total Patients</span>
            </div>
            <div className="text-2xl font-bold text-amber-600">4</div>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button 
          variant={activeView === "list" ? "default" : "outline"}
          onClick={() => setActiveView("list")}
        >
          List View
        </Button>
        <Button 
          variant={activeView === "calendar" ? "default" : "outline"}
          onClick={() => setActiveView("calendar")}
        >
          Calendar View
        </Button>
      </div>

      {/* List View */}
      {activeView === "list" && (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Appointment Schedule</CardTitle>
                <CardDescription>View and manage all appointments</CardDescription>
              </div>
              <ScheduleAppointmentModal>
                <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                  New Appointment
                </Button>
              </ScheduleAppointmentModal>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient name, doctor, or appointment ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-40">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Appointments Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Appointment ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">{appointment.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{appointment.patientName}</div>
                        <div className="text-sm text-muted-foreground">{appointment.patientId}</div>
                      </div>
                    </TableCell>
                    <TableCell>{appointment.doctor}</TableCell>
                    <TableCell>{appointment.department}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{appointment.date}</div>
                        <div className="text-sm text-muted-foreground">{appointment.time} ({appointment.duration})</div>
                      </div>
                    </TableCell>
                    <TableCell>{appointment.type}</TableCell>
                    <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View</Button>
                        {appointment.status === "scheduled" && (
                          <>
                            <Button size="sm" className="bg-primary hover:bg-primary/90">Confirm</Button>
                            <Button size="sm" variant="destructive">Cancel</Button>
                          </>
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

      {/* Calendar View */}
      {activeView === "calendar" && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>Visual appointment scheduling</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Appointments for {format(new Date(), "PPP")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {todaysAppointments.map((appointment) => (
                <div key={appointment.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{appointment.time}</span>
                    {getStatusBadge(appointment.status)}
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">{appointment.patientName}</div>
                    <div className="text-muted-foreground">{appointment.doctor}</div>
                    <div className="text-muted-foreground">{appointment.type}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Appointments;