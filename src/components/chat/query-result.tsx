import React from "react";
import { Loader2, AlertCircle, CheckCircle2, Table2 } from "lucide-react";

export interface QueryResultState {
  status: "idle" | "loading" | "success" | "error";
  html?: string;
  rows?: Record<string, any>[];
  rowCount?: number;
  error?: string;
}

interface QueryResultProps {
  result: QueryResultState;
}

function JsonTable({ rows }: { rows: Record<string, any>[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic py-2">
        Query returned 0 rows.
      </p>
    );
  }

  const cols = Object.keys(rows[0]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {cols.map((col) => (
              <th
                key={col}
                className="border-b border-zinc-700 bg-zinc-800/80 px-3 py-2 text-left text-xs font-semibold text-zinc-300 whitespace-nowrap"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className="border-b border-zinc-800 hover:bg-zinc-800/40 transition-colors"
            >
              {cols.map((col) => (
                <td
                  key={col}
                  className="px-3 py-2 text-xs text-zinc-300 whitespace-nowrap max-w-[260px] truncate"
                  title={String(row[col] ?? "")}
                >
                  {row[col] === null || row[col] === undefined ? (
                    <span className="text-zinc-600 italic">NULL</span>
                  ) : (
                    String(row[col])
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function QueryResult({ result }: QueryResultProps) {
  if (result.status === "idle") return null;

  return (
    <div className="mt-1 rounded-xl border border-zinc-700/60 overflow-hidden shadow-sm bg-zinc-900/80 text-foreground">
      {/* Header bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800/80 border-b border-zinc-700/60 text-xs font-sans">
        <Table2 className="h-3.5 w-3.5 text-zinc-400" />
        <span className="text-zinc-400 font-medium">Query Results</span>

        {result.status === "loading" && (
          <span className="ml-auto flex items-center gap-1.5 text-blue-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            Running…
          </span>
        )}

        {result.status === "success" && (
          <span className="ml-auto flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            {result.rowCount !== undefined
              ? `${result.rowCount} row${result.rowCount !== 1 ? "s" : ""}`
              : "Success"}
          </span>
        )}

        {result.status === "error" && (
          <span className="ml-auto flex items-center gap-1.5 text-red-400">
            <AlertCircle className="h-3 w-3" />
            Failed
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-0">
        {result.status === "loading" && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Executing query…
          </div>
        )}

        {result.status === "error" && (
          <div className="flex items-start gap-2 px-4 py-3 text-sm text-red-400 bg-red-950/20">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span className="font-mono text-xs leading-relaxed break-all">
              {result.error || "An unknown error occurred."}
            </span>
          </div>
        )}

        {result.status === "success" && result.html && (
          <div
            className="query-html-result p-3 text-sm text-zinc-300"
            dangerouslySetInnerHTML={{ __html: result.html }}
          />
        )}

        {result.status === "success" && !result.html && result.rows && (
          <JsonTable rows={result.rows} />
        )}
      </div>
    </div>
  );
}
