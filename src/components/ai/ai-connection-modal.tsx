import React, { useState } from "react";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AiConnectionService, {
  AiConnection,
  CreateAiConnectionRequest,
  UpdateAiConnectionRequest,
  TestAiConnectionRequest,
} from "@/utils/services/ai-connection-service";
import { AiProviderModel } from "@/utils/services/ai-connection-service";
import { container } from "@/utils/di/inversify.config";
import { showPopup } from "@/utils/helpers/popup-helper";

interface AiConnectionModalProps {
  connection: AiConnection | null;
  onClose: (wasSaved: boolean) => void;
}

type ActiveTab = "core" | "advanced";

const PROVIDER_OPTIONS = [
  { value: "OpenAI", label: "OpenAI" },
  { value: "Anthropic", label: "Anthropic" },
  { value: "Gemini", label: "Gemini" },
  { value: "Ollama", label: "Ollama" },
];

const INPUT_CLASS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const TEXTAREA_CLASS =
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none";

export function AiConnectionModal({ connection, onClose }: AiConnectionModalProps) {
  const isEditing = !!connection;
  const aiService = container.get(AiConnectionService);

  const [activeTab, setActiveTab] = useState<ActiveTab>("core");
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isTestSuccessful, setIsTestSuccessful] = useState(isEditing);
  const [showApiKey, setShowApiKey] = useState(false);
  const [availableModels, setAvailableModels] = useState<AiProviderModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const [formData, setFormData] = useState({
    provider: connection?.provider ?? "OpenAI",
    apiKey: "",
    defaultModel: connection?.defaultModel ?? "",
    isActive: connection?.isActive ?? true,
    systemPrompt: connection?.systemPrompt ?? "",
    temperature: connection?.temperature?.toString() ?? "",
    maxTokens: connection?.maxTokens?.toString() ?? "",
    rateLimitRpm: connection?.rateLimitRpm?.toString() ?? "",
    rateLimitTpm: connection?.rateLimitTpm?.toString() ?? "",
    costPer1kInputTokens: connection?.costPer1kInputTokens?.toString() ?? "",
    costPer1kOutputTokens: connection?.costPer1kOutputTokens?.toString() ?? "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    if (name === "provider" || name === "apiKey" || name === "defaultModel") {
      setIsTestSuccessful(false);
    }
  };

  const parseOptionalNumber = (val: string): number | undefined =>
    val.trim() === "" ? undefined : Number(val);

  React.useEffect(() => {
    const fetchModels = async () => {
      const provider = formData.provider;
      if (!provider) {
        setAvailableModels([]);
        return;
      }

      if (provider.toLowerCase() === "ollama") {
        setAvailableModels([]);
        return;
      }

      setIsLoadingModels(true);
      try {
        const response = await aiService.getModels(provider);
        if (response.successResponse?.data) {
          setAvailableModels(response.successResponse.data);
        } else {
          setAvailableModels([]);
        }
      } catch (error) {
        console.error("Failed to fetch models", error);
        setAvailableModels([]);
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchModels();
  }, [formData.provider]);

  const handleTestConnection = async () => {
    if (!formData.provider) {
      showPopup({ title: "Validation", body: "Please select a provider.", type: "error" });
      return;
    }
    if (!formData.apiKey.trim()) {
      const msg = isEditing 
        ? "Please enter the API Key to test the connection (key is not saved unless you click Save)."
        : "API Key is required.";
      showPopup({ title: "Validation", body: msg, type: "error" });
      return;
    }
    if (!formData.defaultModel.trim()) {
      showPopup({ title: "Validation", body: "Default model is required.", type: "error" });
      return;
    }

    setIsTesting(true);
    
    try {
      const req: TestAiConnectionRequest = {
        provider: formData.provider,
        apiKey: formData.apiKey,
        defaultModel: formData.defaultModel,
      };

      const res = await aiService.testConnection(req);

      if (res?.successResponse) {
        setIsTestSuccessful(true);
        showPopup({
          title: "Test Successful",
          body: "Successfully connected to the LLM provider.",
          type: "success"
        });
      } else {
        showPopup({
          title: "Test Failed",
          body: res?.errorResponse?.message ?? "Failed to connect to the LLM provider.",
          type: "error"
        });
      }
    } catch (err: any) {
      showPopup({
        title: "Test Failed",
        body: err?.message || "A network error occurred.",
        type: "error"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.provider) {
      showPopup({ title: "Validation", body: "Please select a provider.", type: "error" });
      return;
    }
    if (!isEditing && !formData.apiKey.trim()) {
      showPopup({ title: "Validation", body: "API Key is required.", type: "error" });
      return;
    }
    if (!formData.defaultModel.trim()) {
      showPopup({ title: "Validation", body: "Default model is required.", type: "error" });
      return;
    }

    setIsSaving(true);
    try {
      let res: any;
      if (isEditing) {
        const req: UpdateAiConnectionRequest = {
          ...(formData.apiKey.trim() && { apiKey: formData.apiKey }),
          defaultModel: formData.defaultModel,
          systemPrompt: formData.systemPrompt || undefined,
          temperature: parseOptionalNumber(formData.temperature),
          maxTokens: parseOptionalNumber(formData.maxTokens),
          rateLimitRpm: parseOptionalNumber(formData.rateLimitRpm),
          rateLimitTpm: parseOptionalNumber(formData.rateLimitTpm),
          costPer1kInputTokens: parseOptionalNumber(formData.costPer1kInputTokens),
          costPer1kOutputTokens: parseOptionalNumber(formData.costPer1kOutputTokens),
          isActive: formData.isActive,
        };
        res = await aiService.updateConnection(connection!.id, req);
      } else {
        const req: CreateAiConnectionRequest = {
          provider: formData.provider,
          apiKey: formData.apiKey,
          defaultModel: formData.defaultModel,
          systemPrompt: formData.systemPrompt || undefined,
          temperature: parseOptionalNumber(formData.temperature),
          maxTokens: parseOptionalNumber(formData.maxTokens),
          rateLimitRpm: parseOptionalNumber(formData.rateLimitRpm),
          rateLimitTpm: parseOptionalNumber(formData.rateLimitTpm),
          costPer1kInputTokens: parseOptionalNumber(formData.costPer1kInputTokens),
          costPer1kOutputTokens: parseOptionalNumber(formData.costPer1kOutputTokens),
          isActive: formData.isActive,
        };
        res = await aiService.createConnection(req);
      }

      if (res?.successResponse) {
        showPopup({
          title: "Success",
          body: `AI provider ${isEditing ? "updated" : "created"} successfully.`,
          type: "success",
        });
        onClose(true);
      } else {
        showPopup({
          title: "Error",
          body: res?.errorResponse?.message ?? "Failed to save provider.",
          type: "error",
        });
      }
    } catch {
      showPopup({ title: "Error", body: "A network error occurred.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-card rounded-xl shadow-2xl border border-border/50 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/10 shrink-0">
          <h2 className="text-xl font-semibold">
            {isEditing ? `Edit — ${connection.provider}` : "Add AI Provider"}
          </h2>
          <Button variant="ghost" size="icon" onClick={() => onClose(false)} className="h-8 w-8 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-border/50 shrink-0">
          {(["core", "advanced"] as ActiveTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-sm font-medium capitalize transition-colors focus-visible:outline-none ${
                activeTab === tab
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "core" ? "Core Settings" : "Advanced"}
            </button>
          ))}
        </div>

        {/* Body */}
        <form id="ai-connection-form" onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-6 space-y-4">

            {/* ── Core Tab ── */}
            {activeTab === "core" && (
              <>
                {/* Provider */}
                <div className="space-y-2">
                  <Label htmlFor="ai-provider">Provider</Label>
                  <select
                    id="ai-provider"
                    name="provider"
                    value={formData.provider}
                    onChange={handleChange}
                    disabled={isEditing}
                    className={INPUT_CLASS}
                  >
                    {PROVIDER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {isEditing && (
                    <p className="text-xs text-muted-foreground">Provider cannot be changed after creation.</p>
                  )}
                </div>

                {/* API Key */}
                <div className="space-y-2">
                  <Label htmlFor="ai-api-key">API Key</Label>
                  <div className="relative">
                    <Input
                      id="ai-api-key"
                      name="apiKey"
                      type={showApiKey ? "text" : "password"}
                      placeholder={isEditing ? "Leave blank to keep existing key" : "sk-..."}
                      value={formData.apiKey}
                      onChange={handleChange}
                      className="pr-10"
                      required={!isEditing}
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Default Model */}
                <div className="space-y-2">
                  <Label htmlFor="ai-default-model">Default Model</Label>
                  {formData.provider.toLowerCase() === "ollama" ? (
                    <Input
                      id="ai-default-model"
                      name="defaultModel"
                      placeholder="e.g. llama3"
                      value={formData.defaultModel}
                      onChange={handleChange}
                      required
                    />
                  ) : (
                    <div className="relative">
                      <select
                        id="ai-default-model"
                        name="defaultModel"
                        value={formData.defaultModel}
                        onChange={handleChange}
                        disabled={isLoadingModels || availableModels.length === 0}
                        className={INPUT_CLASS}
                        required
                      >
                        <option value="" disabled>
                          {isLoadingModels
                            ? "Loading models..."
                            : availableModels.length === 0
                            ? "No models available"
                            : "Select a model"}
                        </option>
                        {availableModels.map((model) => (
                          <option key={model.modelId} value={model.modelId}>
                            {model.modelName}
                          </option>
                        ))}
                      </select>
                      {isLoadingModels && (
                        <div className="absolute right-8 top-1/2 -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Active toggle */}
                <div className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3 bg-muted/10">
                  <div>
                    <p className="text-sm font-medium">Active</p>
                    <p className="text-xs text-muted-foreground">Enable this provider for use in reports.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={formData.isActive}
                    onClick={() => setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                      formData.isActive ? "bg-primary" : "bg-input"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                        formData.isActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </>
            )}

            {/* ── Advanced Tab ── */}
            {activeTab === "advanced" && (
              <>
                {/* System Prompt */}
                <div className="space-y-2">
                  <Label htmlFor="ai-system-prompt">System Prompt</Label>
                  <textarea
                    id="ai-system-prompt"
                    name="systemPrompt"
                    rows={4}
                    placeholder="You are a helpful assistant..."
                    value={formData.systemPrompt}
                    onChange={handleChange}
                    className={TEXTAREA_CLASS}
                  />
                </div>

                {/* Temperature + Max Tokens */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ai-temperature">Temperature</Label>
                    <Input
                      id="ai-temperature"
                      name="temperature"
                      type="number"
                      min={0}
                      max={2}
                      step={0.1}
                      placeholder="0.7"
                      value={formData.temperature}
                      onChange={handleChange}
                    />
                    <p className="text-xs text-muted-foreground">Range: 0 – 2</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ai-max-tokens">Max Tokens</Label>
                    <Input
                      id="ai-max-tokens"
                      name="maxTokens"
                      type="number"
                      min={1}
                      placeholder="4096"
                      value={formData.maxTokens}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Rate Limits */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Rate Limits
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ai-rpm">Requests / min (RPM)</Label>
                      <Input
                        id="ai-rpm"
                        name="rateLimitRpm"
                        type="number"
                        min={0}
                        placeholder="60"
                        value={formData.rateLimitRpm}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ai-tpm">Tokens / min (TPM)</Label>
                      <Input
                        id="ai-tpm"
                        name="rateLimitTpm"
                        type="number"
                        min={0}
                        placeholder="90000"
                        value={formData.rateLimitTpm}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Cost Tracking */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Cost Tracking
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ai-cost-input">Cost / 1k Input Tokens ($)</Label>
                      <Input
                        id="ai-cost-input"
                        name="costPer1kInputTokens"
                        type="number"
                        min={0}
                        step={0.0001}
                        placeholder="0.0030"
                        value={formData.costPer1kInputTokens}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ai-cost-output">Cost / 1k Output Tokens ($)</Label>
                      <Input
                        id="ai-cost-output"
                        name="costPer1kOutputTokens"
                        type="number"
                        min={0}
                        step={0.0001}
                        placeholder="0.0060"
                        value={formData.costPer1kOutputTokens}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/10 shrink-0">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handleTestConnection} 
            disabled={isSaving || isTesting}
          >
            {isTesting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing…
              </>
            ) : "Test Connection"}
          </Button>
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={() => onClose(false)} disabled={isSaving || isTesting}>
              Cancel
            </Button>
            <Button type="submit" form="ai-connection-form" disabled={isSaving || isTesting || !isTestSuccessful}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                isEditing ? "Save Changes" : "Add Provider"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
