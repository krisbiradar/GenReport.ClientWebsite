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

export interface AiProviderModel {
  modelId: string;
  modelName: string;
}

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
  isDefault: boolean;
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
  isDefault: boolean;
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
  isDefault?: boolean;
}

export interface UpdateAiModelEndpointRequest {
  path?: string;
  httpMethod?: string;
  isEnabled?: boolean;
  notes?: string;
}

export interface TestAiConnectionRequest {
  provider: string;
  apiKey: string;
  defaultModel: string;
  chatEndpointUrl?: string;
}

export enum AiConfigType {
  Unknown = 0,
  IntentClassifier = 1,
  ChatSystemPrompt = 2
}

export interface AiConfig {
  id: number;
  type: AiConfigType;
  value: string;
  aiConnectionId: number;
  modelId?: string;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAiConfigRequest {
  type: AiConfigType;
  value: string;
  modelId?: string;
}

export interface UpdateAiConfigRequest {
  value?: string;
  isActive?: boolean;
  modelId?: string;
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

  async testConnection(req: TestAiConnectionRequest) {
    return await this.apiClient.sendHttpPost<HttpResponse<any>>(
      req,
      "ai/connections/test"
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

  async getModels(provider: string) {
    if (provider.toLowerCase() === "ollama") {
      return new HttpResponse<AiProviderModel[]>({
        statusCode: 200,
        message: "OK",
        data: []
      } as any);
    }
    return await this.apiClient.sendHttpGet<AiProviderModel[]>(
      `ai/providers/${provider.toLowerCase()}/models`
    );
  }

  // ── AI Configurations ───────────────────────────────────────────────────────

  async getConfigs(connectionId: number) {
    return await this.apiClient.sendHttpGet<AiConfig[]>(
      `ai/connections/${connectionId}/configs`
    );
  }

  async addConfig(connectionId: number, req: CreateAiConfigRequest) {
    return await this.apiClient.sendHttpPost<HttpResponse<AiConfig>>(
      req,
      `ai/connections/${connectionId}/configs`
    );
  }

  async updateConfig(connectionId: number, configId: number, req: UpdateAiConfigRequest) {
    return await this.apiClient.sendHttpPut<HttpResponse<any>>(
      `ai/connections/${connectionId}/configs/${configId}`,
      req
    );
  }
}

export default AiConnectionService;
