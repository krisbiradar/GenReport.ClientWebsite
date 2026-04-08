import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ChatMessage, SqlValidationStatus, SQL_LANGUAGES, getTextContent } from "@/components/chat/chat-message";
import { ChatInput, UploadedFileData } from "@/components/chat/chat-input";
import { container } from "@/utils/di/inversify.config";
import AiModelService, { AiModel } from "@/utils/services/ai-model-service";
import AiConnectionService, { AiConnection } from "@/utils/services/ai-connection-service";
import ChatService from "@/utils/services/chat-service";
import ConnectionService, { DatabaseConnection } from "@/utils/services/connection-service";
import { getJwt } from "@/utils/helpers/window-helpers";
import { showPopup } from "@/utils/helpers/popup-helper";
import { useSelector } from "react-redux";
import { AuthState } from "@/state-management/slices/auth-slice";
import { Button } from "@/components/ui/button";
import { Database, Cpu } from "lucide-react";
import type { QueryResultState } from "@/components/chat/query-result";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // All models fetched from the server (all providers)
  const [allModels, setAllModels] = useState<AiModel[]>([]);
  const [models, setModels] = useState<AiModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(true);

  const [providers, setProviders] = useState<AiConnection[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [isLoadingProviders, setIsLoadingProviders] = useState<boolean>(true);

  const [databases, setDatabases] = useState<DatabaseConnection[]>([]);
  const [selectedDbId, setSelectedDbId] = useState<string>("");
  const [isLoadingDbs, setIsLoadingDbs] = useState<boolean>(true);

  const [sessionId, setSessionId] = useState<string | null>(id || null);
  const [isSessionLoading, setIsSessionLoading] = useState<boolean>(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const aiModelService = container.get(AiModelService);
  const aiConnectionService = container.get(AiConnectionService);
  const connectionService = container.get(ConnectionService);
  const chatService = container.get(ChatService);
  const firstName = useSelector((state: { auth: AuthState }) => state.auth.firstName);

  const sessionIdRef = useRef<string | null>(sessionId);
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  const selectedModelIdRef = useRef<string>(selectedModelId);
  useEffect(() => {
    selectedModelIdRef.current = selectedModelId;
  }, [selectedModelId]);

  const selectedDbIdRef = useRef<string>(selectedDbId);
  useEffect(() => {
    selectedDbIdRef.current = selectedDbId;
  }, [selectedDbId]);

  const { messages, setMessages, sendMessage, status, stop } = useChat({
    onError: (err) => {
      if (err.message && (err.message.includes("ERR_CONTEXT_WINDOW_EXCEEDED") || err.message.includes("Context Window Exceeded"))) {
        showPopup({
          title: "Context Window Exceeded",
          body: (
            <div className="space-y-3">
              <p className="text-[15px]">The conversation has grown too long for the AI model to process. Please start a new chat to continue.</p>
              <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md border mt-2">
                <strong>Note:</strong> Administrators can configure the maximum context window size limits in the AI connection settings.
              </p>
            </div>
          ),
          type: "warning",
          actionText: "New Chat",
          onAction: () => {
            navigate("/chat");
            setSessionId(null);
            setMessages([]);
          },
          closeText: "Dismiss"
        });
      }
    },
    transport: new DefaultChatTransport({
      api: `${BASE_URL}/chat/sessions/messages`,
      headers: async (): Promise<Record<string, string>> => {
        const token = await getJwt();
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
      body: () => ({
        modelId: selectedModelIdRef.current,
        ...(selectedDbIdRef.current ? { databaseConnectionId: selectedDbIdRef.current } : {}),
        ...(sessionIdRef.current ? { sessionId: sessionIdRef.current } : {}),
      }),
    }),
  });

  useEffect(() => {
    if (id) {
      setSessionId(id);
      setIsSessionLoading(true);
      
      chatService.getSession(id)
        .then((res: any) => {
          const session = res?.successResponse?.data ?? res;
          if (session && session.messages) {
             const mappedMessages: UIMessage[] = session.messages.map((m: any) => ({
                id: m.id || crypto.randomUUID(),
                role: m.role || "assistant",
                content: m.content || "",
                createdAt: m.createdAt ? new Date(m.createdAt) : new Date()
             }));
             setMessages(mappedMessages);
          }
        })
        .catch(err => {
          console.error("Failed to load session:", err);
        })
        .finally(() => {
          setIsSessionLoading(false);
        });
    } else {
      setSessionId(null);
      setMessages([]);
    }
  }, [id, chatService, setMessages]);

  const isGenerating = status === "submitted" || status === "streaming";

  // ── SQL validation on response completion ─────────────────────────────────
  // Map: messageId -> Map<sqlCode, validationStatus>
  const [sqlValidations, setSqlValidations] = useState<Map<string, Map<string, SqlValidationStatus>>>(new Map());
  const prevStatusRef = useRef<string>(status);

  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;

    // Detect transition: streaming/submitted → ready (response just completed)
    if (status === "ready" && (prev === "streaming" || prev === "submitted")) {
      // Find the last assistant message
      const lastAssistantMsg = [...messages].reverse().find((m) => m.role === "assistant");
      if (!lastAssistantMsg) return;

      const dbId = selectedDbIdRef.current;
      if (!dbId) return;

      const content = getTextContent(lastAssistantMsg);

      // Extract all SQL code blocks from the markdown
      const sqlLangsPattern = Array.from(SQL_LANGUAGES).join("|");
      const codeBlockRegex = new RegExp(
        "```(?:" + sqlLangsPattern + ")\\s*\n([\\s\\S]*?)```",
        "gi"
      );

      const sqlBlocks: string[] = [];
      let match: RegExpExecArray | null;
      while ((match = codeBlockRegex.exec(content)) !== null) {
        const sql = match[1].trim();
        if (sql) sqlBlocks.push(sql);
      }

      if (sqlBlocks.length === 0) return;

      const msgId = lastAssistantMsg.id;

      // Set all blocks to "validating"
      setSqlValidations((prev) => {
        const next = new Map(prev);
        const msgMap = new Map<string, SqlValidationStatus>();
        for (const sql of sqlBlocks) {
          msgMap.set(sql, "validating");
        }
        next.set(msgId, msgMap);
        return next;
      });

      // Fire parallel validation calls
      sqlBlocks.forEach((sql) => {
        chatService
          .validateSql({ databaseConnectionId: dbId, query: sql })
          .then((isValid) => {
            setSqlValidations((prev) => {
              const next = new Map(prev);
              const msgMap = new Map(next.get(msgId) || new Map());
              msgMap.set(sql, isValid ? "valid" : "invalid");
              next.set(msgId, msgMap);
              return next;
            });
          });
      });
    }
  }, [status, messages, chatService]);

  useEffect(() => {
    const fetchProviders = async () => {
      setIsLoadingProviders(true);
      try {
        const res = await aiConnectionService.getConnections();
        const data = res.successResponse?.data ?? [];
        setProviders(data);
        // Pre-select the default provider
        const def = data.find((p) => p.isDefault) ?? data[0] ?? null;
        if (def) setSelectedProviderId(String(def.id));
      } catch {
        setProviders([]);
      } finally {
        setIsLoadingProviders(false);
      }
    };
    fetchProviders();
  }, []);

  useEffect(() => {
    const fetchDatabases = async () => {
      setIsLoadingDbs(true);
      try {
        const res: any = await connectionService.getConnections();
        const data = res.successResponse?.data ?? res;
        if (Array.isArray(data)) {
           setDatabases(data);
           if (data.length > 0) setSelectedDbId(String(data[0].id));
        }
      } catch {
        setDatabases([]);
      } finally {
        setIsLoadingDbs(false);
      }
    };
    fetchDatabases();
  }, [connectionService]);


  useEffect(() => {
    const fetchModels = async () => {
      setIsLoadingModels(true);
      try {
        const res: any = await aiModelService.getAvailableModels();
        const data = res.successResponse ? res.successResponse.data : res;
        if (Array.isArray(data) && data.length > 0) {
          const flatModels: AiModel[] = [];
          for (const group of data) {
            if (group.models && Array.isArray(group.models)) {
              for (const m of group.models) {
                flatModels.push({ id: m.modelId, name: m.modelName, provider: group.provider });
              }
            } else if (group.id && group.name) {
              flatModels.push(group as AiModel);
            }
          }
          setAllModels(flatModels);
        }
      } catch {
        setAllModels([]);
      } finally {
        setIsLoadingModels(false);
      }
    };
    fetchModels();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Filter models when provider or allModels changes ─────────────────────
  // ── Filter models when provider or allModels changes ─────────────────────
  useEffect(() => {
    if (isLoadingModels) return; // wait until models are fully fetched
    const provider = providers.find((p) => String(p.id) === selectedProviderId);
    if (!provider) return;

    const filtered = allModels.filter(
      (m) => m.provider?.toLowerCase() === provider.provider.toLowerCase()
    );

    setModels(filtered);
    if (filtered.length > 0) {
      // Prefer the provider's defaultModel if present in the list
      const preferred = filtered.find((m) => m.id === provider.defaultModel);
      setSelectedModelId(preferred ? preferred.id : filtered[0].id);
    } else {
      // Fallback: synthesize an entry from the connection's defaultModel
      const fallback: AiModel = {
        id: provider.defaultModel,
        name: provider.defaultModel,
        provider: provider.provider,
      };
      setModels([fallback]);
      setSelectedModelId(provider.defaultModel);
    }
  }, [selectedProviderId, allModels, providers, isLoadingModels]);

  // ── Handle provider change ────────────────────────────────────────────────
  const handleProviderChange = useCallback(
    async (providerId: string) => {
      setSelectedProviderId(providerId);

      // If a session is already active, update it on the backend
      if (sessionId) {
        try {
          await chatService.updateSessionProvider(sessionId, { providerId });
        } catch (err) {
          console.error("Failed to update session provider", err);
        }
      }
      // If no session yet, the new providerId will be sent when the session is created
    },
    [sessionId, chatService]
  );

  // ── Handle query execution ────────────────────────────────────────────────
  const handleRunQuery = useCallback(async (sql: string): Promise<QueryResultState> => {
    const dbId = selectedDbIdRef.current;
    if (!dbId) {
      return { status: "error", error: "No database selected. Please select a database first." };
    }
    try {
      const res: any = await chatService.executeQuery({ query: sql, databaseConnectionId: dbId });
      const data = res?.successResponse?.data ?? res;
      if (data?.error) {
        return { status: "error", error: data.error };
      }
      const rows: Record<string, any>[] | undefined = data?.rows;
      return {
        status: "success",
        html: data?.html,
        rows,
        rowCount: data?.rowCount ?? rows?.length,
      };
    } catch (err: any) {
      return { status: "error", error: err?.message ?? "Failed to execute query." };
    }
  }, [chatService]);

  // ── Handle send ───────────────────────────────────────────────────────────
  const handleSend = async (content: string, files?: UploadedFileData[]) => {
    let activeSessionId = sessionId;

    if (!activeSessionId) {
      setIsCreatingSession(true);
      try {
        const res: any = await chatService.createSession({
          modelId: selectedModelId,
          providerId: selectedProviderId ?? undefined,
          databaseConnectionId: selectedDbId || undefined,
          title: content.slice(0, 80) || "New Conversation",
        });
        const created = res?.successResponse?.data ?? res;
        if (created?.id) {
          activeSessionId = String(created.id);
          setSessionId(String(created.id));
          sessionIdRef.current = String(created.id);
        }
      } catch (err) {
        console.error("Failed to create chat session", err);
      } finally {
        setIsCreatingSession(false);
      }
    }

    const fileParts = files?.map(f => ({
      type: 'file' as const,
      url: f.url,
      mediaType: f.contentType,
      filename: f.fileName
    }));

    sendMessage({
      text: content,
      ...(fileParts && fileParts.length > 0 ? { files: fileParts } : {}),
    });
  };

  if (!isLoadingProviders && providers.length === 0) {
    return (
      <div className="flex flex-col h-full w-full bg-background items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="max-w-md w-full flex flex-col items-center text-center space-y-6 bg-muted/20 p-8 rounded-3xl border shadow-sm">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2 shadow-inner">
             <Cpu className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">AI Connection Required</h2>
            <p className="text-[15px] text-muted-foreground leading-relaxed">
              You haven't configured any AI models yet. An active AI connection is necessary for the assistant to generate responses.
            </p>
          </div>
          <Button onClick={() => navigate("/ai-llm-config")} size="lg" className="rounded-full mt-4 w-full sm:w-auto shadow-sm">
            Configure AI Connection
          </Button>
        </div>
      </div>
    );
  }

  if (!isLoadingDbs && databases.length === 0) {
    return (
      <div className="flex flex-col h-full w-full bg-background items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="max-w-md w-full flex flex-col items-center text-center space-y-6 bg-muted/20 p-8 rounded-3xl border shadow-sm">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2 shadow-inner">
             <Database className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Database Missing</h2>
            <p className="text-[15px] text-muted-foreground leading-relaxed">
              We need a target database to query against. Please configure your source database connection to continue.
            </p>
          </div>
          <Button onClick={() => navigate("/database-connections")} size="lg" className="rounded-full mt-4 w-full sm:w-auto shadow-sm">
            Add Database Connection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-background relative font-sans">

      {/* Header — greeting only */}
      <div className="flex flex-col px-6 pt-6 pb-2 shrink-0 max-w-4xl mx-auto w-full">
        {messages.length === 0 && !isSessionLoading && (
          <div className="mt-8 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/50">
              Hello, {firstName || "User"}
            </h1>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-muted-foreground mt-3">
              How can I help you today?
            </h2>
          </div>
        )}

        {messages.length === 0 && isSessionLoading && (
           <div className="flex w-full items-center justify-center h-48 mt-8">
             <div className="h-3 w-3 bg-primary/60 rounded-full animate-bounce mx-1" style={{ animationDelay: "0ms" }} />
             <div className="h-3 w-3 bg-primary/60 rounded-full animate-bounce mx-1" style={{ animationDelay: "150ms" }} />
             <div className="h-3 w-3 bg-primary/60 rounded-full animate-bounce mx-1" style={{ animationDelay: "300ms" }} />
           </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto w-full relative scroll-smooth">
        <div className="flex flex-col gap-2 pb-40 pt-4 max-w-4xl mx-auto">
          {messages.map((m, i) => (
            <ChatMessage
              key={m.id}
              message={m}
              animate={m.role === "assistant" && i === messages.length - 1 && status === "streaming"}
              onRunQuery={m.role === "assistant" ? handleRunQuery : undefined}
              sqlValidations={m.role === "assistant" ? sqlValidations.get(m.id) : undefined}
            />
          ))}

          {/* Thinking indicator */}
          {status === "submitted" && (
            <div className="flex w-full px-4 md:px-8 py-2 justify-start">
              <div className="h-6 flex items-center space-x-1 ml-12 mt-1">
                <span className="animate-bounce h-2 w-2 bg-primary/60 rounded-full inline-block" style={{ animationDelay: "0ms" }} />
                <span className="animate-bounce h-2 w-2 bg-primary/60 rounded-full inline-block" style={{ animationDelay: "150ms" }} />
                <span className="animate-bounce h-2 w-2 bg-primary/60 rounded-full inline-block" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-8" />
        </div>
      </div>

      {/* Floating input */}
      <div className="absolute bottom-0 w-full bg-gradient-to-t from-background via-background/95 to-transparent pt-12 pb-6 px-4 pointer-events-none">
        <div className="pointer-events-auto">
          <ChatInput
            onSend={handleSend}
            onStop={stop}
            isGenerating={isGenerating}
            disabled={isGenerating || isCreatingSession || isSessionLoading}
            models={models}
            selectedModelId={selectedModelId}
            onModelChange={setSelectedModelId}
            isLoadingModels={isLoadingModels}
            providers={providers}
            selectedProviderId={selectedProviderId}
            onProviderChange={handleProviderChange}
            isLoadingProviders={isLoadingProviders}
            databases={databases}
            selectedDbId={selectedDbId}
            onDbChange={setSelectedDbId}
            isLoadingDbs={isLoadingDbs}
          />
          <p className="text-center text-[12px] text-muted-foreground mt-4 font-medium max-w-2xl mx-auto">
            AI generated responses can make mistakes. Check important information.
          </p>
        </div>
      </div>
    </div>
  );
}
