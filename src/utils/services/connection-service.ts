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
    connectionString: string;
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
    connectionString: string;
}

import { injectable, inject } from "inversify";

enum DbProvider {
    NpgSql = 1,
    SqlClient = 2,
    MySqlConnector = 3,
    Oracle = 4,
    MongoClient = 5,
}

const DB_PROVIDER_BY_DATABASE_TYPE: Record<string, DbProvider> = {
    PostgreSQL: DbProvider.NpgSql,
    SQLServer: DbProvider.SqlClient,
    MySQL: DbProvider.MySqlConnector,
    Oracle: DbProvider.Oracle,
    MongoDB: DbProvider.MongoClient,
};

const mapDatabaseTypeToDbProvider = (databaseType: string): DbProvider => {
    return DB_PROVIDER_BY_DATABASE_TYPE[databaseType] ?? DbProvider.NpgSql;
};

@injectable()
class ConnectionService {
    constructor(@inject(ApiClient) private apiClient: ApiClient) { }

    async getConnections() {
        return await this.apiClient.sendHttpGet<DatabaseConnection[]>(
            "connections"
        );
    }

    async createConnection(request: CreateDatabaseConnectionRequest) {
        const payload = { ...request, dbProvider: mapDatabaseTypeToDbProvider(request.databaseType) };
        return await this.apiClient.sendHttpPost<HttpResponse<DatabaseConnection>>(
            payload,
            "connections"
        );
    }

    async updateConnection(id: string, request: CreateDatabaseConnectionRequest) {
        const payload = { ...request, dbProvider: mapDatabaseTypeToDbProvider(request.databaseType) };
        return await this.apiClient.sendHttpPut<HttpResponse<DatabaseConnection>>(
            `connections/${id}`,
            payload
        );
    }

    async testConnection(request: CreateDatabaseConnectionRequest) {
        const payload = { ...request, dbProvider: mapDatabaseTypeToDbProvider(request.databaseType) };
        return await this.apiClient.sendHttpPost<HttpResponse<any>>(
            payload,
            "connections/test"
        );
    }
}

export default ConnectionService;
