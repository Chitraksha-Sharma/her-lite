import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Heart, 
  AlertTriangle, 
  Clock, 
  Pill, 
  ShoppingCart, 
  Plus,
  ArrowLeft,
  Activity,
  Stethoscope,
  FileText,
  Calendar,
  TestTube,
  MapPin,
  Clipboard,
  Eye,
  Microscope,
  Thermometer,
  Package
} from "lucide-react";

interface PatientData {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  address: string;
  bloodType: string;
  dateOfBirth: string;
  emergencyContact: string;
  status: "Active" | "Inactive" | "Critical";
}

interface Vital {
  id: string;
  date: string;
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  weight: string;
  height: string;
  notes: string;
}

interface Allergy {
  id: string;
  allergen: string;
  severity: "Mild" | "Moderate" | "Severe";
  reaction: string;
  dateReported: string;
}

interface MedicalHistory {
  id: string;
  condition: string;
  dateOfDiagnosis: string;
  status: "Active" | "Resolved" | "Chronic";
  notes: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  status: "Active" | "Completed" | "Discontinued";
}

interface Condition {
  id: string;
  name: string;
  dateIdentified: string;
  status: "Active" | "Resolved" | "Chronic" | "Managed";
  severity: "Mild" | "Moderate" | "Severe";
  notes: string;
}

interface LabResult {
  id: string;
  testName: string;
  value: string;
  normalRange: string;
  status: "Normal" | "High" | "Low" | "Critical";
  datePerformed: string;
  orderedBy: string;
  notes: string;
}

interface Visit {
  id: string;
  date: string;
  type: "Routine" | "Emergency" | "Follow-up" | "Consultation";
  provider: string;
  chiefComplaint: string;
  diagnosis: string;
  treatment: string;
  notes: string;
}

interface Program {
  id: string;
  name: string;
  type: "Wellness" | "Rehabilitation" | "Disease Management" | "Preventive";
  startDate: string;
  endDate?: string;
  status: "Active" | "Completed" | "Suspended";
  provider: string;
  goals: string;
}

interface Form {
  id: string;
  title: string;
  type: "Consent" | "Assessment" | "Insurance" | "Medical History" | "Other";
  dateCompleted: string;
  completedBy: string;
  status: "Complete" | "Incomplete" | "Pending Review";
}

interface ObservationForm {
  id: string;
  title: string;
  category: "Physical" | "Mental Health" | "Behavioral" | "Social";
  dateObserved: string;
  observer: string;
  findings: string;
  severity: "Normal" | "Mild" | "Moderate" | "Severe";
  actionRequired: boolean;
}

interface Diagnosis {
  id: string;
  code: string;
  description: string;
  type: "Primary" | "Secondary" | "Differential";
  dateOfDiagnosis: string;
  diagnosedBy: string;
  status: "Active" | "Resolved" | "Chronic";
  confidence: "Confirmed" | "Probable" | "Suspected";
}

interface Treatment {
  id: string;
  type: "Medication" | "Therapy" | "Surgery" | "Procedure" | "Lifestyle";
  description: string;
  startDate: string;
  endDate?: string;
  provider: string;
  status: "Active" | "Completed" | "Discontinued" | "Planned";
  effectiveness: "Excellent" | "Good" | "Fair" | "Poor" | "Unknown";
  notes: string;
}

interface LabOrderFulfillment {
  id: string;
  orderNumber: string;
  testName: string;
  orderedBy: string;
  dateOrdered: string;
  priority: "Routine" | "Urgent" | "STAT";
  status: "Ordered" | "In Progress" | "Completed" | "Cancelled";
  sampleCollected: boolean;
  collectionDate?: string;
  resultDate?: string;
  notes: string;
}

// Mock data for the patient
const mockPatientData: PatientData = {
  id: "P001",
  name: "John Doe",
  age: 45,
  gender: "Male",
  phone: "+1-555-0123",
  email: "john.doe@email.com",
  address: "123 Main St, City, State 12345",
  bloodType: "A+",
  dateOfBirth: "1979-05-15",
  emergencyContact: "+1-555-0124",
  status: "Active"
};

