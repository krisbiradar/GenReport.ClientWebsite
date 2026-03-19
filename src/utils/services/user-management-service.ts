import { injectable, inject } from "inversify";
import ApiClient from "./api-client";
import { HttpResponse } from "../models/shared/http-response";

export interface UserResponse {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    profileURL?: string;
    roleId: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserRequest {
    email: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    profileURL?: string;
    password: string;
    roleId: number;
}

export interface ResetPasswordRequest {
    userId: number;
    newPassword: string;
}

export interface DeactivateUserRequest {
    userId: number;
}

@injectable()
class UserManagementService {
    constructor(@inject(ApiClient) private apiClient: ApiClient) { }

    async getUsers() {
        return await this.apiClient.sendHttpGet<UserResponse[]>("users");
    }

    async createUser(payload: CreateUserRequest) {
        return await this.apiClient.sendHttpPost<HttpResponse<any>>(payload, "users");
    }

    async resetPassword(userId: number, newPassword: string) {
        const payload: ResetPasswordRequest = { userId, newPassword };
        return await this.apiClient.sendHttpPut<HttpResponse<any>>("users/reset-password", payload);
    }

    async deactivateUser(userId: number) {
        const payload: DeactivateUserRequest = { userId };
        return await this.apiClient.sendHttpPut<HttpResponse<any>>("users/deactivate", payload);
    }
}

export default UserManagementService;
