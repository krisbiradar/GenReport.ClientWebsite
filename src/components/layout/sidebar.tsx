import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, LayoutDashboard, LogOut, Menu, MessageSquare, Plus, Clock } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { cn } from '@/lib/utils';
import { logOut } from '@/utils/helpers/window-helpers';
import { Button } from '@/components/ui/button';
import { RootState } from '@/state-management/store/app-store';
import { fetchSidebarItems } from '@/state-management/slices/sidebar-slice';
import { getRouteForSidebarItem } from '@/utils/helpers/sidebar-routing';
import { SidebarItem } from '@/utils/services/sidebar-service';
import { container } from '@/utils/di/inversify.config';
import ChatService, { ChatSession } from '@/utils/services/chat-service';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function RecentChatsList({ isCollapsed }: { isCollapsed: boolean }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const load = async () => {
      setStatus('loading');
      try {
        const chatService = container.get(ChatService);
        const res = await chatService.getSessions();
        const data = (res as any).successResponse?.data ?? (res as any).data ?? res;
        setSessions(Array.isArray(data) ? data : []);
        setStatus('done');
      } catch {
        setSessions([]);
        setStatus('error');
      }
    };
    load();
  }, []);

  if (isCollapsed) {
    // In collapsed mode, just show a New Chat icon button
    return (
      <button
        onClick={() => navigate('/chat')}
        className="flex items-center justify-center w-10 h-10 mx-auto rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
        title="New chat"
      >
        <Plus className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {/* Header row */}
      <div className="flex items-center justify-between px-3 mb-1">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          <Clock className="h-3 w-3" />
          Recent
        </span>
        <button
          onClick={() => navigate('/chat')}
          className="flex items-center gap-1 text-[11px] text-primary hover:underline font-medium opacity-80 hover:opacity-100 transition-opacity"
          title="New chat"
        >
          <Plus className="h-3 w-3" />
          New
        </button>
      </div>

      {status === 'loading' && (
        <div className="flex flex-col gap-1 px-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2 py-2 animate-pulse">
              <div className="h-7 w-7 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 bg-muted rounded-full w-3/4" />
                <div className="h-2 bg-muted rounded-full w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {status === 'done' && sessions.length === 0 && (
        <p className="px-3 text-xs text-muted-foreground/60 py-2">No recent chats</p>
      )}

      {(status === 'done' || status === 'error') && sessions.length > 0 && (
        <ul className="space-y-0.5 px-1.5">
          {sessions.slice(0, 8).map((session) => {
            const isActive = location.pathname === `/chat/${session.id}`;
            return (
              <li key={session.id}>
                <button
                  onClick={() => navigate(`/chat/${session.id}`)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left group transition-all',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  )}
                >
                  <MessageSquare
                    className={cn(
                      'h-4 w-4 shrink-0',
                      isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  />
                  <span className="flex-1 text-sm truncate leading-snug">
                    {session.title || 'Untitled chat'}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60 shrink-0 font-medium group-hover:opacity-100 opacity-0 group-hover:opacity-60">
                    {formatTime(session.updatedAt)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const location = useLocation();
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state: RootState) => state.sidebar);
  const isOnChatRoute = location.pathname.startsWith('/chat');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchSidebarItems() as any);
    }
  }, [dispatch, status]);

  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen border-r bg-card shadow-sm transition-all duration-300 ease-in-out z-20',
        isCollapsed ? 'w-20' : 'w-64'
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
          className={cn('shrink-0', isCollapsed && 'mx-auto')}
        >
          {isCollapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-4">
        {/* Static + dynamic nav items */}
        <div>
          {status === 'loading' && (
            <div className={cn('px-4 text-sm text-muted-foreground', isCollapsed && 'text-center')}>
              Loading modules...
            </div>
          )}
          {status === 'failed' && (
            <div className="px-4 space-y-3">
              {!isCollapsed && <p className="text-xs text-destructive">{error || 'Failed to load modules.'}</p>}
              <Button
                variant="outline"
                size="sm"
                className={cn(isCollapsed ? 'w-10 px-0' : 'w-full')}
                onClick={() => dispatch(fetchSidebarItems() as any)}
                title={isCollapsed ? 'Retry sidebar load' : undefined}
              >
                Retry
              </Button>
            </div>
          )}
          <ul className="space-y-1 px-3">
            {/* Static Dashboard link — always visible */}
            <li>
              <Link
                to="/"
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-primary/10 hover:text-primary',
                  location.pathname === '/' ? 'bg-primary/10 text-primary' : 'text-muted-foreground',
                  isCollapsed && 'justify-center px-0'
                )}
                title={isCollapsed ? 'Dashboard' : undefined}
              >
                <LayoutDashboard className={cn('h-5 w-5', location.pathname === '/' ? 'text-primary' : 'text-muted-foreground')} />
                {!isCollapsed && <span className="animate-fadeIn">Dashboard</span>}
              </Link>
            </li>

            {items.map((item: SidebarItem) => {
              const path = getRouteForSidebarItem(item.title);
              const isActive = location.pathname.startsWith(path) && (path !== '/' || location.pathname === '/');
              const iconMap: Record<string, string> = {
                "bi bi-database-gear": "Database",
                "bi bi-people": "Users",
                "bi bi-cpu": "Cpu",
                "bi bi-file-earmark-bar-graph": "BarChart",
                "bi bi-chat-dots": "MessageSquare"
              };
              const lucideName = iconMap[item.iconClass] || item.iconClass;
              const IconComponent = (LucideIcons as any)[lucideName] || LucideIcons.FileText;

              return (
                <li key={item.id}>
                  <Link
                    to={path}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-primary/10 hover:text-primary',
                      isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground',
                      isCollapsed && 'justify-center px-0'
                    )}
                    title={isCollapsed ? `${item.title}: ${item.description}` : item.description}
                  >
                    <IconComponent className={cn('h-5 w-5', isActive ? 'text-primary' : 'text-muted-foreground')} />
                    {!isCollapsed && <span className="animate-fadeIn">{item.title}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Recent chats — only shown on /chat routes */}
        {isOnChatRoute && (
          <>
            {!isCollapsed && <div className="mx-4 border-t border-border/50" />}
            <RecentChatsList isCollapsed={isCollapsed} />
          </>
        )}
      </nav>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className={cn(
            'w-full flex items-center gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors',
            isCollapsed ? 'justify-center px-0' : 'justify-start px-3'
          )}
          onClick={() => logOut()}
          title={isCollapsed ? 'Log out' : undefined}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="animate-fadeIn">Log out</span>}
        </Button>
      </div>
    </aside>
  );
}
