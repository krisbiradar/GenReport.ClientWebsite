import React, { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import {
  FileText,
  Plus,
  Search,
  Download,
  ExternalLink,
  MessageSquare,
  Clock,
  Hash,
  AlertCircle,
  RefreshCw,
  FileSpreadsheet,
  FileBarChart,
  File,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { container } from "@/utils/di/inversify.config";
import ReportsService, { RecentReport } from "@/utils/services/reports-service";
import { cn } from "@/lib/utils";

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return "yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface FormatConfig {
  label: string;
  icon: React.ElementType;
  cls: string;
}

function getFormatConfig(format: string): FormatConfig {
  const f = (format ?? "").toLowerCase();
  if (f === "excel" || f === "xlsx")
    return { label: "Excel", icon: FileSpreadsheet, cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
  if (f === "pdf")
    return { label: "PDF", icon: FileBarChart, cls: "bg-red-500/10 text-red-500 border-red-500/20" };
  if (f === "csv")
    return { label: "CSV", icon: FileText, cls: "bg-blue-500/10 text-blue-500 border-blue-500/20" };
  return { label: format ?? "File", icon: File, cls: "bg-muted text-muted-foreground border-border" };
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ReportCardSkeleton() {
  return (
    <div className="rounded-2xl border bg-card/60 p-5 space-y-4 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="h-10 w-10 rounded-xl bg-muted shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-3.5 w-40 bg-muted rounded" />
            <div className="h-3 w-24 bg-muted rounded" />
          </div>
        </div>
        <div className="h-6 w-16 bg-muted rounded-full" />
      </div>
      <div className="h-3 w-full bg-muted rounded" />
      <div className="h-3 w-3/4 bg-muted rounded" />
      <div className="flex gap-4 pt-1">
        <div className="h-3 w-20 bg-muted rounded" />
        <div className="h-3 w-20 bg-muted rounded" />
      </div>
    </div>
  );
}

// ── Report Card ───────────────────────────────────────────────────────────────

function ReportCard({ report, index }: { report: RecentReport; index: number }) {
  const navigate = useNavigate();
  const { label, icon: FormatIcon, cls } = getFormatConfig(report.format);

  return (
    <div
      id={`report-card-${report.id}`}
      className={cn(
        "group rounded-2xl border bg-card/60 p-5 flex flex-col gap-4",
        "hover:bg-card hover:shadow-md hover:border-border/80",
        "transition-all duration-200 animate-in fade-in slide-in-from-bottom-3"
      )}
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: "backwards" }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Format icon */}
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border", cls)}>
            <FormatIcon className="h-5 w-5" />
          </div>

          {/* Name + session */}
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate leading-snug">
              {report.name || "Unnamed Report"}
            </p>
            <button
              id={`report-session-link-${report.id}`}
              onClick={() => navigate(`/chat/${report.sessionId}`)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mt-0.5"
            >
              <MessageSquare className="h-3 w-3 shrink-0" />
              <span className="truncate max-w-[160px]">{report.sessionName || "Untitled session"}</span>
            </button>
          </div>
        </div>

        {/* Format badge */}
        <span
          className={cn(
            "shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
            cls
          )}
        >
          {label}
        </span>
      </div>

      {/* Query */}
      <div className="bg-muted/40 rounded-xl px-3.5 py-3 border border-border/40">
        <p className="text-xs font-mono text-muted-foreground leading-relaxed line-clamp-3 break-all">
          {report.query || "—"}
        </p>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          {formatRelativeDate(report.createdAt)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Hash className="h-3.5 w-3.5 shrink-0" />
          {report.noOfRows?.toLocaleString() ?? "—"} rows
        </span>
      </div>

      {/* File URL actions */}
      {report.fileUrl ? (
        <div className="flex items-center gap-2 pt-1 border-t border-border/40">
          <a
            id={`report-download-${report.id}`}
            href={report.fileUrl}
            download
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium",
              "bg-primary/10 text-primary border border-primary/20",
              "hover:bg-primary/20 transition-colors"
            )}
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </a>
          <a
            id={`report-open-${report.id}`}
            href={report.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium",
              "bg-muted text-muted-foreground border border-border/50",
              "hover:bg-muted/80 hover:text-foreground transition-colors"
            )}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open
          </a>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 pt-1 border-t border-border/40 text-xs text-muted-foreground/60">
          <File className="h-3.5 w-3.5" />
          File not yet available
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const navigate = useNavigate();
  const reportsService = useMemo(() => container.get(ReportsService), []);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [reports, setReports] = useState<RecentReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchReports = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res: any = await reportsService.getRecentReports(30);
      const data: RecentReport[] = res?.successResponse?.data?.reports
        ?? res?.successResponse?.data
        ?? [];
      if (Array.isArray(data)) setReports(data);
      else setReports([]);
    } catch {
      setIsError(true);
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return reports;
    return reports.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.query?.toLowerCase().includes(q) ||
        r.sessionName?.toLowerCase().includes(q) ||
        r.format?.toLowerCase().includes(q)
    );
  }, [reports, searchQuery]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      <main className="flex-1 overflow-y-auto w-full bg-muted/10">
        <div className="container p-6 md:p-8 space-y-8 animate-fadeIn max-w-[1400px] mx-auto">

          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
              <p className="text-muted-foreground text-sm">
                View, download, and manage your generated analysis reports.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                id="btn-refresh-reports"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={fetchReports}
                disabled={isLoading}
              >
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                Refresh
              </Button>
              <Button
                id="btn-new-report"
                className="gap-2"
                onClick={() => navigate("/chat")}
              >
                <Plus className="h-4 w-4" />
                New Report
              </Button>
            </div>
          </div>

          {/* ── Search + count ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="reports-search"
                placeholder="Search by name, query, session or format…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 w-full bg-card shadow-sm border-border/60"
              />
            </div>
            {!isLoading && !isError && (
              <p className="text-sm text-muted-foreground shrink-0">
                {filtered.length} of {reports.length} report{reports.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* ── Content ── */}
          {isLoading ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ReportCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center min-h-[380px]">
              <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 w-full max-w-lg bg-card/40 backdrop-blur-sm shadow-sm">
                <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mb-5 ring-1 ring-destructive/20">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold">Failed to load reports</h3>
                <p className="text-muted-foreground mt-2 text-sm max-w-xs">
                  Something went wrong fetching your reports. Please try again.
                </p>
                <Button
                  id="btn-retry-reports"
                  variant="outline"
                  className="mt-6 gap-2"
                  onClick={fetchReports}
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
              </Card>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center min-h-[380px]">
              <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 w-full max-w-lg bg-card/40 backdrop-blur-sm shadow-sm animate-in fade-in zoom-in-95 duration-300">
                <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-primary/20">
                  <FileText className="h-10 w-10 text-primary opacity-80" />
                </div>
                <h3 className="text-2xl font-semibold tracking-tight">
                  {searchQuery ? "No matching reports" : "No Reports Yet"}
                </h3>
                <p className="text-muted-foreground mt-3 max-w-xs leading-relaxed text-sm">
                  {searchQuery
                    ? `No reports match "${searchQuery}". Try a different search term.`
                    : "You haven't generated any reports yet. Start a chat session and run a query to generate one."}
                </p>
                {!searchQuery && (
                  <Button
                    id="btn-start-chat"
                    onClick={() => navigate("/chat")}
                    className="mt-8 gap-2 rounded-full px-6"
                    size="lg"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Generate your first report
                  </Button>
                )}
              </Card>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((report, i) => (
                <ReportCard key={report.id} report={report} index={i} />
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
