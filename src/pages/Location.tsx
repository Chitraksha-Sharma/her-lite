import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, MapPin, Loader2 } from "lucide-react";
import AnimatedButton from "@/components/ui/AnimatedButton";
import { getLocations, Location } from "@/api/location";
import {getUser} from "@/api/user";
import { getProvider } from "@/api/provider";
import { useAuth } from "@/api/context/AuthContext";

const LocationSector = () => {
  const [location, setLocation] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Fetch locations when component mounts
  useEffect(() => {
    const fetchLocations = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await getLocations();

        if (response.success && response.data) {
          setLocations(response.data);
        } else {
          setError(response.error || "Failed to load locations");
          
          // If session expired, redirect to login
          if (response.error?.includes("Session expired")) {
            localStorage.removeItem("isAuthenticated");
            localStorage.removeItem("user");
            navigate("/login");
            return;
          }
        }
      } catch (err) {
        console.error("Error fetching locations:", err);
        setError("Unable to load locations. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, [navigate]);

  const { user, isAuthenticated } = useAuth();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!location) {
      setError("Please select a location to continue.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Find the selected location object
      const selectedLocation = locations.find(loc => loc.uuid === location);
      
      if (selectedLocation) {
        // Store both UUID and display name
        localStorage.setItem("currentLocation", JSON.stringify({
          uuid: selectedLocation.uuid,
          display: selectedLocation.display
        }));

      //fetch user info
      if (!user?.id) {
        throw new Error("No user ID found in auth state");
      }
      const userData = await getUser(user.id);

      //fetch provider info
      if (!userData?.person?.uuid) {
        throw new Error("No person UUID found in user data");
      }
      const providerData = await getProvider(userData.person.uuid); 

      // store both user and provider
      localStorage.setItem("currentUser", JSON.stringify(userData));
      localStorage.setItem("currentProvider", JSON.stringify(providerData));

        toast({
          title: 'Location selected',
          description: `Welcome to ${selectedLocation.display}`,
        });

        navigate("/dashboard");
      } else {
        setError("Selected location is invalid. Please try again.");
      }
    } catch (err) {
      console.error("Error selecting location:", err);
      setError("An error occurred while selecting location.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{
      backgroundImage: `url('/wallpaper-login.jpg')`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
    }}>
      <Card className="w-full max-w-md shadow-xl border-blue-200">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <MapPin className="h-12 w-12 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-primary">Select Location</CardTitle>
            <CardDescription className="text-gray-600">
              Choose your working location to continue
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center space-x-2 text-red-700 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
                {error.includes("Unable to load") && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="ml-auto text-blue-600 hover:text-blue-800 underline text-xs"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium text-gray-700">
                Select Location Sector
              </label>
              
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-gray-600">Loading locations...</span>
                </div>
              ) : (
                <Select 
                  value={location} 
                  onValueChange={setLocation}
                  disabled={isSubmitting || locations.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.length > 0 ? (
                      locations.map((loc) => (
                        <SelectItem key={loc.uuid} value={loc.uuid}>
                          {loc.display}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No locations available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            <AnimatedButton
              variant="primary"
              size="lg"
              type="submit"
              disabled={isLoading || isSubmitting || !location || locations.length === 0}
              text={isSubmitting ? "Selecting..." : "Continue"}
            />

            {locations.length > 0 && (
              <p className="text-xs text-gray-500 text-center">
                {locations.length} location{locations.length !== 1 ? 's' : ''} available
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationSector;