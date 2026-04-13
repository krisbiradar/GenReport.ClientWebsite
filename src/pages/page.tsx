import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RecentSessions } from "@/components/dashboard/recent-reports";
import { FileText, MessageSquare, Database } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AuthState } from "@/state-management/slices/auth-slice";
import { container } from "@/utils/di/inversify.config";
import DashboardService, { DashboardStats, RecentSession } from "@/utils/services/dashboard-service";

export default function HomePage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isAuthenticated = useSelector((state: { auth: AuthState }) => state.auth.isAuthenticated);
  const firstName = useSelector((state: { auth: AuthState }) => state.auth.firstName);
  const navigate = useNavigate();

  const dashboardService = React.useMemo(() => container.get(DashboardService), []);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [sessions, setSessions] = useState<RecentSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    let mounted = true;

    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const res: any = await dashboardService.getStats();
        const data: DashboardStats | undefined = res?.successResponse?.data;
        if (mounted && data) setStats(data);
      } catch {
        // leave as null — cards will show "—"
      } finally {
        if (mounted) setStatsLoading(false);
      }
    };

    const fetchSessions = async () => {
      setSessionsLoading(true);
      try {
        const res: any = await dashboardService.getRecentSessions();
        const data: RecentSession[] = res?.successResponse?.data ?? res;
        if (mounted && Array.isArray(data)) setSessions(data);
      } catch {
        setSessions([]);
      } finally {
        if (mounted) setSessionsLoading(false);
      }
    };

    fetchStats();
    fetchSessions();

    return () => {
      mounted = false;
    };
  }, []);

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      <main className="flex-1 overflow-y-auto w-full bg-muted/10">
        <div className="container p-6 md:p-8 space-y-8 animate-fadeIn max-w-[1400px] mx-auto">

          {/* ── Header ───────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {greeting},{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                {firstName || "there"}
              </span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Here's a summary of your GenReport activity.
            </p>
          </div>

          {/* ── KPI Stats ─────────────────────────────────────────────────── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatsCard
              id="stat-total-reports"
              title="Total Reports Generated"
              value={stats?.totalReports ?? null}
              icon={FileText}
              accentClass="bg-blue-500/10 text-blue-500"
              isLoading={statsLoading}
            />
            <StatsCard
              id="stat-total-queries"
              title="Total Queries Generated"
              value={stats?.totalQueries ?? null}
              icon={Database}
              accentClass="bg-violet-500/10 text-violet-500"
              isLoading={statsLoading}
            />
            <StatsCard
              id="stat-total-chats"
              title="Total Chats"
              value={stats?.totalChats ?? null}
              icon={MessageSquare}
              accentClass="bg-emerald-500/10 text-emerald-500"
              isLoading={statsLoading}
            />
          </div>

          {/* ── Recent Sessions ───────────────────────────────────────────── */}
          <div id="recent-sessions">
            <RecentSessions sessions={sessions} isLoading={sessionsLoading} />
          </div>

        </div>
      </main>
    </div>
  );
}
