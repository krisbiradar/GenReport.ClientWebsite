import { injectable, inject } from "inversify";
import ApiClient from "./api-client";
import { HttpResponse } from "../models/shared/http-response";

// ── Enums ─────────────────────────────────────────────────────────────────────

export enum AiEndpointType {
  Chat = 1,
  Models = 2,
  Quota = 3,
}

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface AiModelEndpoint {
  id: number;
  aiConnectionId: number;
  endpointType: AiEndpointType;
  path: string;
  httpMethod: string;
  isEnabled: boolean;
  notes?: string;
}

export interface AiConnection {
  id: number;
  provider: string;
  defaultModel: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  rateLimitRpm?: number;
  rateLimitTpm?: number;
  costPer1kInputTokens?: number;
  costPer1kOutputTokens?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  modelEndpoints: AiModelEndpoint[];
}

export interface CreateAiConnectionRequest {
  provider: string;
  apiKey: string;
  defaultModel: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  rateLimitRpm?: number;
  rateLimitTpm?: number;
  costPer1kInputTokens?: number;
  costPer1kOutputTokens?: number;
  isActive: boolean;
}

export interface UpdateAiConnectionRequest {
  apiKey?: string;
  defaultModel?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  rateLimitRpm?: number;
  rateLimitTpm?: number;
  costPer1kInputTokens?: number;
  costPer1kOutputTokens?: number;
  isActive?: boolean;
}

export interface UpdateAiModelEndpointRequest {
  path?: string;
  httpMethod?: string;
  isEnabled?: boolean;
  notes?: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

@injectable()
class AiConnectionService {
  constructor(@inject(ApiClient) private apiClient: ApiClient) {}

  async getConnections() {
    return await this.apiClient.sendHttpGet<AiConnection[]>("ai/connections");
  }

  async createConnection(req: CreateAiConnectionRequest) {
    return await this.apiClient.sendHttpPost<HttpResponse<AiConnection>>(
      req,
      "ai/connections"
    );
  }

  async updateConnection(id: number, req: UpdateAiConnectionRequest) {
    return await this.apiClient.sendHttpPut<HttpResponse<AiConnection>>(
      `ai/connections/${id}`,
      req
    );
  }

  async deleteConnection(id: number) {
    return await this.apiClient.sendHttpDelete<HttpResponse<{ id: number }>>(
      `ai/connections/${id}`
    );
  }

  async getEndpoints(id: number) {
    return await this.apiClient.sendHttpGet<AiModelEndpoint[]>(
      `ai/connections/${id}/endpoints`
    );
  }

  async updateEndpoint(
    connId: number,
    epId: number,
    req: UpdateAiModelEndpointRequest
  ) {
    return await this.apiClient.sendHttpPut<HttpResponse<AiModelEndpoint>>(
      `ai/connections/${connId}/endpoints/${epId}`,
      req
    );
  }
}

export default AiConnectionService;
