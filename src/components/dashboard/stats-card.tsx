import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  id?: string;
  title: string;
  value: number | null;
  icon: LucideIcon;
  /** Tailwind color class for the icon background, e.g. "bg-blue-500/10 text-blue-500" */
  accentClass: string;
  suffix?: string;
  isLoading?: boolean;
}

function useCountUp(target: number | null, duration = 900) {
  const [count, setCount] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (target === null) return;
    const start = performance.now();
    const from = 0;

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(from + (target - from) * eased));
      if (progress < 1) {
        raf.current = requestAnimationFrame(animate);
      }
    };

    raf.current = requestAnimationFrame(animate);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, duration]);

  return count;
}

export function StatsCard({ id, title, value, icon: Icon, accentClass, suffix, isLoading }: StatsCardProps) {
  const displayValue = useCountUp(value);

  if (isLoading) {
    return (
      <Card id={id} className="border-border/40 shadow-sm relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div className="h-4 w-28 bg-muted animate-pulse rounded" />
          <div className="h-8 w-8 bg-muted animate-pulse rounded-lg" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-20 bg-muted animate-pulse rounded mt-1" />
          <div className="h-3 w-24 bg-muted animate-pulse rounded mt-2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id={id} className="border-border/40 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
      {/* subtle gradient strip on top */}
      <div className={cn("absolute inset-x-0 top-0 h-0.5 opacity-60", accentClass.split(" ")[0].replace("bg-", "bg-").replace("/10", ""))} />
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", accentClass)}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">
          {value !== null ? displayValue.toLocaleString() : "—"}
          {suffix && <span className="text-xl font-medium text-muted-foreground ml-1">{suffix}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
