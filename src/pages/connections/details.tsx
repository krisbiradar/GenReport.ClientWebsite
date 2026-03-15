import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/sidebar";
import { ArrowLeft, Database, HardDrive, Table, Users, Search, RefreshCw, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { showPopup } from "@/utils/helpers/popup-helper";
import ConnectionService, { DatabaseConnection } from "@/utils/services/connection-service";
import { container } from "@/utils/di/inversify.config";

export default function ConnectionDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [connection, setConnection] = useState<DatabaseConnection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // For this drill-down, we simulate fetching extended details for the specific ID.
  const loadDetails = async () => {
    setIsLoading(true);
    try {
      // In a real scenario, you'd fetch the specific ID details.
      // We will simulate retrieving the connection to populate the header.
      const service = container.get(ConnectionService);
      const res = await service.getConnections();
      
      let found: DatabaseConnection | undefined;
      // Extract from the response (same as the listing page fallback logic)
      if (res.successResponse?.data) {
        found = res.successResponse.data.find(c => c.id === id);
      } else if (!res.successResponse && res.errorResponse?.errorCode === "NO_RESPONSE") {
        const mockConnections = [
          { id: "1", name: "Production DB", databaseType: "PostgreSQL", hostName: "prod.db.internal", port: 5432, userName: "admin_report", databaseName: "genreport_prod" },
          { id: "2", name: "Staging Replica", databaseType: "MySQL", hostName: "stage.replica.net", port: 3306, userName: "stage_user", databaseName: "genreport_staging" }
        ];
        found = mockConnections.find(c => c.id === id);
      }

      if (found) {
        setConnection(found);
      } else {
        showPopup({ title: "Not Found", body: "Could not locate this database connection.", type: "error", onClose: () => navigate("/connections")});
      }
    } catch (e) {
      showPopup({ title: "Error", body: "Failed to load details.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  // Mock data for the detailed widgets
  const topTables = [
    { name: "users", rows: "142,593", size: "482 MB" },
    { name: "audit_logs", rows: "2,491,010", size: "3.2 GB" },
    { name: "transactions", rows: "849,201", size: "1.4 GB" },
    { name: "sessions", rows: "45,021", size: "90 MB" },
  ];

  const dbRoles = [
    { role: "genreport_admin", type: "Superuser", canLogin: true },
    { role: "readonly_analyst", type: "Standard", canLogin: true },
    { role: "replication_worker", type: "System", canLogin: false },
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  if (!connection) return null; // handled by the popup redirect

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      
      <main className="flex-1 overflow-y-auto w-full bg-muted/10 p-6 md:p-8">
        <div className="max-w-[1400px] mx-auto space-y-8 animate-fadeIn">
          
          {/* Header & Breadcrumbs */}
          <div className="flex flex-col gap-4">
            <Button variant="ghost" className="w-fit -ml-4 text-muted-foreground hover:text-foreground" onClick={() => navigate("/connections")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Connections
            </Button>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <Database className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{connection.name}</h1>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="font-mono uppercase px-2 py-0.5 bg-muted rounded-md">{connection.databaseType}</span>
                    <span>{connection.hostName}:{connection.port}</span>
                    <span className="flex items-center gap-1.5 ml-2 text-emerald-500">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      Healthy
                    </span>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" /> Sync Schema
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            
            {/* Database Size Widget */}
            <Card className="md:col-span-1 border-border/50 shadow-sm flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-muted-foreground" /> 
                  Storage Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center items-center py-6">
                <div className="relative flex items-center justify-center h-40 w-40 rounded-full border-[12px] border-primary/20">
                  <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="12" className="text-primary" strokeDasharray="276" strokeDashoffset="110" />
                  </svg>
                  <div className="flex flex-col items-center text-center space-y-1">
                    <span className="text-3xl font-bold tracking-tighter">5.2</span>
                    <span className="text-sm font-medium text-muted-foreground">TB Used</span>
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-2 w-full gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Size</p>
                    <p className="text-lg font-semibold mt-1">8.0 TB</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Free Space</p>
                    <p className="text-lg font-semibold mt-1">2.8 TB</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Tables Widget */}
            <Card className="md:col-span-2 border-border/50 shadow-sm flex flex-col">
              <CardHeader className="pb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Table className="h-5 w-5 text-muted-foreground" /> 
                    Top Tables
                  </CardTitle>
                  <CardDescription>Largest tables by physical storage footprint.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="hidden sm:flex text-muted-foreground">View all</Button>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <div className="divide-y divide-border/50">
                  <div className="grid grid-cols-12 px-6 py-3 text-xs font-medium text-muted-foreground bg-muted/30">
                    <div className="col-span-6 md:col-span-4">Table Name</div>
                    <div className="col-span-3 text-right hidden md:block">Row Count</div>
                    <div className="col-span-6 md:col-span-5 text-right">Size</div>
                  </div>
                  {topTables.map((table, i) => (
                    <div key={i} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-muted/10 transition-colors">
                      <div className="col-span-6 md:col-span-4 flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/70"></div>
                        <span className="font-medium text-sm">{table.name}</span>
                      </div>
                      <div className="col-span-3 text-right hidden md:block text-sm text-muted-foreground font-mono">
                        {table.rows}
                      </div>
                      <div className="col-span-6 md:col-span-5 flex items-center justify-end gap-4">
                        <span className="text-sm font-mono">{table.size}</span>
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden hidden sm:block">
                          <div className="bg-primary h-full" style={{ width: `${Math.max(10, 100 - (i*20))}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Guarded Identity & Roles Widget */}
            <Card className="md:col-span-3 lg:col-span-3 border-border/50 shadow-sm relative overflow-hidden">
              <CardHeader className="pb-4 border-b border-border/50 bg-muted/10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" /> 
                  Database Roles & Identity
                </CardTitle>
                <CardDescription>Accounts interacting with {connection.databaseName}. This is typically restricted.</CardDescription>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/50">
                  {dbRoles.map((role, i) => (
                    <div key={i} className="p-6 flex flex-col gap-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{role.role}</span>
                        {role.canLogin ? (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 flex items-center gap-1"><Key className="w-3 h-3"/> Active Login</span>
                        ) : (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Internal</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">Type: <span className="text-foreground">{role.type}</span></p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="bg-muted/10 p-4 border-t border-border/50 justify-center">
                 <Button variant="outline" size="sm" className="w-full sm:w-auto">Manage Credentials</Button>
              </CardFooter>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}
