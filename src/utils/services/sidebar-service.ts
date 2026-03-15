import ApiClient from "./api-client";
import { injectable, inject } from "inversify";

export interface SidebarItem {
    id: string;
    title: string;
    description: string;
    iconClass: string;
}

@injectable()
class SidebarService {
    constructor(@inject(ApiClient) private apiClient: ApiClient) { }

    async getSidebarItems() {
        return await this.apiClient.sendHttpGet<SidebarItem[]>(
            "sidebar/items"
        );
    }
}

export default SidebarService;
