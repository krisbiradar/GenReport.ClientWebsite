import React, { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { ActionHistory } from "@/components/dashboard/action-history";
import { RecentReports } from "@/components/dashboard/recent-reports";
import { Activity, Users, ShieldAlert, Cpu } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AuthState } from "@/state-management/slices/auth-slice";

export default function HomePage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isAuthenticated = useSelector((state: { auth: AuthState }) => state.auth.isAuthenticated);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      
      <main className="flex-1 overflow-y-auto w-full bg-muted/10">
        <div className="container p-6 md:p-8 space-y-8 animate-fadeIn max-w-[1400px] mx-auto">
          
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back to GenReport Admin. Here's what's happening today.
            </p>
          </div>

          {/* KPI Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/40 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <Activity className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,284</div>
                <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
              </CardContent>
            </Card>
            
            <Card className="border-border/40 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">342</div>
                <p className="text-xs text-muted-foreground mt-1">+4% from last week</p>
              </CardContent>
            </Card>

            <Card className="border-border/40 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
                <ShieldAlert className="w-4 h-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">3</div>
                <p className="text-xs mt-1 text-red-500/80">Requires immediate attention</p>
              </CardContent>
            </Card>

            <Card className="border-border/40 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">System Load</CardTitle>
                <Cpu className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24%</div>
                <p className="text-xs text-muted-foreground mt-1">Normal operating levels</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 md:grid-cols-12 min-h-[400px]">
            {/* Action History takes 4 columns */}
            <div className="md:col-span-12 lg:col-span-4" id="history">
              <ActionHistory />
            </div>
            
            {/* Recent Reports takes 8 columns */}
            <div className="md:col-span-12 lg:col-span-8" id="reports">
              <RecentReports />
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
