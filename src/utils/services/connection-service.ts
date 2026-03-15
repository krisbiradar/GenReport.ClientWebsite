import { HttpResponse } from "../models/shared/http-response";
import ApiClient from "./api-client";

export interface DatabaseConnection {
    id: string;
    name: string;
    databaseType: string;
    hostName: string;
    port: number;
    userName: string;
    databaseName: string;
    // Password might not usually be returned for security, but we keep it in payload.
    // password?: string;
}

export interface CreateDatabaseConnectionRequest {
    name: string;
    databaseType: string;
    hostName: string;
    port: number;
    userName: string;
    databaseName: string;
    password?: string;
}

import { injectable } from "inversify";
import { container } from "@/utils/di/inversify.config";

@injectable()
export default class ConnectionService {
    private apiClient: ApiClient;

    constructor() {
        this.apiClient = container.get(ApiClient);
    }

    async getConnections() {
        return await this.apiClient.sendHttpGet<DatabaseConnection[]>(
            "connections"
        );
    }

    async createConnection(request: CreateDatabaseConnectionRequest) {
        return await this.apiClient.sendHttpPost<HttpResponse<DatabaseConnection>>(
            request,
            "connections"
        );
    }

    async updateConnection(id: string, request: CreateDatabaseConnectionRequest) {
        return await this.apiClient.sendHttpPut<HttpResponse<DatabaseConnection>>(
            `connections/${id}`,
            request
        );
    }
}
