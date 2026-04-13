import { injectable, inject } from "inversify";
import ApiClient from "./api-client";

// ── Response Models ───────────────────────────────────────────────────────────

export interface DashboardStats {
  totalReports: number;
  totalQueries: number;
  totalChats: number;
}

export interface RecentSession {
  id: string;
  title: string;
  messageCount: number;
  reportCount: number;
  createdAt: string;
  updatedAt: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

@injectable()
class DashboardService {
  constructor(@inject(ApiClient) private apiClient: ApiClient) {}

  async getStats() {
    return await this.apiClient.sendHttpGet<DashboardStats>("dashboard/stats");
  }

  async getRecentSessions() {
    const RECENT_SESSIONS_LIMIT = 10;
    const params = new URLSearchParams({ limit: String(RECENT_SESSIONS_LIMIT) });
    return await this.apiClient.sendHttpGet<RecentSession[]>("dashboard/recent-sessions", params);
  }
}

export default DashboardService;
