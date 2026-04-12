import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquare, FileText, Clock, ChevronRight } from "lucide-react";
import { RecentSession } from "@/utils/services/dashboard-service";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface RecentSessionsProps {
  sessions: RecentSession[];
  isLoading: boolean;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return "yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border bg-card/50">
      <div className="h-10 w-10 rounded-lg bg-muted animate-pulse shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-40 bg-muted animate-pulse rounded" />
        <div className="h-3 w-24 bg-muted animate-pulse rounded" />
      </div>
      <div className="flex gap-4 items-center">
        <div className="h-3 w-12 bg-muted animate-pulse rounded" />
        <div className="h-3 w-12 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}

export function RecentSessions({ sessions, isLoading }: RecentSessionsProps) {
  const navigate = useNavigate();

  return (
    <Card className="border-border/40 shadow-sm flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold">Recent Sessions</CardTitle>
        <CardDescription>Your latest chat sessions with message and report counts.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-base font-medium">No sessions yet</h3>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-[240px]">
              Start a new chat to see your activity here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {sessions.map((session, i) => (
              <button
                key={session.id}
                id={`session-row-${session.id}`}
                onClick={() => navigate(`/chat/${session.id}`)}
                className={cn(
                  "group w-full flex items-center gap-4 p-4 rounded-xl border bg-card/50",
                  "hover:bg-accent/30 hover:border-accent/60 hover:shadow-sm",
                  "transition-all duration-200 text-left",
                  "animate-in fade-in slide-in-from-bottom-2"
                )}
                style={{ animationDelay: `${i * 40}ms`, animationFillMode: "backwards" }}
              >
                {/* Icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform duration-200">
                  <MessageSquare className="h-5 w-5" />
                </div>

                {/* Title + date */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session.title || "Untitled session"}</p>
                  <div className="flex items-center gap-1. mt-0.5">
                    <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground ml-1">{formatRelativeDate(session.updatedAt)}</span>
                  </div>
                </div>

                {/* Counts */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">{session.messageCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">{session.reportCount}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all duration-200" />
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
