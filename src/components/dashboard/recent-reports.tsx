import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { FileText, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RecentReports() {
  const reports: any[] = [
    // { id: 'REP-1042', name: 'Annual Vulnerability Scan', date: 'Oct 24, 2025', status: 'Completed' },
    // { id: 'REP-1043', name: 'Server Patch Compliance', date: 'Oct 22, 2025', status: 'Completed' },
    // { id: 'REP-1044', name: 'User Access Audit', date: 'Oct 15, 2025', status: 'Pending' },
    // { id: 'REP-1045', name: 'Firewall Policy Review', date: 'Oct 10, 2025', status: 'Completed' },
  ];

  return (
    <Card className="h-full border-border/40 shadow-sm flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Recent Reports</CardTitle>
        <CardDescription>Your recently generated system reports.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium">No Reports Found</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-[250px]">
              You don't have any generated reports to display right now.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border bg-card/50 hover:bg-accent/50 transition-colors shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{report.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground font-mono">{report.id}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{report.date}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-4 sm:mt-0 w-full sm:w-auto justify-end">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    report.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
                  }`}>
                    {report.status}
                  </span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 ml-2">
                    <Eye className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
