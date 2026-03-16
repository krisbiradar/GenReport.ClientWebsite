import { SidebarItem } from "@/utils/services/sidebar-service";

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getDefaultPathFromTitle(title: string) {
  return `/${normalize(title).replace(/\s+/g, "-")}`;
}

export function getRouteForSidebarItem(title: string) {
  const normalized = normalize(title);

  if (normalized === "dashboard") {
    return "/";
  }

  if (normalized.includes("database") && normalized.includes("connection")) {
    return "/database-connections";
  }

  if (normalized.includes("user") && normalized.includes("management")) {
    return "/users";
  }

  if (normalized.includes("ai") || normalized.includes("llm")) {
    return "/ai-llm-config";
  }

  return getDefaultPathFromTitle(title);
}

function getModulePathForRoute(pathname: string) {
  if (pathname.startsWith("/database-connections")) {
    return "/database-connections";
  }
  if (pathname.startsWith("/connections")) {
    return "/database-connections";
  }
  if (pathname.startsWith("/users")) {
    return "/users";
  }
  if (pathname.startsWith("/ai-llm-config")) {
    return "/ai-llm-config";
  }
  return null;
}

export function hasSidebarAccessForPath(items: SidebarItem[], pathname: string) {
  const guardedModulePath = getModulePathForRoute(pathname);
  if (!guardedModulePath) {
    return true;
  }

  return items.some((item) => getRouteForSidebarItem(item.title) === guardedModulePath);
}
