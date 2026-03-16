import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";

export default function AiLlmConfigPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      <main className="flex-1 overflow-y-auto w-full bg-muted/10">
        <div className="container p-6 md:p-8 space-y-8 animate-fadeIn max-w-[1200px] mx-auto">
          <div className="flex items-center gap-3">
            <Bot className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">AI & LLM Configuration</h1>
              <p className="text-muted-foreground">Configure model providers, prompts, and runtime defaults.</p>
            </div>
          </div>
          <Card className="border-border/40 shadow-sm">
            <CardHeader>
              <CardTitle>Module Coming Soon</CardTitle>
              <CardDescription>This page is wired and protected by backend-driven sidebar access.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Add AI and LLM configuration settings here.
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
