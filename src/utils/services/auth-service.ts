import { HttpResponse } from "../models/shared/http-response";
import { AuthResponse, LoginRequest } from "../models/auth-models";
import ApiClient from "./api-client";
import { injectable } from "inversify";
import { container } from "@/utils/di/inversify.config";

@injectable()
export default class AuthService {
    private apiClient: ApiClient;

    constructor() {
        this.apiClient = container.get(ApiClient);
    }

    async login(request: LoginRequest) {
        return await this.apiClient.sendHttpPost<HttpResponse<AuthResponse>>(
            request,
            "login"
        );
    }
}
