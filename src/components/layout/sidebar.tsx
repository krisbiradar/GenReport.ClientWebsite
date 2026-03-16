import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, LogOut, Menu } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { cn } from '@/lib/utils';
import { logOut } from '@/utils/helpers/window-helpers';
import { Button } from '@/components/ui/button';
import { RootState } from '@/state-management/store/app-store';
import { fetchSidebarItems } from '@/state-management/slices/sidebar-slice';
import { getRouteForSidebarItem } from '@/utils/helpers/sidebar-routing';
import { SidebarItem } from '@/utils/services/sidebar-service';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const location = useLocation();
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state: RootState) => state.sidebar);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchSidebarItems() as any);
    }
  }, [dispatch, status]);

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen border-r bg-card shadow-sm transition-all duration-300 ease-in-out z-20",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b">
        {!isCollapsed && (
          <span className="text-xl font-bold tracking-tight text-primary truncate animate-fadeIn">
            GENREPORT
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn("shrink-0", isCollapsed && "mx-auto")}
        >
          {isCollapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto py-6">
        {status === "loading" && (
          <div className={cn("px-4 text-sm text-muted-foreground", isCollapsed && "text-center")}>
            Loading modules...
          </div>
        )}
        {status === "failed" && (
          <div className="px-4 space-y-3">
            {!isCollapsed && <p className="text-xs text-destructive">{error || "Failed to load modules."}</p>}
            <Button
              variant="outline"
              size="sm"
              className={cn(isCollapsed ? "w-10 px-0" : "w-full")}
              onClick={() => dispatch(fetchSidebarItems() as any)}
              title={isCollapsed ? "Retry sidebar load" : undefined}
            >
              Retry
            </Button>
          </div>
        )}
        <ul className="space-y-2 px-3">
          {items.map((item: SidebarItem) => {
            const path = getRouteForSidebarItem(item.title);
            const isActive = location.pathname.startsWith(path) && (path !== '/' || location.pathname === '/');
            const IconComponent = (LucideIcons as any)[item.iconClass] || LucideIcons.FileText;
            
            return (
              <li key={item.id}>
                <Link
                  to={path}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-primary/10 hover:text-primary",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground",
                    isCollapsed && "justify-center px-0"
                  )}
                  title={isCollapsed ? `${item.title}: ${item.description}` : item.description}
                >
                  <IconComponent className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                  {!isCollapsed && <span className="animate-fadeIn">{item.title}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className={cn(
            "w-full flex items-center gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
            isCollapsed ? "justify-center px-0" : "justify-start px-3"
          )}
          onClick={() => logOut()}
          title={isCollapsed ? "Log out" : undefined}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="animate-fadeIn">Log out</span>}
        </Button>
      </div>
    </aside>
  );
}
