import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Users, 
  UserPlus, 
  Shield, 
  FileText,
  UserCheck,
  Calendar,
  Stethoscope,
  MapPin,
  Activity,
  Clock,
  Database,
  Settings
} from "lucide-react";
import CreateUser from './CreateUser';
import RolesPermissions from './RolesPermissions';
import ViewAllUsers from './ViewAllUsers';
// import <AuditLog></AuditLog>

// Define the structure for subtile data
interface SubTileData {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType; // Component to render when selected
}

// Define the structure for tile configuration
interface TileConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  subTiles: SubTileData[];
}

// Sample components for different subtiles (you'll replace these with actual components)

// const AuditLog: React.FC = () => (
//   <div className="space-y-6">
//     <h3 className="text-2xl font-semibold">Audit Log</h3>
//     <Card>
//       <CardContent className="p-6">
//         <p>Audit log table will go here...</p>
//         {/* Add your audit log component here */}
//       </CardContent>
//     </Card>
//   </div>
// );

// Configuration for all tiles and their subtiles
const tileConfigs: Record<string, TileConfig> = {
  users: {
    id: 'users',
    title: 'Users',
    description: 'Manage system users and permissions',
    icon: Users,
    subTiles: [
      {
        id: 'view-users',
        title: 'View All Users',
        description: 'Browse and search users',
        icon: Users,
        component: ViewAllUsers,
      },
      {
        id: 'create-user',
        title: 'Create User',
        description: 'Add new system user',
        icon: UserPlus,
        component: CreateUser,
      },
      {
        id: 'roles',
        title: 'Roles & Permissions',
        description: 'Manage access levels',
        icon: Shield,
        component: RolesPermissions,
      },
      // {
      //   id: 'audit',
      //   title: 'Audit Log',
      //   description: 'User activity history',
      //   icon: FileText,
      //   component: AuditLog,
      // },
    ],
  },
  patients: {
    id: 'patients',
    title: 'Patients',
    description: 'Patient records and information',
    icon: UserCheck,
    // color: 'bg-green-500',
    subTiles: [
      {
        id: 'view-patients',
        title: 'View All Patients',
        description: 'Browse patient records',
        icon: UserCheck,
        component: () => <div>Patient list component</div>,
      },
      {
        id: 'create-patient',
        title: 'Register Patient',
        description: 'Add new patient',
        icon: UserPlus,
        component: () => <div>Patient registration form</div>,
      },
      // Add more subtiles as needed
    ],
  },
  visits: {
    id: 'visits',
    title: 'visits',
    description: 'Patient records and information',
    icon: UserCheck,
    subTiles: [
      {
        id: 'manage visits',
        title: 'View All Patients',
        description: 'Browse patient records',
        icon: UserCheck,
        component: () => <div>Patient list component</div>,
      }
    ]
  }
  // Add more tile configurations as needed
};

// Main Tile Management Page Component
const TileManagementPage: React.FC = () => {
  const { tileId } = useParams<{ tileId: string }>();
  const navigate = useNavigate();
  const [activeSubTile, setActiveSubTile] = useState<string>('');

  // Get the current tile configuration
  const tileConfig = tileId ? tileConfigs[tileId] : null;

  // Set default active subtile when component mounts or tile changes
  React.useEffect(() => {
    if (tileConfig && tileConfig.subTiles.length > 0) {
      setActiveSubTile(tileConfig.subTiles[0].id);
    }
  }, [tileConfig]);

  if (!tileConfig) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600">Tile Not Found</h2>
          {/* <p className="text-muted-foreground mt-2">The requested tile does not exist.</p> */}
          <Button 
            onClick={() => navigate('/admin')} 
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
        </div>
      </div>
    );
  }

  // Get the active subtile component
  const activeSubTileData = tileConfig.subTiles.find(st => st.id === activeSubTile);
  const ActiveComponent = activeSubTileData?.component;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => navigate('/admin')} 
                variant="ghost" 
                size="sm"
                className="h-8"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${tileConfig.color || 'bg-primary/10'}`}>
                  <tileConfig.icon className={`h-6 w-6 ${tileConfig.color ? 'text-white' : 'text-primary'}`} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-primary">{tileConfig.title}</h1>
                  <p className="text-muted-foreground text-sm">{tileConfig.description}</p>
                </div>
              </div>
            </div>
            <Badge variant="outline">
              {tileConfig.subTiles.length} modules
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Fixed Navigation Sidebar */}
        <div className="w-80 bg-white border-r min-h-screen">
          <div className="p-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
              Modules
            </h3>
            <nav className="space-y-2">
              {tileConfig.subTiles.map((subTile) => (
                <button
                  key={subTile.id}
                  onClick={() => setActiveSubTile(subTile.id)}
                  className={`w-full flex items-center p-3 rounded-lg text-left transition-all group ${
                    activeSubTile === subTile.id
                      ? 'bg-primary text-white shadow-md'
                      : 'hover:bg-muted/50 hover:shadow-sm'
                  }`}
                >
                  <div className={`p-2 rounded-md mr-3 ${
                    activeSubTile === subTile.id
                      ? 'bg-white/20'
                      : 'bg-primary/10'
                  }`}>
                    <subTile.icon className={`h-4 w-4 ${
                      activeSubTile === subTile.id
                        ? 'text-white'
                        : 'text-primary'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      activeSubTile === subTile.id
                        ? 'text-white'
                        : 'text-gray-800'
                    }`}>
                      {subTile.title}
                    </h4>
                    <p className={`text-xs ${
                      activeSubTile === subTile.id
                        ? 'text-white/80'
                        : 'text-gray-500'
                    }`}>
                      {subTile.description}
                    </p>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6">
          {ActiveComponent ? (
            <ActiveComponent />
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-muted-foreground">
                Select a module to get started
              </h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TileManagementPage;