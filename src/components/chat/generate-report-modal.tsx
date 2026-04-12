import React, { useState } from "react";
import { FileSpreadsheet, FileText, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ReportFormat = "excel" | "pdf";

interface GenerateReportModalProps {
  onConfirm: (format: ReportFormat) => Promise<void>;
  onClose: () => void;
}

export function GenerateReportModal({ onConfirm, onClose }: GenerateReportModalProps) {
  const [selected, setSelected] = useState<ReportFormat | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!selected) return;
    setIsSubmitting(true);
    try {
      await onConfirm(selected);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatOptions: { id: ReportFormat; label: string; description: string; icon: React.ReactNode; accent: string }[] = [
    {
      id: "excel",
      label: "Excel",
      description: "Editable spreadsheet with .xlsx format",
      icon: <FileSpreadsheet className="h-7 w-7" />,
      accent: "text-emerald-400 border-emerald-500/50 bg-emerald-500/10",
    },
    {
      id: "pdf",
      label: "PDF",
      description: "Printable document with .pdf format",
      icon: <FileText className="h-7 w-7" />,
      accent: "text-red-400 border-red-500/50 bg-red-500/10",
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md mx-4 bg-card rounded-2xl shadow-2xl border border-border/60 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-7 pb-5">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Generate Report</h2>
            <p className="text-sm text-muted-foreground mt-1">Choose an output format for your report</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Format options */}
        <div className="px-7 pb-7 flex flex-col gap-3">
          {formatOptions.map((opt) => {
            const isActive = selected === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                disabled={isSubmitting}
                className={cn(
                  "flex items-center gap-5 w-full rounded-xl border-2 px-5 py-4 text-left transition-all duration-150 select-none",
                  isActive
                    ? opt.accent + " border-opacity-80"
                    : "border-border/40 bg-muted/20 hover:bg-muted/40 hover:border-border/70"
                )}
              >
                <div className={cn("shrink-0 transition-colors", isActive ? opt.accent.split(" ")[0] : "text-muted-foreground")}>
                  {opt.icon}
                </div>
                <div>
                  <div className={cn("text-sm font-semibold", isActive ? opt.accent.split(" ")[0] : "text-foreground")}>
                    {opt.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{opt.description}</div>
                </div>
                {/* Selection ring */}
                <div className="ml-auto">
                  <div className={cn(
                    "h-5 w-5 rounded-full border-2 transition-all",
                    isActive
                      ? opt.accent.split(" ")[0].replace("text-", "border-") + " bg-current"
                      : "border-border/50"
                  )} />
                </div>
              </button>
            );
          })}

          {/* Action */}
          <Button
            onClick={handleConfirm}
            disabled={!selected || isSubmitting}
            className="w-full mt-3 h-11 rounded-xl font-medium text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Queuing…
              </>
            ) : (
              "Generate Report"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
