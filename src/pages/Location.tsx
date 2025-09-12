// src/pages/Location.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, MapPin, Loader2 } from "lucide-react";
import AnimatedButton from "@/components/ui/AnimatedButton";
import { getLocations, Location } from "@/api/location";
import { getUser } from "@/api/user";
import { useAuth } from "@/api/context/AuthContext";
import { getProviders } from "@/api/provider";

const BASE_URL = "/curiomed/v1";

function getAuthHeaders() {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const LocationSector = () => { 
  const [location, setLocation] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Fetch locations when component mounts (only when authenticated)
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
          if (response.error?.includes("Session expired")) {
            localStorage.clear();
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

    if (isAuthenticated) {
      fetchLocations();
    }
  }, [isAuthenticated, navigate]);



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
      const selectedLocation = locations.find((loc) => loc.uuid === location);
  
      if (!selectedLocation) {
        setError("Selected location is invalid. Please try again.");
        setIsSubmitting(false);
        return;
      }
  
      // ✅ Save location
      localStorage.setItem(
        "currentLocation",
        JSON.stringify({ uuid: selectedLocation.uuid, display: selectedLocation.display })
      );
  
      // ✅ Validate user data
      if (!user) {
        setError("User session not found. Please log in again.");
        setIsSubmitting(false);
        localStorage.clear();
        navigate("/login");
        return;
      }

      if (!user.uuid) {
        setError("User information is invalid. Please log in again.");
        setIsSubmitting(false);
        localStorage.clear();
        navigate("/login");
        return;
      }
  
      // ✅ Ensure we have full user details (with person.uuid)
      let userData = user;
      console.log("Initial user ", userData);
      
      // Only fetch additional user data if person.uuid is missing
      if (!userData?.person?.uuid) {
        console.log("Fetching full user details for:", user.uuid);
        try {
          const userResp = await getUser(user.uuid, { forceReload: true });
          console.log("User API response:", userResp);
          
          if (userResp.success && userResp.data) {
            userData = userResp.data;
          } else {
            console.warn("Failed to fetch full user data, continuing with available data");
          }
        } catch (err) {
          console.warn("Error fetching full user ", err);
        }
      }
  
      // ✅ Fetch providers data
      let providerData = null;
      try {
        console.log("Fetching providers...");
        const providerResponse = await getProviders();
        console.log("Providers API response:", providerResponse);
        
        if (providerResponse.success && providerResponse.data) {
          providerData = providerResponse.data;
        } else {
          console.warn("Failed to fetch providers:", providerResponse.error);
        }
      } catch (err) {
        console.warn("Error fetching providers:", err);
      }

      // ✅ Also fetch specific provider if user has provider UUID
      let specificProviderData = null;
      const providerUuid = userData?.provider?.uuid;
      console.log("Specific Provider UUID:", providerUuid);

      if (providerUuid) {
        try {
          console.log("Fetching specific provider data...");
          const res = await fetch(`${BASE_URL}/provider/${providerUuid}`, {
            method: "GET",
            headers: {
              "Accept": "application/json",
              ...getAuthHeaders(),
            },
            cache: "no-store",
          });

          if (res.ok) {
            specificProviderData = await res.json();
            console.log("Specific provider data fetched successfully");
          } else {
            console.warn("Failed to fetch specific provider data:", res.status, res.statusText);
          }
        } catch (err) {
          console.warn("Error fetching specific provider:", err);
        }
      }
    
      // ✅ Save user + provider locally
      localStorage.setItem("currentUser", JSON.stringify(userData));
      if (specificProviderData) {
        localStorage.setItem("currentProvider", JSON.stringify(specificProviderData));
      } else if (providerData && providerData.length > 0) {
        // Fallback to first provider if specific provider not found
        localStorage.setItem("currentProvider", JSON.stringify(providerData[0]));
      }
  
      toast({
        title: "Location selected",
        description: `Welcome to ${selectedLocation.display}`,
      });
  
      // ✅ Navigate to dashboard
      console.log("Navigating to dashboard...");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error selecting location:", err);
      setError("An error occurred while selecting location: " + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };




  
  const handleRetry = () => {
    window.location.reload();
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url('/wallpaper-login.jpg')`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <Card className="w-full max-w-md sm:max-w-lg  shadow-xl border-blue-200">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <MapPin className="h-12 w-12 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-primary">Select Location</CardTitle>
            <CardDescription className="text-gray-600">Choose your working location to continue</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            {error && (
              <div className="flex items-center space-x-2 text-red-700 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
                {error.includes("Unable to load") && (
                  <button type="button" onClick={handleRetry} className="ml-auto text-blue-600 hover:text-blue-800 underline text-xs">
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
                <Select value={location} onValueChange={setLocation} disabled={isSubmitting || locations.length === 0}>
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
              className="w-full sm:w-1/2 mx-auto"
              disabled={isLoading || isSubmitting || !location || locations.length === 0}
              text={isSubmitting ? "Selecting..." : "Continue"}
            />

            {locations.length > 0 && (
              <p className="text-xs text-gray-500 text-center">
                {locations.length} location{locations.length !== 1 ? "s" : ""} available
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationSector;