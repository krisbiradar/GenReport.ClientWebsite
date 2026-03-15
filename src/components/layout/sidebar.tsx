import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, History, ChevronLeft, ChevronRight, LogOut, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logOut } from '@/utils/helpers/window-helpers';
import { Button } from '@/components/ui/button';
import { useSelector } from 'react-redux';
import { NavbarState } from '@/state-management/slices/menu-impl-slice';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const location = useLocation();
  const menuItems = useSelector((state: { navbar: NavbarState }) => state.navbar?.menuItems || []);

  const defaultItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Recent Reports', path: '#reports', icon: FileText },
    { name: 'Action History', path: '#history', icon: History },
    { name: 'Settings', path: '#settings', icon: Settings },
  ];

  // Map dynamic items to specific lucide icons if possible
  const iconMap: Record<string, any> = {
    'Dashboard': LayoutDashboard,
    'Reports': FileText,
    'History': History,
    'Settings': Settings,
    'Connections': Settings, // or Database, but Settings is safe
  };

  // If redux is empty, use default items. Otherwise use mapped remote items.
  const navItems = menuItems.length > 0 
    ? menuItems.map(m => ({ 
        name: m.label, 
        path: m.link || '#', 
        icon: iconMap[m.label] || FileText 
      }))
    : defaultItems;

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
        <ul className="space-y-2 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.hash === item.path;
            
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-primary/10 hover:text-primary",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground",
                    isCollapsed && "justify-center px-0"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                  {!isCollapsed && <span className="animate-fadeIn">{item.name}</span>}
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
