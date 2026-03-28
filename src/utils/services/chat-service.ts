import { injectable, inject } from "inversify";
import ApiClient from "./api-client";

// ── Models ─────────────────────────────────────────────────────────────────────

export interface ChatSession {
  id: string;
  title: string;
  lastMessage?: string;
  updatedAt: string;
}

export interface CreateChatSessionRequest {
  modelId: string;
  providerId?: string;
  title?: string;
}

export interface UpdateSessionProviderRequest {
  providerId: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

@injectable()
class ChatService {
  constructor(@inject(ApiClient) private apiClient: ApiClient) { }

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
}

export default ChatService;
