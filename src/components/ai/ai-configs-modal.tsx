import React, { useState, useEffect } from "react";
import { X, Loader2, Save, FileClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { container } from "@/utils/di/inversify.config";
import AiConnectionService, {
  AiConnection,
  AiConfig,
  AiConfigType,
  CreateAiConfigRequest,
} from "@/utils/services/ai-connection-service";
import { showPopup } from "@/utils/helpers/popup-helper";

interface AiConfigsModalProps {
  connection: AiConnection;
  onClose: () => void;
}

type ActiveTab = "system_prompt" | "intent_classifier";

const TEXTAREA_CLASS =
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y";

export function AiConfigsModal({ connection, onClose }: AiConfigsModalProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("system_prompt");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // States to hold the current active config fetched from server
  const [promptConfig, setPromptConfig] = useState<AiConfig | null>(null);
  const [intentConfig, setIntentConfig] = useState<AiConfig | null>(null);

  // Local drafted changes
  const [localPrompt, setLocalPrompt] = useState("");
  const [localIntent, setLocalIntent] = useState("");

  const aiService = container.get(AiConnectionService);

  const loadConfigs = async () => {
    setIsLoading(true);
    try {
      const res = await aiService.getConfigs(connection.id);
      const data = res.successResponse?.data || ([] as AiConfig[]);
      
      const pConfig = data.find((c: AiConfig) => c.type === AiConfigType.ChatSystemPrompt) || null;
      const iConfig = data.find((c: AiConfig) => c.type === AiConfigType.IntentClassifier) || null;
      
      setPromptConfig(pConfig);
      setIntentConfig(iConfig);
      
      setLocalPrompt(pConfig?.value || "");
      setLocalIntent(iConfig?.value || "");
    } catch {
      showPopup({ title: "Error", body: "Failed to load configurations.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, [connection.id]);

  const hasPromptChanged = localPrompt !== (promptConfig?.value || "");
  const hasIntentChanged = localIntent !== (intentConfig?.value || "");

  const handleSave = async () => {
    // Only save the active tab if it's changed to keep things simple
    const isPromptTab = activeTab === "system_prompt";
    const hasChanges = isPromptTab ? hasPromptChanged : hasIntentChanged;
    
    if (!hasChanges) {
      return;
    }

    if (isPromptTab && !localPrompt.trim()) {
       showPopup({ title: "Validation", body: "System prompt cannot be empty.", type: "error" });
       return;
    }
    if (!isPromptTab && !localIntent.trim()) {
       showPopup({ title: "Validation", body: "Intent classifier cannot be empty.", type: "error" });
       return;
    }

    setIsSaving(true);
    try {
       const req: CreateAiConfigRequest = {
         type: isPromptTab ? AiConfigType.ChatSystemPrompt : AiConfigType.IntentClassifier,
         value: isPromptTab ? localPrompt : localIntent,
         modelId: connection.defaultModel // Or pass overriding modelId if needed
       };

       const res = await aiService.addConfig(connection.id, req);
       
       if (res?.successResponse) {
          showPopup({ title: "Success", body: "Configuration updated successfully.", type: "success" });
          await loadConfigs();
       } else {
          showPopup({ title: "Error", body: res?.errorResponse?.message || "Failed to save configuration.", type: "error" });
       }
    } catch {
       showPopup({ title: "Error", body: "A network error occurred while saving.", type: "error" });
    } finally {
       setIsSaving(false);
    }
  };

  const renderConfigDetails = (config: AiConfig | null) => {
    if (!config) return null;
    return (
      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 border-t border-border/50 pt-2">
        <div className="flex items-center gap-1.5">
           <FileClock className="h-3 w-3" />
           Version {config.version}
        </div>
        <div>
           Updated: {new Date(config.updatedAt).toLocaleString()}
        </div>
        {config.modelId && (
           <div className="bg-secondary/50 px-1.5 rounded">
              Model Override: {config.modelId}
           </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-card rounded-xl shadow-2xl border border-border/50 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/10 shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Manage Prompts &amp; Configs
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
               {connection.provider} — {connection.defaultModel}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-border/50 shrink-0 bg-muted/5">
          <button
            type="button"
            onClick={() => setActiveTab("system_prompt")}
            className={`flex-1 py-3 text-sm font-medium transition-colors focus-visible:outline-none flex justify-center items-center gap-2 ${
              activeTab === "system_prompt"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            System Prompt
            {hasPromptChanged && <span className="h-2 w-2 rounded-full bg-orange-500"></span>}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("intent_classifier")}
            className={`flex-1 py-3 text-sm font-medium transition-colors focus-visible:outline-none flex justify-center items-center gap-2 ${
              activeTab === "intent_classifier"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Intent Classifier
            {hasIntentChanged && <span className="h-2 w-2 rounded-full bg-orange-500"></span>}
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 relative min-h-[300px]">
           {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px] z-10">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
           ) : null}

           {activeTab === "system_prompt" ? (
             <div className="space-y-4 h-full flex flex-col">
               <div className="space-y-2 flex-grow">
                 <Label htmlFor="system-prompt" className="flex justify-between items-center">
                   <span>Base System Prompt</span>
                 </Label>
                 <textarea
                   id="system-prompt"
                   name="systemPrompt"
                   className={`${TEXTAREA_CLASS} h-full min-h-[200px] leading-relaxed font-mono text-xs`}
                   value={localPrompt}
                   onChange={(e) => setLocalPrompt(e.target.value)}
                   placeholder="You are a helpful assistant..."
                 />
                 {renderConfigDetails(promptConfig)}
                 <p className="text-xs text-muted-foreground mt-2">
                   This prompt guides the general behavior and knowledge context of the assistant.
                 </p>
               </div>
             </div>
           ) : (
             <div className="space-y-4 h-full flex flex-col">
               <div className="space-y-2 flex-grow">
                 <Label htmlFor="intent-classifier" className="flex justify-between items-center">
                   <span>Intent Classifier Prompt</span>
                 </Label>
                 <textarea
                   id="intent-classifier"
                   name="intentClassifier"
                   className={`${TEXTAREA_CLASS} h-full min-h-[200px] leading-relaxed font-mono text-xs`}
                   value={localIntent}
                   onChange={(e) => setLocalIntent(e.target.value)}
                   placeholder="Analyze the following query and decide..."
                 />
                 {renderConfigDetails(intentConfig)}
                 <p className="text-xs text-muted-foreground mt-2">
                   This prompt is used as a zero-shot classifier to decide the user's intent. Do not modify the output formatting rules unless updating the schema.
                 </p>
               </div>
             </div>
           )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-border/50 bg-muted/10 shrink-0 gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Close
          </Button>
          <Button 
             type="button" 
             onClick={handleSave} 
             disabled={isSaving || (activeTab === "system_prompt" ? !hasPromptChanged : !hasIntentChanged)}
             className="min-w-[120px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Publish New Version
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