const PatientDetail = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  
  // States for different medical data
  const [patient] = useState<PatientData>(mockPatientData);
  const [vitals, setVitals] = useState<Vital[]>([
    {
      id: "V001",
      date: "2024-01-15",
      bloodPressure: "120/80",
      heartRate: "72",
      temperature: "98.6",
      weight: "175",
      height: "5'10\"",
      notes: "Normal vitals, patient feeling well"
    }
  ]);
  
  const [allergies, setAllergies] = useState<Allergy[]>([
    {
      id: "A001",
      allergen: "Penicillin",
      severity: "Severe",
      reaction: "Anaphylaxis",
      dateReported: "2020-03-10"
    }
  ]);
  
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>([
    {
      id: "H001",
      condition: "Hypertension",
      dateOfDiagnosis: "2018-06-20",
      status: "Chronic",
      notes: "Well controlled with medication"
    }
  ]);
  
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: "M001",
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      startDate: "2018-06-20",
      prescribedBy: "Dr. Smith",
      status: "Active"
    }
  ]);

  // New states for additional sections
  const [conditions, setConditions] = useState<Condition[]>([
    {
      id: "C001",
      name: "Diabetes Type 2",
      dateIdentified: "2019-03-15",
      status: "Active",
      severity: "Moderate",
      notes: "Well managed with diet and medication"
    }
  ]);

  const [labResults, setLabResults] = useState<LabResult[]>([
    {
      id: "L001",
      testName: "HbA1c",
      value: "7.2%",
      normalRange: "< 7.0%",
      status: "High",
      datePerformed: "2024-01-10",
      orderedBy: "Dr. Smith",
      notes: "Trending downward from previous results"
    }
  ]);

  const [visits, setVisits] = useState<Visit[]>([
    {
      id: "V001",
      date: "2024-01-15",
      type: "Routine",
      provider: "Dr. Smith",
      chiefComplaint: "Regular checkup",
      diagnosis: "Stable chronic conditions",
      treatment: "Continue current medications",
      notes: "Patient doing well, no new concerns"
    }
  ]);

  const [programs, setPrograms] = useState<Program[]>([
    {
      id: "P001",
      name: "Diabetes Education Program",
      type: "Disease Management",
      startDate: "2019-04-01",
      status: "Active",
      provider: "Diabetes Center",
      goals: "Improve blood sugar control and lifestyle habits"
    }
  ]);

  const [forms, setForms] = useState<Form[]>([
    {
      id: "F001",
      title: "HIPAA Privacy Notice",
      type: "Consent",
      dateCompleted: "2024-01-01",
      completedBy: "John Doe",
      status: "Complete"
    }
  ]);

  const [observationForms, setObservationForms] = useState<ObservationForm[]>([
    {
      id: "O001",
      title: "Mental Health Screening",
      category: "Mental Health",
      dateObserved: "2024-01-15",
      observer: "Dr. Smith",
      findings: "No signs of depression or anxiety",
      severity: "Normal",
      actionRequired: false
    }
  ]);

  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([
    {
      id: "D001",
      code: "E11.9",
      description: "Type 2 diabetes mellitus without complications",
      type: "Primary",
      dateOfDiagnosis: "2019-03-15",
      diagnosedBy: "Dr. Smith",
      status: "Active",
      confidence: "Confirmed"
    }
  ]);

  const [treatments, setTreatments] = useState<Treatment[]>([
    {
      id: "T001",
      type: "Medication",
      description: "Metformin therapy for diabetes management",
      startDate: "2019-03-15",
      provider: "Dr. Smith",
      status: "Active",
      effectiveness: "Good",
      notes: "Patient tolerating well, good glucose control"
    }
  ]);

  const [labOrders, setLabOrders] = useState<LabOrderFulfillment[]>([
    {
      id: "LO001",
      orderNumber: "LAB-2024-001",
      testName: "Comprehensive Metabolic Panel",
      orderedBy: "Dr. Smith",
      dateOrdered: "2024-01-10",
      priority: "Routine",
      status: "Completed",
      sampleCollected: true,
      collectionDate: "2024-01-11",
      resultDate: "2024-01-12",
      notes: "Results reviewed with patient"
    }
  ]);

  // Form states for adding new data
  const [newVital, setNewVital] = useState({
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    weight: "",
    height: "",
    notes: ""
  });

  const [newAllergy, setNewAllergy] = useState({
    allergen: "",
    severity: "Mild" as "Mild" | "Moderate" | "Severe",
    reaction: ""
  });

  const [newHistory, setNewHistory] = useState({
    condition: "",
    dateOfDiagnosis: "",
    status: "Active" as "Active" | "Resolved" | "Chronic",
    notes: ""
  });

  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    frequency: "",
    prescribedBy: "",
    endDate: ""
  });

  const addVital = () => {
    if (newVital.bloodPressure || newVital.heartRate || newVital.temperature) {
      const vital: Vital = {
        id: `V${String(vitals.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0],
        ...newVital
      };
      setVitals([vital, ...vitals]);
      setNewVital({
        bloodPressure: "",
        heartRate: "",
        temperature: "",
        weight: "",
        height: "",
        notes: ""
      });
    }
  };

  const addAllergy = () => {
    if (newAllergy.allergen) {
      const allergy: Allergy = {
        id: `A${String(allergies.length + 1).padStart(3, '0')}`,
        dateReported: new Date().toISOString().split('T')[0],
        ...newAllergy
      };
      setAllergies([allergy, ...allergies]);
      setNewAllergy({
        allergen: "",
        severity: "Mild",
        reaction: ""
      });
    }
  };

  const addHistory = () => {
    if (newHistory.condition && newHistory.dateOfDiagnosis) {
      const history: MedicalHistory = {
        id: `H${String(medicalHistory.length + 1).padStart(3, '0')}`,
        ...newHistory
      };
      setMedicalHistory([history, ...medicalHistory]);
      setNewHistory({
        condition: "",
        dateOfDiagnosis: "",
        status: "Active",
        notes: ""
      });
    }
  };

  const addMedication = () => {
    if (newMedication.name && newMedication.dosage) {
      const medication: Medication = {
        id: `M${String(medications.length + 1).padStart(3, '0')}`,
        startDate: new Date().toISOString().split('T')[0],
        status: "Active",
        ...newMedication
      };
      setMedications([medication, ...medications]);
      setNewMedication({
        name: "",
        dosage: "",
        frequency: "",
        prescribedBy: "",
        endDate: ""
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-500/10 hover:bg-green-500/10 text-green-600 border-green-500/20">Active</Badge>;
      case "Critical":
        return <Badge className="bg-red-500/10 hover:bg-red-500/10 text-red-600 border-red-500/20">Critical</Badge>;
      case "Inactive":
        return <Badge className="bg-gray-500/10 hover:bg-gray-500/10 text-gray-600 border-gray-500/20">Inactive</Badge>;
      case "Chronic":
        return <Badge className="bg-orange-500/10 hover:bg-orange-500/10 text-orange-600 border-orange-500/20">Chronic</Badge>;
      case "Resolved":
        return <Badge className="bg-blue-500/10 hover:bg-blue-500/10 text-blue-600 border-blue-500/20">Resolved</Badge>;
      case "Completed":
        return <Badge className="bg-blue-500/10 hover:bg-blue-500/10 text-blue-600 border-blue-500/20">Completed</Badge>;
      case "Discontinued":
        return <Badge className="bg-gray-500/10 hover:bg-gray-500/10 text-gray-600 border-gray-500/20">Discontinued</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "Mild":
        return <Badge className="bg-yellow-500/10 hover:bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Mild</Badge>;
      case "Moderate":
        return <Badge className="bg-orange-500/10 hover:bg-orange-500/10 text-orange-600 border-orange-500/20">Moderate</Badge>;
      case "Severe":
        return <Badge className="bg-red-500/10 hover:bg-red-500/10 text-red-600 border-red-500/20">Severe</Badge>;
      default:
        return <Badge variant="default">{severity}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/patients")}
            className="border-primary/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients
          </Button>
          <div className="p-3 rounded-full bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">{patient.name}</h1>
            <p className="text-muted-foreground">Patient ID: {patient.id}</p>
          </div>
        </div>
        {getStatusBadge(patient.status)}
      </div>

      {/* Patient Overview */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Basic Information</Label>
                <div className="mt-2 space-y-2">
                  <p><span className="font-medium">Age:</span> {patient.age} years</p>
                  <p><span className="font-medium">Gender:</span> {patient.gender}</p>
                  <p><span className="font-medium">Blood Type:</span> {patient.bloodType}</p>
                  <p><span className="font-medium">Date of Birth:</span> {patient.dateOfBirth}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Contact Information</Label>
                <div className="mt-2 space-y-2">
                  <p><span className="font-medium">Phone:</span> {patient.phone}</p>
                  <p><span className="font-medium">Email:</span> {patient.email}</p>
                  <p><span className="font-medium">Emergency Contact:</span> {patient.emergencyContact}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                <div className="mt-2">
                  <p>{patient.address}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical Data Tabs */}
      <Tabs defaultValue="vitals" className="space-y-6">
        <div className="space-y-4">
          <TabsList className="grid w-full grid-cols-8 ">
            <TabsTrigger value="vitals" className="flex items-center gap-2 ">
              <Activity className="h-4 w-4" />
              Vitals
            </TabsTrigger>
            <TabsTrigger value="allergies" className="flex items-center gap-2 ">
              <AlertTriangle className="h-4 w-4" />
              Allergies
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 ">
              <FileText className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="medications" className="flex items-center gap-2 ">
              <Pill className="h-4 w-4" />
              Meds
            </TabsTrigger>
            <TabsTrigger value="conditions" className="flex items-center gap-2 ">
              <Stethoscope className="h-4 w-4" />
              Conditions
            </TabsTrigger>
            <TabsTrigger value="lab-results" className="flex items-center gap-2 ">
              <TestTube className="h-4 w-4" />
              Lab Results
            </TabsTrigger>
            <TabsTrigger value="visits" className="flex items-center gap-2 ">
              <Calendar className="h-4 w-4" />
              Visits
            </TabsTrigger>
            <TabsTrigger value="programs" className="flex items-center gap-2 ">
              <Heart className="h-4 w-4" />
              Programs
            </TabsTrigger>
            
          </TabsList>
          
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="forms" className="flex items-center gap-2 ">
              <Clipboard className="h-4 w-4" />
              Forms
            </TabsTrigger>
            <TabsTrigger value="observation-forms" className="flex items-center gap-2 ">
              <Eye className="h-4 w-4" />
              Observations
            </TabsTrigger>
            <TabsTrigger value="diagnosis" className="flex items-center gap-2 ">
              <Microscope className="h-4 w-4" />
              Diagnosis
            </TabsTrigger>
            <TabsTrigger value="treatments" className="flex items-center gap-2 ">
              <Thermometer className="h-4 w-4" />
              Treatments
            </TabsTrigger>
            <TabsTrigger value="lab-orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Lab Order Fulfillment
            </TabsTrigger>
          </TabsList>
          
          
        </div>

        {/* Vitals Tab */}
        <TabsContent value="vitals" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Add New Vitals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Blood Pressure</Label>
                  <Input
                    placeholder="120/80"
                    value={newVital.bloodPressure}
                    onChange={(e) => setNewVital({...newVital, bloodPressure: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Heart Rate (bpm)</Label>
                  <Input
                    placeholder="72"
                    value={newVital.heartRate}
                    onChange={(e) => setNewVital({...newVital, heartRate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Temperature (°F)</Label>
                  <Input
                    placeholder="98.6"
                    value={newVital.temperature}
                    onChange={(e) => setNewVital({...newVital, temperature: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Weight (lbs)</Label>
                  <Input
                    placeholder="175"
                    value={newVital.weight}
                    onChange={(e) => setNewVital({...newVital, weight: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Height</Label>
                  <Input
                    placeholder="5'10&quot;"
                    value={newVital.height}
                    onChange={(e) => setNewVital({...newVital, height: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Additional notes about the vitals..."
                  value={newVital.notes}
                  onChange={(e) => setNewVital({...newVital, notes: e.target.value})}
                />
              </div>
              <Button onClick={addVital} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Vitals
              </Button>
            </CardContent>
          </Card>

          {/* Vitals History */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Vitals History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {vitals.map((vital) => (
                <div key={vital.id} className="p-4 border border-primary/20 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-primary">{vital.date}</p>
                    <Badge variant="outline">#{vital.id}</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    {vital.bloodPressure && <p><span className="font-medium">BP:</span> {vital.bloodPressure}</p>}
                    {vital.heartRate && <p><span className="font-medium">HR:</span> {vital.heartRate} bpm</p>}
                    {vital.temperature && <p><span className="font-medium">Temp:</span> {vital.temperature}°F</p>}
                    {vital.weight && <p><span className="font-medium">Weight:</span> {vital.weight} lbs</p>}
                    {vital.height && <p><span className="font-medium">Height:</span> {vital.height}</p>}
                  </div>
                  {vital.notes && (
                    <p className="text-sm text-muted-foreground mt-2">{vital.notes}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Allergies Tab */}
        <TabsContent value="allergies" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Add New Allergy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Allergen</Label>
                  <Input
                    placeholder="Penicillin"
                    value={newAllergy.allergen}
                    onChange={(e) => setNewAllergy({...newAllergy, allergen: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select value={newAllergy.severity} onValueChange={(value: "Mild" | "Moderate" | "Severe") => setNewAllergy({...newAllergy, severity: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mild">Mild</SelectItem>
                      <SelectItem value="Moderate">Moderate</SelectItem>
                      <SelectItem value="Severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reaction</Label>
                  <Input
                    placeholder="Rash, difficulty breathing..."
                    value={newAllergy.reaction}
                    onChange={(e) => setNewAllergy({...newAllergy, reaction: e.target.value})}
                  />
                </div>
              </div>
              <Button onClick={addAllergy} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Allergy
              </Button>
            </CardContent>
          </Card>

          {/* Allergies List */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Known Allergies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {allergies.map((allergy) => (
                <div key={allergy.id} className="p-4 border border-primary/20 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-primary">{allergy.allergen}</h4>
                        {getSeverityBadge(allergy.severity)}
                      </div>
                      <p className="text-sm text-muted-foreground">Reaction: {allergy.reaction}</p>
                      <p className="text-xs text-muted-foreground">Reported: {allergy.dateReported}</p>
                    </div>
                    <Badge variant="outline">#{allergy.id}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Add Medical History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Condition</Label>
                  <Input
                    placeholder="Hypertension"
                    value={newHistory.condition}
                    onChange={(e) => setNewHistory({...newHistory, condition: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date of Diagnosis</Label>
                  <Input
                    type="date"
                    value={newHistory.dateOfDiagnosis}
                    onChange={(e) => setNewHistory({...newHistory, dateOfDiagnosis: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={newHistory.status} onValueChange={(value: "Active" | "Resolved" | "Chronic") => setNewHistory({...newHistory, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                      <SelectItem value="Chronic">Chronic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Additional notes about the condition..."
                  value={newHistory.notes}
                  onChange={(e) => setNewHistory({...newHistory, notes: e.target.value})}
                />
              </div>
              <Button onClick={addHistory} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add to History
              </Button>
            </CardContent>
          </Card>

          {/* Medical History List */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Medical History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {medicalHistory.map((history) => (
                <div key={history.id} className="p-4 border border-primary/20 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-primary">{history.condition}</h4>
                        {getStatusBadge(history.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">Diagnosed: {history.dateOfDiagnosis}</p>
                      {history.notes && <p className="text-sm text-muted-foreground">{history.notes}</p>}
                    </div>
                    <Badge variant="outline">#{history.id}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Add New Medication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Medication Name</Label>
                  <Input
                    placeholder="Lisinopril"
                    value={newMedication.name}
                    onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dosage</Label>
                  <Input
                    placeholder="10mg"
                    value={newMedication.dosage}
                    onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Input
                    placeholder="Once daily"
                    value={newMedication.frequency}
                    onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prescribed By</Label>
                  <Input
                    placeholder="Dr. Smith"
                    value={newMedication.prescribedBy}
                    onChange={(e) => setNewMedication({...newMedication, prescribedBy: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date (Optional)</Label>
                  <Input
                    type="date"
                    value={newMedication.endDate}
                    onChange={(e) => setNewMedication({...newMedication, endDate: e.target.value})}
                  />
                </div>
              </div>
              <Button onClick={addMedication} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Medication
              </Button>
            </CardContent>
          </Card>

          {/* Medications List */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Current & Past Medications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {medications.map((medication) => (
                <div key={medication.id} className="p-4 border border-primary/20 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-primary">{medication.name}</h4>
                        {getStatusBadge(medication.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <p><span className="font-medium">Dosage:</span> {medication.dosage}</p>
                        <p><span className="font-medium">Frequency:</span> {medication.frequency}</p>
                        <p><span className="font-medium">Prescribed by:</span> {medication.prescribedBy}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Started: {medication.startDate}
                        {medication.endDate && ` • Ended: ${medication.endDate}`}
                      </p>
                    </div>
                    <Badge variant="outline">#{medication.id}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conditions Tab */}
        <TabsContent value="conditions" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Patient Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {conditions.map((condition) => (
                <div key={condition.id} className="p-4 border border-primary/20 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-primary">{condition.name}</h4>
                        {getStatusBadge(condition.status)}
                        {getSeverityBadge(condition.severity)}
                      </div>
                      <p className="text-sm text-muted-foreground">Identified: {condition.dateIdentified}</p>
                      {condition.notes && <p className="text-sm text-muted-foreground">{condition.notes}</p>}
                    </div>
                    <Badge variant="outline">#{condition.id}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lab Results Tab */}
        <TabsContent value="lab-results" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Laboratory Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {labResults.map((result) => (
                <div key={result.id} className="p-4 border border-primary/20 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-primary">{result.testName}</h4>
                        {getStatusBadge(result.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <p><span className="font-medium">Value:</span> {result.value}</p>
                        <p><span className="font-medium">Normal Range:</span> {result.normalRange}</p>
                        <p><span className="font-medium">Ordered by:</span> {result.orderedBy}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Performed: {result.datePerformed}</p>
                      {result.notes && <p className="text-sm text-muted-foreground">{result.notes}</p>}
                    </div>
                    <Badge variant="outline">#{result.id}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visits Tab */}
        <TabsContent value="visits" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Patient Visits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {visits.map((visit) => (
                <div key={visit.id} className="p-4 border border-primary/20 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-primary">{visit.date}</h4>
                        <Badge className="bg-blue-500/10 hover:bg-blue-500/10 text-blue-600 border-blue-500/20">{visit.type}</Badge>
                      </div>
                      <p className="text-sm"><span className="font-medium">Provider:</span> {visit.provider}</p>
                      <p className="text-sm"><span className="font-medium">Chief Complaint:</span> {visit.chiefComplaint}</p>
                      <p className="text-sm"><span className="font-medium">Diagnosis:</span> {visit.diagnosis}</p>
                      <p className="text-sm"><span className="font-medium">Treatment:</span> {visit.treatment}</p>
                      {visit.notes && <p className="text-sm text-muted-foreground">{visit.notes}</p>}
                    </div>
                    <Badge variant="outline">#{visit.id}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Programs Tab */}
        <TabsContent value="programs" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Health Programs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {programs.map((program) => (
                <div key={program.id} className="p-4 border border-primary/20 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-primary">{program.name}</h4>
                        {getStatusBadge(program.status)}
                        <Badge className="bg-purple-500/10 hover:bg-purple-500/10 text-purple-600 border-purple-500/20">{program.type}</Badge>
                      </div>
                      <p className="text-sm"><span className="font-medium">Provider:</span> {program.provider}</p>
                      <p className="text-sm"><span className="font-medium">Started:</span> {program.startDate}</p>
                      {program.endDate && <p className="text-sm"><span className="font-medium">Ended:</span> {program.endDate}</p>}
                      <p className="text-sm text-muted-foreground">{program.goals}</p>
                    </div>
                    <Badge variant="outline">#{program.id}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forms Tab */}
        <TabsContent value="forms" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Clipboard className="h-5 w-5" />
                Patient Forms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {forms.map((form) => (
                <div key={form.id} className="p-4 border border-primary/20 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-primary">{form.title}</h4>
                        {getStatusBadge(form.status)}
                        <Badge className="bg-indigo-500/10 hover:bg-indigo-500/10 text-indigo-600 border-indigo-500/20">{form.type}</Badge>
                      </div>
                      <p className="text-sm"><span className="font-medium">Completed by:</span> {form.completedBy}</p>
                      <p className="text-xs text-muted-foreground">Date: {form.dateCompleted}</p>
                    </div>
                    <Badge variant="outline">#{form.id}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Observation Forms Tab */}
        <TabsContent value="observation-forms" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Observation Forms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {observationForms.map((observation) => (
                <div key={observation.id} className="p-4 border border-primary/20 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-primary">{observation.title}</h4>
                        {getSeverityBadge(observation.severity)}
                        <Badge className="bg-teal-500/10 hover:bg-teal-500/10 text-teal-600 border-teal-500/20">{observation.category}</Badge>
                        {observation.actionRequired && (
                          <Badge className="bg-red-500/10 hover:bg-red-500/10 text-red-600 border-red-500/20">Action Required</Badge>
                        )}
                      </div>
                      <p className="text-sm"><span className="font-medium">Observer:</span> {observation.observer}</p>
                      <p className="text-sm"><span className="font-medium">Findings:</span> {observation.findings}</p>
                      <p className="text-xs text-muted-foreground">Date: {observation.dateObserved}</p>
                    </div>
                    <Badge variant="outline">#{observation.id}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Diagnosis Tab */}
        <TabsContent value="diagnosis" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Microscope className="h-5 w-5" />
                Patient Diagnoses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {diagnoses.map((diagnosis) => (
                <div key={diagnosis.id} className="p-4 border border-primary/20 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-primary">{diagnosis.description}</h4>
                        {getStatusBadge(diagnosis.status)}
                        <Badge className="bg-cyan-500/10 hover:bg-cyan-500/10 text-cyan-600 border-cyan-500/20">{diagnosis.type}</Badge>
                        <Badge className="bg-amber-500/10 hover:bg-amber-500/10 text-amber-600 border-amber-500/20">{diagnosis.confidence}</Badge>
                      </div>
                      <p className="text-sm"><span className="font-medium">Code:</span> {diagnosis.code}</p>
                      <p className="text-sm"><span className="font-medium">Diagnosed by:</span> {diagnosis.diagnosedBy}</p>
                      <p className="text-xs text-muted-foreground">Date: {diagnosis.dateOfDiagnosis}</p>
                    </div>
                    <Badge variant="outline">#{diagnosis.id}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Treatments Tab */}
        <TabsContent value="treatments" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Thermometer className="h-5 w-5" />
                Patient Treatments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {treatments.map((treatment) => (
                <div key={treatment.id} className="p-4 border border-primary/20 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-primary">{treatment.description}</h4>
                        {getStatusBadge(treatment.status)}
                        <Badge className="bg-pink-500/10 hover:bg-pink-500/10 text-pink-600 border-pink-500/20">{treatment.type}</Badge>
                      </div>
                      <p className="text-sm"><span className="font-medium">Provider:</span> {treatment.provider}</p>
                      <p className="text-sm"><span className="font-medium">Effectiveness:</span> {treatment.effectiveness}</p>
                      <p className="text-sm"><span className="font-medium">Started:</span> {treatment.startDate}</p>
                      {treatment.endDate && <p className="text-sm"><span className="font-medium">Ended:</span> {treatment.endDate}</p>}
                      {treatment.notes && <p className="text-sm text-muted-foreground">{treatment.notes}</p>}
                    </div>
                    <Badge variant="outline">#{treatment.id}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lab Order Fulfillment Tab */}
        <TabsContent value="lab-orders" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Package className="h-5 w-5" />
                Lab Order Fulfillment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {labOrders.map((order) => (
                <div key={order.id} className="p-4 border border-primary/20 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-primary">{order.testName}</h4>
                        {getStatusBadge(order.status)}
                        <Badge className={`${
                          order.priority === 'STAT' ? 'bg-red-500/10 hover:bg-red-500/10 text-red-600 border-red-500/20' :
                          order.priority === 'Urgent' ? 'bg-orange-500/10 hover:bg-orange-500/10 text-orange-600 border-orange-500/20' :
                          'bg-blue-500/10 hover:bg-blue-500/10 text-blue-600 border-blue-500/20'
                        }`}>{order.priority}</Badge>
                      </div>
                      <p className="text-sm"><span className="font-medium">Order #:</span> {order.orderNumber}</p>
                      <p className="text-sm"><span className="font-medium">Ordered by:</span> {order.orderedBy}</p>
                      <p className="text-sm"><span className="font-medium">Date Ordered:</span> {order.dateOrdered}</p>
                      <p className="text-sm"><span className="font-medium">Sample Collected:</span> {order.sampleCollected ? 'Yes' : 'No'}</p>
                      {order.collectionDate && <p className="text-sm"><span className="font-medium">Collection Date:</span> {order.collectionDate}</p>}
                      {order.resultDate && <p className="text-sm"><span className="font-medium">Result Date:</span> {order.resultDate}</p>}
                      {order.notes && <p className="text-sm text-muted-foreground">{order.notes}</p>}
                    </div>
                    <Badge variant="outline">#{order.id}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientDetail;