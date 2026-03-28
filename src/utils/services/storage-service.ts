import { injectable, inject } from "inversify";
import ApiClient from "./api-client";
import { HttpResponse } from "../models/shared/http-response";

export interface UploadFileResponse {
  url: string;
  fileName: string;
  contentType: string;
  size: number;
}

@injectable()
class StorageService {
  constructor(@inject(ApiClient) private apiClient: ApiClient) {}

  async uploadFile(file: File): Promise<HttpResponse<UploadFileResponse>> {
    const formData = new FormData();
    formData.append("file", file);
    return await this.apiClient.sendHttpPostMultipart<UploadFileResponse>(
      "/storage/upload",
      formData
    );
  }
}

export default StorageService;
