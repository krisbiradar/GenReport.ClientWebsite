import { injectable, inject } from "inversify";
import ApiClient from "./api-client";

// ── Models ─────────────────────────────────────────────────────────────────────

export interface ChatSession {
  id: string;
  title: string;
  lastMessage?: string;
  updatedAt: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

@injectable()
class ChatService {
  constructor(@inject(ApiClient) private apiClient: ApiClient) {}

  async getSessions() {
    return await this.apiClient.sendHttpGet<ChatSession[]>("chat/sessions");
  }
}

export default ChatService;
