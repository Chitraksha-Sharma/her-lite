import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ScheduleAppointment from "./pages/ScheduleAppointment";
import PatientRegistration from "./pages/PatientRegistration";
import PatientList from "./pages/PatientList";
import Laboratory from "./pages/Laboratory";
import Pharmacy from "./pages/Pharmacy";
import Appointments from "./pages/Appointments";
import MedicalRecords from "./pages/MedicalRecords";
import PatientDetail from "./pages/PatientDetail";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";
import LocationSector from "./pages/Location";
import { AuthProvider } from "./api/context/AuthContext";
import Admin from "./pages/Admin";
import TileManagementPage from "./pages/TileManagementPage";
import EditIdentifierSource from "./pages/EditIdentifierSource";
import ManagePerson from "./pages/ManagePerson";
import DetailedPersonForm from "./pages/DetailedPersonForm";
import ManageRelationshipType from "./pages/ManageRelationshipType";
import ManageEncounters from "./pages/ManageEncounters";
import CreateEncounter from "./pages/CreateEncounter";
import PatientUpdate from "./pages/PatientUpdate";
import UpdatePerson from "./pages/UpdatePerson";
import AbhaWrapper from "./pages/AbhaWrapper";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/location" element={
            <ProtectedRoute>
                <LocationSector />
            </ProtectedRoute>
            } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/schedule-appointment" element={
            <ProtectedRoute>
              <MainLayout>
                <ScheduleAppointment />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/patient-registration" element={
            <ProtectedRoute>
              <MainLayout>
                <PatientRegistration />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/patients" element={
            <ProtectedRoute>
              <MainLayout>
                <PatientList />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/appointments" element={
            <ProtectedRoute>
              <MainLayout>
                <Appointments />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/medical-records" element={
            <ProtectedRoute>
              <MainLayout>
                <MedicalRecords />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/laboratory" element={
            <ProtectedRoute>
              <MainLayout>
                <Laboratory />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/pharmacy" element={
            <ProtectedRoute>
              <MainLayout>
                <Pharmacy />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/patient/:patientId" element={
            <ProtectedRoute>
              <MainLayout>
                <PatientDetail />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/patient/edit/:patientId" element={
            <ProtectedRoute>
              <MainLayout>
                <PatientUpdate />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/abha" element={
            <ProtectedRoute>
              <MainLayout>
                <AbhaWrapper />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute>
              <MainLayout>
                <Admin />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/:tileId" element={
            <ProtectedRoute>
              <MainLayout>
                <TileManagementPage />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/EditIdentifierSource/:uuid" element={
            <ProtectedRoute>
              <MainLayout>
                <EditIdentifierSource />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/manage-person" element={
            <ProtectedRoute>
              <MainLayout>
                <ManagePerson />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/create-person" element={
            <ProtectedRoute>
              <MainLayout>
              <DetailedPersonForm />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/update-person/:uuid" element={
            <ProtectedRoute>
              <MainLayout>
              <UpdatePerson />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/manage-relationship-type" element={
            <ProtectedRoute>
              <MainLayout>
              <ManageRelationshipType />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/manage-encounters" element={
            <ProtectedRoute>
              <MainLayout>
              <ManageEncounters />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/create-encounter" element={
            <ProtectedRoute>
              <MainLayout>
              <CreateEncounter />
              </MainLayout>
            </ProtectedRoute>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
