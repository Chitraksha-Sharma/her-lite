import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Users,
  UserPlus,
  Calendar,
  FileText,
  TestTube,
  Pill,
  Activity,
  Settings,
  LogOut,
  Heart,
  UserCog,
  UserRoundCog
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

import { useAuth } from "../../api/context/AuthContext";


const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: Activity },
  { title: "Patient Registration", url: "/patient-registration", icon: UserPlus },
  { title: "Patient List", url: "/patients", icon: Users },
  { title: "Appointments", url: "/appointments", icon: Calendar },
  { title: "Medical Records", url: "/medical-records", icon: FileText },
  { title: "Laboratory", url: "/laboratory", icon: TestTube },
  { title: "Pharmacy", url: "/pharmacy", icon: Pill },
  { title: "Settings", url: "/settings", icon: Settings },
];

// Admin navigation item (will be conditionally added)
const adminItem = { title: "Admin", url: "/admin", icon: UserRoundCog };

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const { logout, isSystemDeveloperOrAdmin } = useAuth();


  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium " : "hover:bg-muted/50";

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login"; // force redirect to login
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-card border border-primary/10">
        {/* Header */}
        <div className="p-[7px] border-b border-primary/10">
          <div className="flex items-center gap-4">
            <div className=" rounded-lg ">
              <img src="/logo.png" alt="Logo" className="h-6 w-6" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-bold text-primary">HealthCare EHR</h2>
                <p className="text-xs text-muted-foreground">Medical System</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className="text-primary font-medium">
            {!collapsed ? "Navigation" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavCls}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Conditionally show Admin link */}
              {isSystemDeveloperOrAdmin() && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={adminItem.url} 
                      className={getNavCls}
                      title={collapsed ? adminItem.title : undefined}
                    >
                      <adminItem.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="ml-3">{adminItem.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout */}
        <div className="p-2 border-t-2 border-primary/10">
          <SidebarMenuButton onClick={handleLogout} className="w-full font-semibold text-primary hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="ml-3">Logout</span>}
          </SidebarMenuButton>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}