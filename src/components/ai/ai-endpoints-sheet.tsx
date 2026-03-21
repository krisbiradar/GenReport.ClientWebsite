import { useEffect, useState } from "react";
import { X, Pencil, Check, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AiConnectionService, {
  AiConnection,
  AiModelEndpoint,
  AiEndpointType,
  UpdateAiModelEndpointRequest,
} from "@/utils/services/ai-connection-service";
import { container } from "@/utils/di/inversify.config";
import { showPopup } from "@/utils/helpers/popup-helper";

interface AiEndpointsSheetProps {
  connection: AiConnection;
  onClose: () => void;
}

const ENDPOINT_TYPE_LABEL: Record<AiEndpointType, string> = {
  [AiEndpointType.Chat]: "Chat",
  [AiEndpointType.Models]: "Models",
  [AiEndpointType.Quota]: "Quota",
};

function MethodBadge({ method }: { method: string }) {
  const m = method?.toUpperCase() ?? "GET";
  const isPost = m === "POST";
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold uppercase ${
        isPost
          ? "bg-blue-500/10 text-blue-400"
          : "bg-emerald-500/10 text-emerald-400"
      }`}
    >
      {m}
    </span>
  );
}

interface EndpointRowProps {
  endpoint: AiModelEndpoint;
  connId: number;
  onUpdated: (updated: AiModelEndpoint) => void;
}

function EndpointRow({ endpoint, connId, onUpdated }: EndpointRowProps) {
  const aiService = container.get(AiConnectionService);
  const [isEditingPath, setIsEditingPath] = useState(false);
  const [draftPath, setDraftPath] = useState(endpoint.path);
  const [isSavingPath, setIsSavingPath] = useState(false);
  const [isTogglingEnabled, setIsTogglingEnabled] = useState(false);

  const savePath = async () => {
    if (draftPath === endpoint.path) {
      setIsEditingPath(false);
      return;
    }
    setIsSavingPath(true);
    try {
      const req: UpdateAiModelEndpointRequest = { path: draftPath };
      const res = await aiService.updateEndpoint(connId, endpoint.id, req);
      if ((res as any)?.successResponse) {
        onUpdated({ ...endpoint, path: draftPath });
        setIsEditingPath(false);
      } else {
        showPopup({ title: "Error", body: "Failed to update endpoint path.", type: "error" });
        setDraftPath(endpoint.path);
      }
    } catch {
      showPopup({ title: "Error", body: "Network error while saving path.", type: "error" });
      setDraftPath(endpoint.path);
    } finally {
      setIsSavingPath(false);
    }
  };

  const cancelPath = () => {
    setDraftPath(endpoint.path);
    setIsEditingPath(false);
  };

  const toggleEnabled = async () => {
    setIsTogglingEnabled(true);
    try {
      const req: UpdateAiModelEndpointRequest = { isEnabled: !endpoint.isEnabled };
      const res = await aiService.updateEndpoint(connId, endpoint.id, req);
      if ((res as any)?.successResponse) {
        onUpdated({ ...endpoint, isEnabled: !endpoint.isEnabled });
      } else {
        showPopup({ title: "Error", body: "Failed to toggle endpoint.", type: "error" });
      }
    } catch {
      showPopup({ title: "Error", body: "Network error while toggling endpoint.", type: "error" });
    } finally {
      setIsTogglingEnabled(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border/50 bg-muted/10 p-4">
      {/* Top row: type badge + method badge + toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md border border-border/50 px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {ENDPOINT_TYPE_LABEL[endpoint.endpointType] ?? endpoint.endpointType}
          </span>
          <MethodBadge method={endpoint.httpMethod} />
        </div>

        {/* Enabled toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={endpoint.isEnabled}
          onClick={toggleEnabled}
          disabled={isTogglingEnabled}
          title={endpoint.isEnabled ? "Disable endpoint" : "Enable endpoint"}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 ${
            endpoint.isEnabled ? "bg-primary" : "bg-input"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${
              endpoint.isEnabled ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Path row */}
      <div className="flex items-center gap-2">
        {isEditingPath ? (
          <>
            <Input
              value={draftPath}
              onChange={(e) => setDraftPath(e.target.value)}
              className="flex-1 h-8 text-sm font-mono"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") savePath();
                if (e.key === "Escape") cancelPath();
              }}
            />
            <button
              type="button"
              onClick={savePath}
              disabled={isSavingPath}
              className="text-emerald-500 hover:text-emerald-400 transition-colors disabled:opacity-50"
              title="Save path"
            >
              {isSavingPath ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              onClick={cancelPath}
              disabled={isSavingPath}
              className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
              title="Cancel"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <span className="flex-1 text-sm font-mono text-muted-foreground truncate" title={endpoint.path}>
              {endpoint.path || <span className="italic opacity-50">No path set</span>}
            </span>
            <button
              type="button"
              onClick={() => setIsEditingPath(true)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Edit path"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Notes */}
      {endpoint.notes && (
        <p className="text-xs text-muted-foreground">{endpoint.notes}</p>
      )}
    </div>
  );
}

export function AiEndpointsSheet({ connection, onClose }: AiEndpointsSheetProps) {
  const aiService = container.get(AiConnectionService);
  const [endpoints, setEndpoints] = useState<AiModelEndpoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await aiService.getEndpoints(connection.id);
        if (res.successResponse?.data) {
          setEndpoints(res.successResponse.data);
        } else {
          setEndpoints([]);
        }
      } catch {
        showPopup({ title: "Error", body: "Failed to load endpoints.", type: "error" });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [connection.id]);

  const handleEndpointUpdated = (updated: AiModelEndpoint) => {
    setEndpoints((prev) =>
      prev.map((ep) => (ep.id === updated.id ? updated : ep))
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex flex-col w-[480px] sm:w-[540px] bg-card border-l border-border/50 shadow-2xl animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-border/50 bg-muted/10 shrink-0">
          <div>
            <h2 className="text-lg font-semibold">Model Endpoints</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {connection.provider} — configure paths and availability
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full shrink-0 ml-4">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : endpoints.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No endpoints found for this provider.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {endpoints.length} endpoint{endpoints.length !== 1 ? "s" : ""}
              </p>
              {endpoints.map((ep) => (
                <EndpointRow
                  key={ep.id}
                  endpoint={ep}
                  connId={connection.id}
                  onUpdated={handleEndpointUpdated}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}
