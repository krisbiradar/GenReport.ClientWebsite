import { injectable, inject } from "inversify";
import ApiClient from "./api-client";

// ── Response Models ────────────────────────────────────────────────────────────

export interface RecentReport {
  /** Internal report ID */
  id: string;
  /** Report display name */
  name: string;
  /** The raw SQL / natural-language query that produced this report */
  query: string;
  /** Session that spawned the report */
  sessionId: string;
  sessionName: string;
  /** Output format: "excel" | "pdf" | "csv" | etc. */
  format: string;
  /** Number of rows in the result set */
  noOfRows: number;
  /** Presigned / public URL to download the file — null if not yet available */
  fileUrl: string | null;
  /** ISO date string */
  createdAt: string;
}

export interface RecentReportsResponse {
  reports: RecentReport[];
  total: number;
}

// ── Service ───────────────────────────────────────────────────────────────────

@injectable()
class ReportsService {
  constructor(@inject(ApiClient) private apiClient: ApiClient) {}

  async getRecentReports(limit = 20) {
    const params = new URLSearchParams({ limit: String(limit) });
    return await this.apiClient.sendHttpGet<RecentReportsResponse>(
      "reports/recent",
      params
    );
  }
}

export default ReportsService;
