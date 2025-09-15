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
  CalendarPlus,
  Bolt,
  BookOpenText,
  IdCard,
  CircleEllipsis,
  FoldHorizontal,
  Stethoscope,
  MapPin,
  Activity,
  Clock,
  Database,
  Settings,
  LucideChevronsLeftRightEllipsis,
  Component
} from "lucide-react";
import RolesPermissions from './RolesPermissions';
import ViewAllUsers from './ViewAllUsers';
import Privileges from './Privileges';
import { Description } from '@radix-ui/react-toast';
// import <AuditLog></AuditLog>
import ManageVisitTypes from './ManageVisitType';
import ManageVisitAttributeType from './ManageVisitAttributeType';
import ConfigureVisits from './ConfigureVisits';
import ViewAllPatients from './ViewAllPatients';
import ManageIdentifierTypes from './ManageIdentifierTypes';
import ManagePatientIdentifierSources from './ManagePatientIdentifierSources';
import AutoGenerationConfiguration from './AutoGenerationConfiguration';
import ManagePerson from './ManagePerson';
import ManageRelationshipType from './ManageRelationshipType';
import ManagePersonAttributeType from './ManagePersonAttributeType';
import { title } from 'process';
import ManageProviders from './ManageProvider';
import ManageProviderAttributeTypes from './ManageProviderAttributeTypes';
import ManageEncounters from './ManageEncounters';
import ManageEncounterTypes from './ManageEncounterTypes';
import ManageEncounterRoles from './ManageEncounterRoles';

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
        id: 'roles',
        title: 'Roles & Permissions',
        description: 'Manage access levels',
        icon: Shield,
        component: RolesPermissions,
      },

      {
        id: 'privileges',
        title: 'Privileges',
        description: 'privileges management',
        icon: FileText,
        component: Privileges,
      }
    ],
  },
  patients: {
    id: 'patients',
    title: 'Patients',
    description: 'Patient records and information',
    icon: BookOpenText,
    subTiles: [
      {
        id: 'view-patients',
        title: 'View All Patients',
        description: 'Browse patient records',
        icon: UserCheck,
        component: ViewAllPatients,
      },
      {
        id: 'Manage-Identifier',
        title: 'Manage Identifier Types',
        description: 'Patient Identifier Type management',
        icon: IdCard,
        component: ManageIdentifierTypes,
      },
      {
        id: 'Manage-Patient-Identifier-Sources',
        title: 'Manage Patient Identifier Sources',
        description: 'id',
        icon: IdCard,
        component: ManagePatientIdentifierSources,
      },
      {
        id: 'Auto-Generation',
        title: 'Auto Generations Options',
        description: 'autotypes',
        icon: CircleEllipsis,
        component: AutoGenerationConfiguration,
      },
    ],
  },
  person: {
    id: 'person',
    title: 'person',
    description: 'person details',
    icon: Users,
    subTiles: [
      {
        id: 'manage-person',
        title: 'manage person',
        description: 'manage all details',
        icon: UserCheck,
        component: ManagePerson,
      },
      {
        id: 'manage-relationship-type',
        title: 'Manage Relationship Type',
        description: 'manage',
        icon: Database,
        component: ManageRelationshipType,
      },
      {
        id: 'manage-person-attribute-type',
        title: 'Manage Person Attribute Type',
        description: 'manage attributes of person',
        icon: FileText,
        component: ManagePersonAttributeType,
      }
    ],
  },
  visits: {
    id: 'visits',
    title: 'visits',
    description: 'Manage visit types and configurations',
    icon: Calendar,
    subTiles: [
      {
        id: 'manage visits',
        title: 'Manage Visit Types',
        description: 'Create and manage visit types',
        icon: CalendarPlus,
        component: ManageVisitTypes,
      },
      {
        id: 'visit-attributes',
        title: 'Manage Visit Attribute Type',
        description: 'Define custom attributes for visits',
        icon: CalendarPlus,
        component: ManageVisitAttributeType,
      },
      {
        id: 'configure-visits',
        title: 'Configure Visits',
        description: 'Configure visit behavior and automation',
        icon: Bolt,
        component: ConfigureVisits,
      }
    ],
  },
  providers: {
    id: 'providers',
    title: 'Providers',
    description: 'Healthcare provider management',
    icon: Shield,
    subTiles: [
      {
        id: 'manage-provider',
        title: 'Manage Providers',
        description: 'provider management',
        icon: UserCheck,
        component: ManageProviders,
      },
      {
        id: 'manage-provider-attributes',
        title: 'Manage Provider Attributes Types',
        description: 'provider attribute type management',
        icon: UserCheck,
        component: ManageProviderAttributeTypes,
      },
    ]
  },
  encounters: {
    id: 'encounters',
    title: 'encounters',
    description: 'Manage encounter types and roles',
    icon : FoldHorizontal,
    subTiles: [
      {
        id: 'manage-encounters',
        title: 'Manage Encounters',
        description: 'Encounter management',
        icon: UserCheck,
        component: ManageEncounters,
      },
      {
        id: 'manage-encounters-types',
        title: 'Manage Encounter Types',
        description: 'Encounter type management',
        icon: UserCheck,
        component: ManageEncounterTypes,
      },
      {
        id: 'manage-encounters-roles',
        title: 'Manage Encounter Roles',
        description: 'Encounter role management',
        icon: UserCheck,
        component: ManageEncounterRoles,
      },
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