import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Database, Plus, Server, LayoutTemplate, Pencil } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ConnectionService, { DatabaseConnection } from "@/utils/services/connection-service";
import { container } from "@/utils/di/inversify.config";
import { ConnectionModal } from "@/components/connections/connection-modal";
import { showPopup } from "@/utils/helpers/popup-helper";
import { useNavigate } from "react-router-dom";

export default function ConnectionsPage() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<DatabaseConnection | null>(null);

  const connectionService = container.get(ConnectionService);

  const loadConnections = async () => {
    setIsLoading(true);
    try {
      const res = await connectionService.getConnections();
      if (res.successResponse?.data) {
        // If your API returns data directly inside res.data based on HttpResponse
        setConnections(res.successResponse.data);
      } else {
        // Fallback or Handle Error gracefully
        // For development/showcase purposes before API is built, setting mock data:
        if (!res.successResponse && res.errorResponse?.errorCode === "NO_RESPONSE") {
             setConnections([
               { id: "1", name: "Production DB", databaseType: "PostgreSQL", hostName: "prod.db.internal", port: 5432, userName: "admin_report", databaseName: "genreport_prod" },
               { id: "2", name: "Staging Replica", databaseType: "MySQL", hostName: "stage.replica.net", port: 3306, userName: "stage_user", databaseName: "genreport_staging" }
             ]);
        }
      }
    } catch (e) {
      showPopup({ title: "Error", body: "Failed to load database connections.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
  }, []);

  const handleCreateNew = () => {
    setEditingConnection(null);
    setIsModalOpen(true);
  };

  const handleEdit = (conn: DatabaseConnection) => {
    setEditingConnection(conn);
    setIsModalOpen(true);
  };

  const handleModalClose = (wasSaved: boolean) => {
    setIsModalOpen(false);
    if (wasSaved) {
      loadConnections(); // Refresh list if a connection was added/edited
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      
      <main className="flex-1 overflow-y-auto w-full bg-muted/10">
        <div className="container p-6 md:p-8 space-y-8 animate-fadeIn max-w-[1400px] mx-auto">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Database Connections</h1>
              <p className="text-muted-foreground">
                Manage your connected databases and data sources for reporting.
              </p>
            </div>
            <Button onClick={handleCreateNew} className="gap-2">
              <Plus className="h-4 w-4" /> Add Connection
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : connections.length === 0 ? (
             <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                <Database className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-medium">No Connections Found</h3>
                <p className="text-muted-foreground mt-2 max-w-sm">
                  You haven't configured any database connections yet. Add one to start generating reports.
                </p>
                <Button onClick={handleCreateNew} variant="outline" className="mt-6 gap-2">
                  <Plus className="h-4 w-4" /> Add your first connection
                </Button>
             </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {connections.map((conn) => (
                <Card key={conn.id} className="group flex flex-col hover:shadow-md transition-all border-border/50 bg-card">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                          <Database className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{conn.name}</CardTitle>
                          <CardDescription className="mt-1 font-mono text-xs uppercase tracking-wider">
                            {conn.databaseType}
                          </CardDescription>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(conn)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 pb-4">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Server className="h-4 w-4 shrink-0" />
                        <span className="truncate">{conn.hostName}:{conn.port}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <LayoutTemplate className="h-4 w-4 shrink-0" />
                        <span className="truncate">{conn.databaseName}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t border-border/40 bg-muted/20 flex flex-col gap-3">
                    <div className="text-xs text-muted-foreground flex items-center justify-between w-full">
                      <span>User: {conn.userName}</span>
                      <span className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Connected
                      </span>
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="w-full"
                      onClick={() => navigate(`/connections/${conn.id}`)}
                    >
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

        </div>
      </main>
      
      {isModalOpen && (
        <ConnectionModal 
          connection={editingConnection} 
          onClose={handleModalClose} 
        />
      )}
    </div>
  );
}
