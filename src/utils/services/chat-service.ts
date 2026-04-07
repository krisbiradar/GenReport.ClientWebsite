import { injectable, inject } from "inversify";
import ApiClient from "./api-client";

// ── Models ─────────────────────────────────────────────────────────────────────

export interface ChatSession {
  id: string;
  title: string;
  lastMessage?: string;
  updatedAt: string;
}

export interface ChatMessageDto {
  id: string;
  role: "user" | "assistant" | "data";
  content: string;
  createdAt?: string;
}

export interface ChatSessionDetails extends ChatSession {
  messages: ChatMessageDto[];
}

export interface CreateChatSessionRequest {
  modelId: string;
  providerId?: string;
  databaseConnectionId?: string;
  title?: string;
}

export interface UpdateSessionProviderRequest {
  providerId: string;
}

export interface ExecuteQueryRequest {
  query: string;
  databaseConnectionId: string;
}

export interface ExecuteQueryResult {
  html?: string;
  rows?: Record<string, any>[];
  error?: string;
  rowCount?: number;
}

// ── Service ───────────────────────────────────────────────────────────────────

@injectable()
class ChatService {
  constructor(@inject(ApiClient) private apiClient: ApiClient) { }

  async getSession(id: string) {
    return await this.apiClient.sendHttpGet<ChatSessionDetails>(`chat/sessions/${id}`);
  }

  async getSessions() {
    return await this.apiClient.sendHttpGet<ChatSession[]>("chat/sessions");
  }

  async createSession(req: CreateChatSessionRequest) {
    return await this.apiClient.sendHttpPost<ChatSession>(req, "chat/sessions");
  }

  async updateSessionProvider(sessionId: string, req: UpdateSessionProviderRequest) {
    return await this.apiClient.sendHttpPut<ChatSession>(
      `chat/sessions/${sessionId}`,
      req
    );
  }

  async executeQuery(req: ExecuteQueryRequest) {
    return await this.apiClient.sendHttpPost<ExecuteQueryResult>(req, "chat/execute-query");
  }
}

export default ChatService;
