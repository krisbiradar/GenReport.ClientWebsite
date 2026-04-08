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

export interface ValidateSqlRequest {
  databaseConnectionId: string;
  query: string;
}

export enum QueryValidationStatus {
  OK = 1,
  NotReadOnly = 2,
  ParseError = 3,
  ExecutionError = 4,
  Unsupported = 5
}

export interface QueryValidationResult {
  status: QueryValidationStatus;
  description: string;
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

  async validateSql(req: ValidateSqlRequest): Promise<{ isValid: boolean; error?: string }> {
    try {
      const res: any = await this.apiClient.sendHttpPost(req, "chat/messages/validate");
      
      const resultData = res?.successResponse?.data || res?.successResponse || res;
      
      // If the backend returns the validation result inside successResponse
      if (resultData && typeof resultData.status !== 'undefined') {
        const isOk = resultData.status === 1 || resultData.Status === 1; // QueryValidationStatusOK
        if (isOk) return { isValid: true };
        return { 
          isValid: false, 
          error: resultData.description || resultData.Description || "Query validation failed" 
        };
      }

      if (res?.errorResponse?.errors?.[0]) {
         try {
             // In case the C# backend passed the 400 bad request through via our API client
             const parsed = JSON.parse(res.errorResponse.errors[0]);
             if (parsed && (typeof parsed.status !== 'undefined' || typeof parsed.Status !== 'undefined')) {
                 const isOk = parsed.status === 1 || parsed.Status === 1;
                 if (isOk) return { isValid: true };
                 return { isValid: false, error: parsed.description || parsed.Description || "Query validation failed" };
             }
         } catch {
             // Not JSON
         }
      }

      // Extract error message from the error response
      if (res?.errorResponse) {
        const errMsg =
          res?.errorResponse?.message ||
          res?.errorResponse?.errors?.[0] ||
          "Query validation failed";
        return { isValid: false, error: errMsg };
      }

      // Fallback
      return { isValid: !!res?.successResponse };
    } catch (ex: any) {
      return { isValid: false, error: ex?.message || "Query validation failed" };
    }
  }
}

export default ChatService;
