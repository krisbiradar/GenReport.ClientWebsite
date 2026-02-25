import { HttpResponse } from "../models/shared/http-response";
import {
    AuthResponse,
    ForgotPasswordRequest,
    LoginRequest,
    ResetPasswordRequest,
    SignupRequest,
    VerifyOtpRequest,
} from "../models/auth-models";
import ApiClient from "./api-client";

export default class AuthService {
    private apiClient: ApiClient;

    constructor() {
        this.apiClient = new ApiClient();
    }

    async login(request: LoginRequest) {
        return await this.apiClient.sendHttpPost<HttpResponse<AuthResponse>>(
            request,
            "login"
        );
    }

    async signup(request: SignupRequest) {
        return await this.apiClient.sendHttpPost<HttpResponse<AuthResponse>>(
            request,
            "signup"
        );
    }

    async forgotPassword(request: ForgotPasswordRequest) {
        return await this.apiClient.sendHttpPost<HttpResponse<any>>(
            request,
            "forgot-password"
        );
    }

    async verifyOtp(request: VerifyOtpRequest) {
        return await this.apiClient.sendHttpPost<HttpResponse<any>>(
            request,
            "verify-otp"
        );
    }

    async resetPassword(request: ResetPasswordRequest) {
        return await this.apiClient.sendHttpPost<HttpResponse<any>>(
            request,
            "reset-password"
        );
    }
}
