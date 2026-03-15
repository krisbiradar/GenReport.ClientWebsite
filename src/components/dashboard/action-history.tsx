import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle2, FileText, Settings, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ActionHistory() {
  const actions = [
    { id: 1, type: 'report', title: 'Generated Q1 Security Report', time: '2 hours ago', icon: FileText, color: 'text-blue-500' },
    { id: 2, type: 'system', title: 'Updated API Keys', time: '5 hours ago', icon: Settings, color: 'text-orange-500' },
    { id: 3, type: 'auth', title: 'Logged in from new IP', time: '1 day ago', icon: User, color: 'text-green-500' },
    { id: 4, type: 'success', title: 'Passed Compliance Check', time: '2 days ago', icon: CheckCircle2, color: 'text-emerald-500' },
  ];

  return (
    <Card className="h-full border-border/40 shadow-sm flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Action History</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-6">
          {actions.map((action, index) => (
            <div key={action.id} className="flex gap-4 relative">
              {/* Timeline connecting line */}
              {index !== actions.length - 1 && (
                <div className="absolute left-4 top-8 bottom-[-24px] w-px bg-border" />
              )}
              
              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background border shadow-sm">
                <action.icon className={cn("h-4 w-4", action.color)} />
              </div>
              <div className="flex flex-col pt-1.5">
                <p className="text-sm font-medium leading-none">{action.title}</p>
                <p className="text-xs text-muted-foreground mt-1.5">{action.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
