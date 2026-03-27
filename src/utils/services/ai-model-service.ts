import { injectable, inject } from "inversify";
import ApiClient from "./api-client";

export interface AiModel {
  id: string; 
  name: string; 
  provider: string; 
}

@injectable()
export default class AiModelService {
  constructor(@inject(ApiClient) private apiClient: ApiClient) {}

  async getAvailableModels() {
    return await this.apiClient.sendHttpGet<AiModel[]>("chat/models");
  }
}
