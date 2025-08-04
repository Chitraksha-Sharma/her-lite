import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import AnimatedButton from "@/components/ui/AnimatedButton"

const LocationSector = () => {
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const validLocations = ["General Ward", "Laboratory", "Pharmacy", "Radiology", "Emergency"];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (validLocations.includes(location)) {
        localStorage.setItem("currentLocation", location);
        toast({
            title: 'Location selected ',
            description: 'Welcome to Dashboard',
            });
        navigate("/dashboard");
    } else {
      setError("Location Not Found. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md shadow-xl border-blue-200">
        <CardHeader className="text-center space-y-4">
          <div>
            <CardTitle className="text-2xl font-bold text-primary">Select Location</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {error && (
              <div className="flex items-center space-x-2 text-red-700 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
            <Label htmlFor="location" className="text-sm font-medium text-gray-700 w-full flex">Select Location Sector</Label>
            <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {validLocations.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            <AnimatedButton
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              text="Continue"
            />
          </div>
          
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationSector;