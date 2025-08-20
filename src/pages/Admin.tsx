import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  Calendar, 
  Stethoscope, 
  MapPin, 
  Activity, 
  Clock, 
  Settings, 
  Database,
  Plus,
  ArrowRight,
  Shield,
  FileText,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { useAuth } from "@/api/context/AuthContext";
import { useNavigate } from "react-router-dom";

// Interface for admin tile data
interface AdminTileData {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  // moduleCount?: number;
}


// Interface for admin tile props
interface AdminTileProps {
  data: AdminTileData;
  onClick?: () => void;
}

// Individual Admin Tile Component
const AdminTile: React.FC<AdminTileProps> = ({ data, onClick }) => {
  return (
    <Card 
      className="border-primary/20 hover:shadow-lg transition-all duration-200 cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${data.color || 'bg-primary/10'}`}>
              <data.icon className={`h-6 w-6 ${data.color ? 'text-white' : 'text-primary'}`} />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-primary group-hover:text-primary/80">
                {data.title}
              </CardTitle>
              <CardDescription className="text-sm">
                {data.description}
              </CardDescription>
            </div>
          </div>
          {/* {data.moduleCount && (
            <Badge variant="secondary" className="text-xs">
              {data.moduleCount} modules
            </Badge>
          )} */}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-end">
        {/* <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" /> */}
          
        </div>
      </CardContent>
    </Card>
  );
  };


  

// Admin Page Component
const Admin: React.FC = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  // const [openTileId, setOpenTileId] = useState<string | null>(null);
  // const toggleTile = (tileId: string) => {
  //   setOpenTileId(openTileId === tileId ? null : tileId);
  // };

  // Admin tiles data - easily extensible
  const adminTiles: AdminTileData[] = [
    {
      id: 'users',
      title: 'Users',
      description: 'Manage system users and permissions',
      icon: Users,
    },
    {
      id: 'patients',
      title: 'Patients',
      description: 'Patient records and information',
      icon: UserCheck,
    },
    {
      id: 'person',
      title: 'Person',
      description: 'Personnel and staff management',
      icon: UserPlus,
    },
    {
      id: 'visits',
      title: 'Visits',
      description: 'Patient visit tracking and history',
      icon: Calendar,     
    },
    {
      id: 'encounters',
      title: 'Encounters',
      description: 'Clinical encounters and interactions',
      icon: Stethoscope,
    },
    {
      id: 'providers',
      title: 'Providers',
      description: 'Healthcare provider management',
      icon: Shield,
    },
    {
      id: 'locations',
      title: 'Locations',
      description: 'Facility and location management',
      icon: MapPin,
    },
    {
      id: 'observations',
      title: 'Observations',
      description: 'Clinical observations and findings',
      icon: Activity,
    },
    {
      id: 'scheduler',
      title: 'Scheduler',
      description: 'Appointment and scheduling system',
      icon: Clock,
    },
    {
      id: 'programs',
      title: 'Programs',
      description: 'Healthcare programs and initiatives',
      icon: FileText,
    },
    {
      id: 'id-generation',
      title: 'ID Generation',
      description: 'Patient and entity ID management',
      icon: Database,
    },
    {
      id: 'system-settings',
      title: 'System Settings',
      description: 'System configuration and preferences',
      icon: Settings,
    }
  ];

  // Handle tile click
  const handleTileClick = (tileId: string) => {
    navigate(`/admin/${tileId}`);
    // if (adminTiles.find(t => t.id === tileId)?.subTiles) {
    //   // Don't navigate if it has subTiles — just expand
    //   return;
    // }
    //console.log(`Navigating to ${tileId} management`);
    // Here you can add navigation logic
    // navigate(`/admin/${tileId}`);
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Administration</h1>
          <p className="text-muted-foreground">
            Manage system settings, users, and healthcare data
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {session?.user?.display || 'Admin User'}
          </Badge>
          {/* {userRoles.map((role, index) => (
            <Badge key={index} variant="secondary" className="text-sm">
              {role}
            </Badge>
          ))} */}
        </div>
      </div>

      {/* Admin Tiles Grid */}
      <div>
        <h2 className="text-xl font-semibold text-primary mb-4">System Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {adminTiles.map((tile) => (
            <AdminTile
              key={tile.id}
              data={tile}
              onClick={() => handleTileClick(tile.id)}
            />
          ))}
        </div>
      </div>

    </div>
  );
};

export default Admin;