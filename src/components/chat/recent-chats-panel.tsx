import React, { useEffect, useState } from "react";
import { MessageSquare, Clock, ChevronRight, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { container } from "@/utils/di/inversify.config";
import ChatService, { ChatSession } from "@/utils/services/chat-service";
import { cn } from "@/lib/utils";

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function SkeletonItem() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl animate-pulse">
      <div className="h-9 w-9 rounded-full bg-muted shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-3.5 bg-muted rounded-full w-3/4" />
        <div className="h-3 bg-muted rounded-full w-1/2" />
      </div>
      <div className="h-5 w-10 bg-muted rounded-full shrink-0" />
    </div>
  );
}

export function RecentChatsPanel() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const navigate = useNavigate();
  const chatService = container.get(ChatService);

  useEffect(() => {
    const load = async () => {
      setStatus("loading");
      try {
        const res = await chatService.getSessions();
        const data = (res as any).successResponse?.data ?? (res as any).data ?? res;
        if (Array.isArray(data)) {
          setSessions(data);
          setStatus("success");
        } else {
          setSessions([]);
          setStatus("success");
        }
      } catch {
        setStatus("error");
      }
    };
    load();
  }, []);

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
          <Clock className="h-4 w-4 text-primary/70" />
          Recent chats
        </div>
        <button
          onClick={() => navigate("/chat")}
          className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline transition-opacity opacity-80 hover:opacity-100"
        >
          <Plus className="h-3.5 w-3.5" />
          New chat
        </button>
      </div>

      <div className="rounded-2xl border bg-card/50 backdrop-blur-sm divide-y divide-border/50 overflow-hidden">
        {status === "loading" && (
          <>
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
          </>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
            <MessageSquare className="h-8 w-8 opacity-30" />
            <p className="text-sm">Could not load recent chats.</p>
          </div>
        )}

        {status === "success" && sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
            <MessageSquare className="h-8 w-8 opacity-30" />
            <p className="text-sm">No recent chats yet. Start a conversation!</p>
          </div>
        )}

        {status === "success" &&
          sessions.slice(0, 5).map((session) => (
            <button
              key={session.id}
              onClick={() => navigate(`/chat/${session.id}`)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left group",
                "hover:bg-primary/5 transition-colors duration-150 first:rounded-t-2xl last:rounded-b-2xl"
              )}
            >
              {/* Icon */}
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                <MessageSquare className="h-4.5 w-4.5 text-primary h-4 w-4" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate leading-snug">
                  {session.title || "Untitled chat"}
                </p>
                {session.lastMessage && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5 leading-snug">
                    {session.lastMessage}
                  </p>
                )}
              </div>

              {/* Time badge + chevron */}
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                  {formatRelativeTime(session.updatedAt)}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
      </div>
    </div>
  );
}
