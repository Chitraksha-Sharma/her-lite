import React from "react";
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

// Interface for admin tile data
interface AdminTileData {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  status?: 'active' | 'inactive' | 'pending';
  color?: string;
  actions?: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick: () => void;
  }[];
}

// Interface for admin tile props
interface AdminTileProps {
  data: AdminTileData;
  onClick?: () => void;
}

// Individual Admin Tile Component
const AdminTile: React.FC<AdminTileProps> = ({ data, onClick }) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

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
          {data.count !== undefined && (
            <Badge variant="secondary" className="text-xs">
              {data.count}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          {data.status && (
            <Badge className={`text-xs ${getStatusColor(data.status)}`}>
              {data.status}
            </Badge>
          )}
          
          {data.actions && data.actions.length > 0 ? (
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {data.actions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                  }}
                >
                  <action.icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          ) : (
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Admin Page Component
const Admin: React.FC = () => {
  // Admin tiles data - easily extensible
  const adminTiles: AdminTileData[] = [
    {
      id: 'users',
      title: 'Users',
      description: 'Manage system users and permissions',
      icon: Users,
      count: 45,
      status: 'active',
      color: 'bg-blue-500',
      actions: [
        { label: 'View', icon: Eye, onClick: () => console.log('View users') },
        { label: 'Add', icon: Plus, onClick: () => console.log('Add user') },
        { label: 'Edit', icon: Edit, onClick: () => console.log('Edit users') }
      ]
    },
    {
      id: 'patients',
      title: 'Patients',
      description: 'Patient records and information',
      icon: UserCheck,
      count: 1247,
      status: 'active',
      color: 'bg-green-500',
      actions: [
        { label: 'View', icon: Eye, onClick: () => console.log('View patients') },
        { label: 'Add', icon: Plus, onClick: () => console.log('Add patient') },
        { label: 'Edit', icon: Edit, onClick: () => console.log('Edit patients') }
      ]
    },
    {
      id: 'person',
      title: 'Person',
      description: 'Personnel and staff management',
      icon: UserPlus,
      count: 89,
      status: 'active',
      color: 'bg-purple-500',
      actions: [
        { label: 'View', icon: Eye, onClick: () => console.log('View personnel') },
        { label: 'Add', icon: Plus, onClick: () => console.log('Add person') },
        { label: 'Edit', icon: Edit, onClick: () => console.log('Edit personnel') }
      ]
    },
    {
      id: 'visits',
      title: 'Visits',
      description: 'Patient visit tracking and history',
      icon: Calendar,
      count: 342,
      status: 'active',
      color: 'bg-orange-500',
      actions: [
        { label: 'View', icon: Eye, onClick: () => console.log('View visits') },
        { label: 'Add', icon: Plus, onClick: () => console.log('Add visit') },
        { label: 'Edit', icon: Edit, onClick: () => console.log('Edit visits') }
      ]
    },
    {
      id: 'encounters',
      title: 'Encounters',
      description: 'Clinical encounters and interactions',
      icon: Stethoscope,
      count: 156,
      status: 'active',
      color: 'bg-red-500',
      actions: [
        { label: 'View', icon: Eye, onClick: () => console.log('View encounters') },
        { label: 'Add', icon: Plus, onClick: () => console.log('Add encounter') },
        { label: 'Edit', icon: Edit, onClick: () => console.log('Edit encounters') }
      ]
    },
    {
      id: 'providers',
      title: 'Providers',
      description: 'Healthcare provider management',
      icon: Shield,
      count: 23,
      status: 'active',
      color: 'bg-indigo-500',
      actions: [
        { label: 'View', icon: Eye, onClick: () => console.log('View providers') },
        { label: 'Add', icon: Plus, onClick: () => console.log('Add provider') },
        { label: 'Edit', icon: Edit, onClick: () => console.log('Edit providers') }
      ]
    },
    {
      id: 'locations',
      title: 'Locations',
      description: 'Facility and location management',
      icon: MapPin,
      count: 12,
      status: 'active',
      color: 'bg-teal-500',
      actions: [
        { label: 'View', icon: Eye, onClick: () => console.log('View locations') },
        { label: 'Add', icon: Plus, onClick: () => console.log('Add location') },
        { label: 'Edit', icon: Edit, onClick: () => console.log('Edit locations') }
      ]
    },
    {
      id: 'observations',
      title: 'Observations',
      description: 'Clinical observations and findings',
      icon: Activity,
      count: 892,
      status: 'active',
      color: 'bg-pink-500',
      actions: [
        { label: 'View', icon: Eye, onClick: () => console.log('View observations') },
        { label: 'Add', icon: Plus, onClick: () => console.log('Add observation') },
        { label: 'Edit', icon: Edit, onClick: () => console.log('Edit observations') }
      ]
    },
    {
      id: 'scheduler',
      title: 'Scheduler',
      description: 'Appointment and scheduling system',
      icon: Clock,
      count: 67,
      status: 'active',
      color: 'bg-cyan-500',
      actions: [
        { label: 'View', icon: Eye, onClick: () => console.log('View scheduler') },
        { label: 'Add', icon: Plus, onClick: () => console.log('Add schedule') },
        { label: 'Edit', icon: Edit, onClick: () => console.log('Edit schedules') }
      ]
    },
    {
      id: 'programs',
      title: 'Programs',
      description: 'Healthcare programs and initiatives',
      icon: FileText,
      count: 8,
      status: 'active',
      color: 'bg-amber-500',
      actions: [
        { label: 'View', icon: Eye, onClick: () => console.log('View programs') },
        { label: 'Add', icon: Plus, onClick: () => console.log('Add program') },
        { label: 'Edit', icon: Edit, onClick: () => console.log('Edit programs') }
      ]
    },
    {
      id: 'id-generation',
      title: 'ID Generation',
      description: 'Patient and entity ID management',
      icon: Database,
      count: 0,
      status: 'active',
      color: 'bg-slate-500',
      actions: [
        { label: 'View', icon: Eye, onClick: () => console.log('View ID generation') },
        { label: 'Add', icon: Plus, onClick: () => console.log('Generate ID') },
        { label: 'Edit', icon: Edit, onClick: () => console.log('Edit ID settings') }
      ]
    },
    {
      id: 'system-settings',
      title: 'System Settings',
      description: 'System configuration and preferences',
      icon: Settings,
      count: 0,
      status: 'active',
      color: 'bg-gray-500',
      actions: [
        { label: 'View', icon: Eye, onClick: () => console.log('View settings') },
        { label: 'Edit', icon: Edit, onClick: () => console.log('Edit settings') }
      ]
    }
  ];

  // Handle tile click
  const handleTileClick = (tileId: string) => {
    console.log(`Navigating to ${tileId} management`);
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
            System Admin
          </Badge>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-primary">45</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Patients</p>
                <p className="text-2xl font-bold text-primary">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Active Visits</p>
                <p className="text-2xl font-bold text-primary">342</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Providers</p>
                <p className="text-2xl font-bold text-primary">23</p>
              </div>
            </div>
          </CardContent>
        </Card>
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

      {/* Quick Actions */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary">Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="text-primary hover:text-secondary h-20 flex-col gap-2 border-primary/20 hover:bg-primary/5">
              <Users className="h-6 w-6" />
              Add User
            </Button>
            <Button variant="outline" className="text-primary hover:text-secondary h-20 flex-col gap-2 border-primary/20 hover:bg-primary/5">
              <UserCheck className="h-6 w-6" />
              Register Patient
            </Button>
            <Button variant="outline" className="text-primary hover:text-secondary h-20 flex-col gap-2 border-primary/20 hover:bg-primary/5">
              <Shield className="h-6 w-6" />
              Add Provider
            </Button>
            <Button variant="outline" className="text-primary hover:text-secondary h-20 flex-col gap-2 border-primary/20 hover:bg-primary/5">
              <Settings className="h-6 w-6" />
              System Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;