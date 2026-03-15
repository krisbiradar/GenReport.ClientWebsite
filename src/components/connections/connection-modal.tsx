import React, { useState, useEffect } from "react";
import { DatabaseConnection, CreateDatabaseConnectionRequest } from "@/utils/services/connection-service";
import ConnectionService from "@/utils/services/connection-service";
import { container } from "@/utils/di/inversify.config";
import { showPopup } from "@/utils/helpers/popup-helper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface ConnectionModalProps {
  connection: DatabaseConnection | null;
  onClose: (wasSaved: boolean) => void;
}

export function ConnectionModal({ connection, onClose }: ConnectionModalProps) {
  const isEditing = !!connection;
  const connectionService = container.get(ConnectionService);

  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [extraParams, setExtraParams] = useState("");
  const [formData, setFormData] = useState<CreateDatabaseConnectionRequest>({
    name: connection?.name || "",
    alias: connection?.alias || "",
    databaseType: connection?.databaseType || "PostgreSQL",
    hostName: connection?.hostName || "",
    port: connection?.port || 5432,
    userName: connection?.userName || "",
    databaseName: connection?.databaseName || "",
    password: "", // Always empty initially for security, even when editing
    connectionString: connection?.connectionString || "",
  });

  useEffect(() => {
    let str = "";
    const { databaseType, hostName, port, databaseName, userName, password } = formData;
    const pwdStr = password ? password : "";

    if (databaseType === "PostgreSQL") {
      str = `Server=${hostName};Port=${port};Database=${databaseName};User Id=${userName};Password=${pwdStr};`;
    } else if (databaseType === "MySQL") {
      str = `Server=${hostName};Port=${port};Database=${databaseName};Uid=${userName};Pwd=${pwdStr};`;
    } else if (databaseType === "SQLServer") {
      str = `Server=${hostName},${port};Database=${databaseName};User Id=${userName};Password=${pwdStr};`;
    } else if (databaseType === "MongoDB") {
      const authPart = (userName || pwdStr) ? `${userName}:${pwdStr}@` : "";
      str = `mongodb://${authPart}${hostName}:${port}/${databaseName}`;
    }

    if (extraParams) {
      if (databaseType === "MongoDB") {
        str += str.includes("?") ? `&${extraParams}` : `?${extraParams}`;
      } else {
        str += str.endsWith(";") ? extraParams : `;${extraParams}`;
      }
    }

    setFormData(prev => ({ ...prev, connectionString: str }));
  }, [formData.databaseType, formData.hostName, formData.port, formData.databaseName, formData.userName, formData.password, extraParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "port" ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let res;
      if (isEditing && connection.id) {
        res = await connectionService.updateConnection(connection.id, formData);
      } else {
        res = await connectionService.createConnection(formData);
      }

      // If backend exists and responds success
      if ((res as any).successResponse) {
        showPopup({
          title: "Success",
          body: `Connection ${isEditing ? "updated" : "created"} successfully.`,
          type: "success"
        });
        onClose(true);
      } else {
        // Fallback for demo/dev if backend NO_RESPONSE
        if ((res as any).errorResponse?.errorCode === "NO_RESPONSE") {
          showPopup({
            title: "Simulated Success (Dev)",
            body: `Connection ${isEditing ? "updated" : "created"} locally! Real API not yet connected.`,
            type: "success"
          });
          onClose(true);
        } else {
          showPopup({
            title: "Error",
            body: (res as any).errorResponse?.message || "Failed to save connection.",
            type: "error"
          });
        }
      }
    } catch (err) {
      showPopup({
        title: "Error",
        body: "A network error occurred while saving.",
        type: "error"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    // Basic frontend validation before testing
    if (!formData.hostName || !formData.port || !formData.userName || !formData.databaseName) {
      showPopup({
        title: "Missing Fields",
        body: "Please fill in Host, Port, Database Name, and Username before testing.",
        type: "error"
      });
      return;
    }

    setIsTesting(true);
    try {
      const res = await connectionService.testConnection(formData);

      if ((res as any).successResponse) {
        showPopup({
          title: "Connection Successful",
          body: "Successfully connected to the database!",
          type: "success"
        });
      } else {
        if ((res as any).errorResponse?.errorCode === "NO_RESPONSE") {
          showPopup({
            title: "Simulated Test (Dev)",
            body: "Ping simulated locally! Real API not yet connected.",
            type: "success"
          });
        } else {
          showPopup({
            title: "Connection Failed",
            body: (res as any).errorResponse?.message || "Could not connect to the database.",
            type: "error"
          });
        }
      }
    } catch (err) {
      showPopup({
        title: "Error",
        body: "A network error occurred while testing the connection.",
        type: "error"
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-card rounded-xl shadow-2xl border border-border/50 overflow-hidden animate-in zoom-in-95 duration-200">

        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/10">
          <h2 className="text-xl font-semibold">
            {isEditing ? "Edit Connection" : "Add New Connection"}
          </h2>
          <Button variant="ghost" size="icon" onClick={() => onClose(false)} className="h-8 w-8 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-4">

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="name">Connection Name</Label>
                <Input
                  id="name" name="name"
                  placeholder="e.g. Production Database"
                  value={formData.name} onChange={handleChange} required
                />
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="alias">Alias</Label>
                <Input
                  id="alias" name="alias"
                  placeholder="e.g. prod_db"
                  value={formData.alias} onChange={handleChange} required
                />
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="databaseType">Database Type</Label>
                <select
                  id="databaseType" name="databaseType"
                  value={formData.databaseType} onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="PostgreSQL">PostgreSQL</option>
                  <option value="MySQL">MySQL</option>
                  <option value="SQLServer">SQL Server</option>
                  <option value="MongoDB">MongoDB</option>
                </select>
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="databaseName">Database Name</Label>
                <Input
                  id="databaseName" name="databaseName"
                  placeholder="e.g. genreport_db"
                  value={formData.databaseName} onChange={handleChange} required
                />
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="hostName">Host / IP</Label>
                <Input
                  id="hostName" name="hostName"
                  placeholder="localhost or 192.x.x.x"
                  value={formData.hostName} onChange={handleChange} required
                />
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port" name="port" type="number"
                  value={formData.port} onChange={handleChange} required
                />
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="userName">Username</Label>
                <Input
                  id="userName" name="userName"
                  placeholder="db_admin"
                  value={formData.userName} onChange={handleChange} required
                />
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password" name="password" type="password"
                  placeholder={isEditing ? "(Leave blank to keep existing)" : "••••••••"}
                  value={formData.password} onChange={handleChange}
                  required={!isEditing}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="extraParams">Extra Parameters</Label>
                <Input
                  id="extraParams" name="extraParams"
                  placeholder={formData.databaseType === "MongoDB" ? "e.g. authSource=admin&retryWrites=true" : "e.g. Timeout=30;Encrypt=True;"}
                  value={extraParams} onChange={(e) => setExtraParams(e.target.value)}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="connectionString">Preview Connection String</Label>
                <Input
                  id="connectionString" name="connectionString"
                  value={formData.connectionString} readOnly
                  className="bg-muted font-mono text-xs text-muted-foreground"
                />
              </div>
            </div>

          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-6">
            <Button type="button" variant="secondary" onClick={handleTestConnection} disabled={isTesting || isSaving}>
              {isTesting ? "Testing..." : "Test Connection"}
            </Button>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={() => onClose(false)} disabled={isSaving || isTesting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || isTesting}>
                {isSaving ? "Saving..." : "Save Connection"}
              </Button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
