// container.ts
import { Container } from 'inversify';
import DefaultStore from '@/state-management/store/app-store';
import ApiClient from '../services/api-client';
import AuthService from '../services/auth-service';
import ConnectionService from '../services/connection-service';
import SidebarService from '../services/sidebar-service';
import UserManagementService from '../services/user-management-service';
import AiConnectionService from '../services/ai-connection-service';
import AiModelService from '../services/ai-model-service';
import ChatService from '../services/chat-service';
import StorageService from '../services/storage-service';
import DashboardService from '../services/dashboard-service';
import ReportsService from '../services/reports-service';
import 'reflect-metadata';
const container = new Container();

container.bind<DefaultStore>(DefaultStore).toSelf().inSingletonScope();
container.bind<ApiClient>(ApiClient).toSelf().inSingletonScope();
container.bind<AuthService>(AuthService).toSelf().inSingletonScope();
container.bind<ConnectionService>(ConnectionService).toSelf().inSingletonScope();
container.bind<SidebarService>(SidebarService).toSelf().inSingletonScope();
container.bind<UserManagementService>(UserManagementService).toSelf().inSingletonScope();
container.bind<AiConnectionService>(AiConnectionService).toSelf().inSingletonScope();
container.bind<AiModelService>(AiModelService).toSelf().inSingletonScope();
container.bind<ChatService>(ChatService).toSelf().inSingletonScope();
container.bind<StorageService>(StorageService).toSelf().inSingletonScope();
container.bind<DashboardService>(DashboardService).toSelf().inSingletonScope();
container.bind<ReportsService>(ReportsService).toSelf().inSingletonScope();

export { container };
