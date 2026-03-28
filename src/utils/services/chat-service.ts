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
  title?: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

@injectable()
class ChatService {
  constructor(@inject(ApiClient) private apiClient: ApiClient) {}

  async getSessions() {
    return await this.apiClient.sendHttpGet<ChatSession[]>("chat/sessions");
  }

  async createSession(req: CreateChatSessionRequest) {
    return await this.apiClient.sendHttpPost<ChatSession>(req, "chat/sessions");
  }
}

export default ChatService;
