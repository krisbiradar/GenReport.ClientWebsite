import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { FileText, Plus, Filter, Search, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

export default function ReportsPage() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [reports, setReports] = useState<any[]>([]); // Empty data state
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      <main className="flex-1 overflow-y-auto w-full bg-muted/10">
        <div className="container p-6 md:p-8 space-y-8 animate-fadeIn max-w-[1400px] mx-auto">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
              <p className="text-muted-foreground">
                View, download, and manage your generated analysis reports.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2 shadow-sm">
                <Filter className="h-4 w-4" /> Filter
              </Button>
              <Button className="gap-2 shadow-sm">
                <Plus className="h-4 w-4" /> New Report
              </Button>
            </div>
          </div>

          <div className="flex items-center max-w-md w-full relative">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search reports..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 w-full bg-card shadow-sm border-border/60"
            />
          </div>

          <div className="min-h-[400px] flex items-center justify-center">
            {reports.length === 0 ? (
              <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 w-full max-w-3xl bg-card/40 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-500 shadow-sm">
                <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-primary/20">
                  <FileText className="h-10 w-10 text-primary opacity-80" />
                </div>
                <h3 className="text-2xl font-semibold tracking-tight">No Reports Generated Yet</h3>
                <p className="text-muted-foreground mt-3 max-w-md leading-relaxed text-[15px]">
                  You haven't run any queries to generate reports. Start a conversation with the AI or connect a database to begin analyzing your data.
                </p>
                <Button 
                  onClick={() => navigate('/chat')} 
                  className="mt-8 gap-2 rounded-full px-6 shadow-sm" 
                  size="lg"
                >
                  <MessageSquare className="h-4 w-4" /> Generate your first report (via chat)
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full">
                 {/* Reserved for report cards mapping */}
              </div>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}
