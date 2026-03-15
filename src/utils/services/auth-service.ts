import { HttpResponse } from "../models/shared/http-response";
import { AuthResponse, LoginRequest } from "../models/auth-models";
import ApiClient from "./api-client";
import { injectable, inject } from "inversify";

@injectable()
class AuthService {
    constructor(@inject(ApiClient) private apiClient: ApiClient) { }

    async login(request: LoginRequest) {
        return await this.apiClient.sendHttpPost<HttpResponse<AuthResponse>>(
            request,
            "login"
        );
    }
}

export default AuthService;
