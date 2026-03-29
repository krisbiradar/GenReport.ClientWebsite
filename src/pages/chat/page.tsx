import React, { useEffect, useRef, useState, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput, UploadedFileData } from "@/components/chat/chat-input";
import { container } from "@/utils/di/inversify.config";
import AiModelService, { AiModel } from "@/utils/services/ai-model-service";
import AiConnectionService, { AiConnection } from "@/utils/services/ai-connection-service";
import ChatService from "@/utils/services/chat-service";
import { getJwt } from "@/utils/helpers/window-helpers";
import { useSelector } from "react-redux";
import { AuthState } from "@/state-management/slices/auth-slice";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

export default function ChatPage() {
  const [models, setModels] = useState<AiModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(true);

  const [providers, setProviders] = useState<AiConnection[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [isLoadingProviders, setIsLoadingProviders] = useState<boolean>(true);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const aiModelService = container.get(AiModelService);
  const aiConnectionService = container.get(AiConnectionService);
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

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: `${BASE_URL}/chat/sessions/messages`,
      headers: async (): Promise<Record<string, string>> => {
        const token = await getJwt();
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
      body: () => ({
        modelId: selectedModelIdRef.current,
        ...(sessionIdRef.current ? { sessionId: sessionIdRef.current } : {}),
      }),
    }),
  });

  const isGenerating = status === "submitted" || status === "streaming";


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
          if (flatModels.length > 0) {
            setModels(flatModels);
            setSelectedModelId(flatModels[0].id);
          }
        }
      } catch {
        setModels([]);
      } finally {
        setIsLoadingModels(false);
      }
    };
    fetchModels();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  // ── Handle send ───────────────────────────────────────────────────────────
  const handleSend = async (content: string, files?: UploadedFileData[]) => {
    let activeSessionId = sessionId;

    if (!activeSessionId) {
      setIsCreatingSession(true);
      try {
        const res: any = await chatService.createSession({
          modelId: selectedModelId,
          providerId: selectedProviderId ?? undefined,
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

  return (
    <div className="flex flex-col h-full w-full bg-background relative font-sans">

      {/* Header — greeting only */}
      <div className="flex flex-col px-6 pt-6 pb-2 shrink-0 max-w-4xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="mt-8 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/50">
              Hello, {firstName || "User"}
            </h1>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-muted-foreground mt-3">
              How can I help you today?
            </h2>
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
            disabled={isGenerating || isCreatingSession}
            models={models}
            selectedModelId={selectedModelId}
            onModelChange={setSelectedModelId}
            isLoadingModels={isLoadingModels}
            providers={providers}
            selectedProviderId={selectedProviderId}
            onProviderChange={handleProviderChange}
            isLoadingProviders={isLoadingProviders}
          />
          <p className="text-center text-[12px] text-muted-foreground mt-4 font-medium max-w-2xl mx-auto">
            AI generated responses can make mistakes. Check important information.
          </p>
        </div>
      </div>
    </div>
  );
}
