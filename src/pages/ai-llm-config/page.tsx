import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Bot, Brain, Cpu, Sparkles, Plus, Pencil, Star } from "lucide-react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AiConnectionService, { AiConnection } from "@/utils/services/ai-connection-service";
import { container } from "@/utils/di/inversify.config";
import { showPopup } from "@/utils/helpers/popup-helper";
import { AiConnectionModal } from "@/components/ai/ai-connection-modal";

// Map provider string → Lucide icon
function ProviderIcon({ provider }: { provider: string }) {
  const p = provider?.toLowerCase() ?? "";
  if (p.includes("anthropic"))  return <Cpu className="h-5 w-5" />;
  if (p.includes("gemini"))     return <Sparkles className="h-5 w-5" />;
  if (p.includes("ollama"))     return <Bot className="h-5 w-5" />;
  return <Brain className="h-5 w-5" />; // OpenAI / default
}

export default function AiLlmConfigPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [connections, setConnections] = useState<AiConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<AiConnection | null>(null);


  const aiService = container.get(AiConnectionService);

  const loadConnections = async () => {
    setIsLoading(true);
    try {
      const res = await aiService.getConnections();
      if (res.successResponse?.data) {
        setConnections(res.successResponse.data);
      } else {
        setConnections([]);
      }
    } catch {
      showPopup({ title: "Error", body: "Failed to load AI providers.", type: "error" });
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

  const handleEdit = (conn: AiConnection) => {
    setEditingConnection(conn);
    setIsModalOpen(true);
  };

  const handleModalClose = (wasSaved: boolean) => {
    setIsModalOpen(false);
    if (wasSaved) loadConnections();
  };


  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      <main className="flex-1 overflow-y-auto w-full bg-muted/10">
        <div className="container p-6 md:p-8 space-y-8 animate-fadeIn max-w-[1400px] mx-auto">

          {/* ── Page Header ──────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">AI &amp; LLM Configuration</h1>
                <p className="text-muted-foreground text-sm mt-0.5">
                  Manage model providers, API keys, and runtime defaults.
                </p>
              </div>
            </div>
            <Button onClick={handleCreateNew} className="gap-2 shrink-0">
              <Plus className="h-4 w-4" /> Add Provider
            </Button>
          </div>

          {/* ── Body ─────────────────────────────────────────────────── */}
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : connections.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
              <Brain className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-medium">No AI Providers Configured</h3>
              <p className="text-muted-foreground mt-2 max-w-sm">
                You haven't connected any AI providers yet. Add one to start using AI-powered features.
              </p>
              <Button onClick={handleCreateNew} variant="outline" className="mt-6 gap-2">
                <Plus className="h-4 w-4" /> Add your first provider
              </Button>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {connections.map((conn) => (
                <Card
                  key={conn.id}
                  className="group flex flex-col hover:shadow-md transition-all border-border/50 bg-card"
                >
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                          <ProviderIcon provider={conn.provider} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{conn.provider}</CardTitle>
                            {conn.isDefault && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider">
                                <Star className="h-3 w-3 fill-primary" />
                                Default
                              </span>
                            )}
                          </div>
                          <CardDescription className="mt-1 font-mono text-xs uppercase tracking-wider">
                            {conn.defaultModel}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(conn)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Edit provider"
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </CardHeader>

                  {/* Model badge + chips */}
                  <div className="px-6 pb-4 flex flex-col gap-2">
                    <span className="inline-flex items-center self-start rounded-md bg-secondary text-secondary-foreground text-xs font-medium px-2 py-0.5">
                      {conn.defaultModel}
                    </span>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                      <span>🌡️ {conn.temperature ?? "default"}</span>
                      <span>⬆ {conn.maxTokens != null ? `${conn.maxTokens} tokens` : "∞ tokens"}</span>
                    </div>
                  </div>

                  <CardFooter className="pt-4 border-t border-border/40 bg-muted/20 flex flex-col gap-3 mt-auto">
                    <div className="text-xs text-muted-foreground flex items-center justify-between w-full">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </span>
                      <span className="flex items-center gap-1.5">
                        {conn.isActive ? (
                          <>
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                            Active
                          </>
                        ) : (
                          <>
                            <span className="relative flex h-2 w-2">
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-muted-foreground/40" />
                            </span>
                            Inactive
                          </>
                        )}
                      </span>
                    </div>

                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

        </div>
      </main>

      {/* ── Modals / Sheets ────────────────────────────────────────── */}
      {isModalOpen && (
        <AiConnectionModal
          connection={editingConnection}
          onClose={handleModalClose}
        />
      )}


    </div>
  );
}
