import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar, 
  TestTube, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  Activity
} from "lucide-react";

const Dashboard = () => {
  const stats = [
    { title: "Total Patients", value: "1,247", icon: Users, trend: "+12%" },
    { title: "Today's Appointments", value: "24", icon: Calendar, trend: "+3%" },
    { title: "Pending Lab Results", value: "8", icon: TestTube, trend: "-5%" },
    { title: "Active Cases", value: "156", icon: FileText, trend: "+8%" },
  ];

  const validVariants = [
    "success", "info", "default", "secondary", "destructive",
    "outline", "warning", "neutral", "light"
  ] as const;

  const getVariant = (severity: string): "destructive" | "warning" | "info" | "default" => {
      if (severity === "high") return "destructive";
      if (severity === "medium") return "warning";
      if (severity === "low") return "info";
      return "default";
    };

  type VariantType = typeof validVariants[number];

  const recentActivities = [
    { action: "New patient registered", patient: "John Doe", time: "2 mins ago", type: "success", variant: "success" },
    { action: "Lab result updated", patient: "Sarah Wilson", time: "15 mins ago", type: "info", variant: "info" },
    { action: "Appointment scheduled", patient: "Mike Johnson", time: "1 hour ago", type: "default", variant: "default" },
    { action: "Medical record updated", patient: "Emma Davis", time: "2 hours ago", type: "secondary", variant: "secondary" },
  ];

  const urgentAlerts = [
    { message: "Critical lab result for Patient ID: 1023", severity: "high" },
    { message: "Medication allergy alert for Sarah Wilson", severity: "medium" },
    { message: "Appointment reminder system down", severity: "low" },
  ];

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your medical center overview.</p>
        </div>
        <Button variant="animated" className="bg-primary hover:bg-primary/90">
          <Calendar className="mr-2 h-4 w-4" />
          Schedule Appointment
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-primary/20 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3" />
                <span className="text-green-600">{stat.trend}</span> from last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary">Quick Actions</CardTitle>
          <CardDescription>Frequently used functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="text-primary hover:text-secondary h-20 flex-col gap-2 border-primary/20 hover:bg-primary/5">
              <Users className="h-6 w-6" />
              Register Patient
            </Button>
            <Button variant="outline" className="text-primary hover:text-secondary h-20 flex-col gap-2 border-primary/20 hover:bg-primary/5">
              <Calendar className="h-6 w-6" />
              Schedule Visit
            </Button>
            <Button variant="outline" className="text-primary hover:text-secondary h-20 flex-col gap-2 border-primary/20 hover:bg-primary/5">
              <TestTube className="h-6 w-6" />
              Lab Orders
            </Button>
            <Button variant="outline" className="text-primary hover:text-secondary h-20 flex-col gap-2 border-primary/20 hover:bg-primary/5">
              <FileText className="h-6 w-6" />
              Medical Records
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Activity className="h-5 w-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>Latest updates and activities in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => {
                const variant: VariantType = validVariants.includes(activity.variant as VariantType)
                  ? (activity.variant as VariantType)
                  : "default";

                return (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">Patient: {activity.patient}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={variant}>{activity.type}</Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {activity.time}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      
    </div>
  );
};

export default Dashboard;