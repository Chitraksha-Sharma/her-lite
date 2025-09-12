import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BASE_URL = import.meta.env.VITE_API_URL;

interface MainLayoutProps {
  children: React.ReactNode;
}

interface Location {
  uuid: string;
  display: string;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  // ✅ Get stored location from localStorage
  const getStoredLocation = () => {
    const stored = localStorage.getItem("selectedLocation");
    if (stored) return stored;

    const current = localStorage.getItem("currentLocation");
    if (current) {
      try {
        const parsed = JSON.parse(current);
        return parsed.uuid;
      } catch {
        return "";
      }
    }
    return "";
  };

  // ✅ Fetch locations with correct token
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const token = localStorage.getItem("authToken"); // 🔑 use same key
        if (!token) {
          console.warn("No auth token found");
          return;
        }

        const res = await fetch(`${BASE_URL}/v1/location?v=default`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error(`Failed to fetch locations: ${res.status}`);
        const data = await res.json();

        const locs = data?.results || [];
        setLocations(locs);

        // If no selected location yet, set stored one or first result
        const storedLoc = getStoredLocation();
        if (storedLoc) {
          setSelectedLocation(storedLoc);
        } else if (locs.length > 0) {
          setSelectedLocation(locs[0].uuid);
          localStorage.setItem("selectedLocation", locs[0].uuid);
        }
      } catch (err) {
        console.error("Error fetching locations:", err);
      }
    };

    fetchLocations();
  }, []);

  // ✅ Handle location change
  const handleLocationChange = (uuid: string) => {
    setSelectedLocation(uuid);
    localStorage.setItem("selectedLocation", uuid);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-primary/10 bg-primary px-4">
            <SidebarTrigger className="mr-4 text-white" />
            <div className="text-lg font-semibold text-white justify-end">HealthCare EHR</div>
            <div className="flex-1" />
            <Select value={selectedLocation} onValueChange={handleLocationChange}>
              <SelectTrigger className="w-60 bg-white text-black">
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.uuid} value={loc.uuid}>
                    {loc.display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </header>
          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
