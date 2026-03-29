import React, { useRef, useEffect, useState } from "react";
import { SendHorizontal, Paperclip, ChevronDown, Cpu, Sparkles, Bot, Brain, X, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiModel } from "@/utils/services/ai-model-service";
import { AiConnection } from "@/utils/services/ai-connection-service";

import { container } from "@/utils/di/inversify.config";
import StorageService from "@/utils/services/storage-service";

const storageService = container.get(StorageService);

export interface UploadedFileData {
  url: string;
  fileName: string;
  contentType: string;
}

export interface UploadedFileState {
  file: File;
  url?: string;
  contentType?: string;
  isUploading: boolean;
  error?: string;
}

interface ChatInputProps {
  onSend: (message: string, files?: UploadedFileData[]) => void;
  disabled?: boolean;
  models?: AiModel[];
  selectedModelId?: string;
  onModelChange?: (id: string) => void;
  isLoadingModels?: boolean;
  // Provider selector
  providers?: AiConnection[];
  selectedProviderId?: string | null;
  onProviderChange?: (id: string) => void;
  isLoadingProviders?: boolean;
  isGenerating?: boolean;
  onStop?: () => void;
}

function ProviderIcon({ provider, className = "h-3.5 w-3.5" }: { provider: string; className?: string }) {
  const p = provider?.toLowerCase() ?? "";
  if (p.includes("anthropic")) return <Cpu className={className} />;
  if (p.includes("gemini"))    return <Sparkles className={className} />;
  if (p.includes("ollama"))    return <Bot className={className} />;
  return <Brain className={className} />;
}

export function ChatInput({
  onSend,
  disabled,
  models = [],
  selectedModelId = "",
  onModelChange,
  isLoadingModels = false,
  providers = [],
  selectedProviderId = null,
  onProviderChange,
  isLoadingProviders = false,
  isGenerating = false,
  onStop,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<UploadedFileState[]>([]);
  const [providerOpen, setProviderOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const providerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Close provider dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (providerRef.current && !providerRef.current.contains(e.target as Node)) {
        setProviderOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const newUploads = newFiles.map(file => ({ file, isUploading: true }));
      
      setFiles(prev => [...prev, ...newUploads]);

      for (const newUpload of newUploads) {
        try {
          const res = await storageService.uploadFile(newUpload.file);
          if (res.successResponse?.data) {
             const data = res.successResponse.data;
             setFiles(prev => prev.map(f => f.file === newUpload.file ? { ...f, isUploading: false, url: data.url, contentType: data.contentType || f.file.type } : f));
          } else {
             setFiles(prev => prev.filter(f => f.file !== newUpload.file));
          }
        } catch (err) {
           setFiles(prev => prev.filter(f => f.file !== newUpload.file));
        }
      }
    }
    if (e.target) e.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    const isUploadingAny = files.some(f => f.isUploading);
    if ((input.trim() || files.length > 0) && !disabled && !isUploadingAny) {
      const validFiles: UploadedFileData[] = files
        .filter(f => f.url && !f.error)
        .map(f => ({ url: f.url!, fileName: f.file.name, contentType: f.contentType || f.file.type }));
      onSend(input, validFiles);
      setInput("");
      setFiles([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectedProvider = providers.find((p) => String(p.id) === selectedProviderId);
  const providerLabel = selectedProvider
    ? selectedProvider.provider
    : isLoadingProviders
    ? "Loading..."
    : providers.length > 0
    ? providers[0].provider
    : "Default";

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col bg-muted/30 backdrop-blur-xl border shadow-sm rounded-[28px] focus-within:bg-background focus-within:ring-2 focus-within:ring-border focus-within:shadow-md transition-all duration-300">

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 pt-3 pb-1">
          {files.map((fileObj, i) => (
            <div key={i} className={`flex items-center gap-1.5 bg-muted rounded-md px-2.5 py-1.5 text-xs shadow-sm border ${fileObj.error ? 'border-destructive/50 text-destructive' : 'border-border/50'}`}>
              <span className="truncate max-w-[150px] font-medium text-foreground/80" title={fileObj.error || fileObj.file.name}>
                {fileObj.file.name}
              </span>
              {fileObj.isUploading && <span className="animate-pulse h-2 w-2 bg-primary rounded-full ml-1" />}
              <button
                type="button"
                className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                onClick={() => handleRemoveFile(i)}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Text row */}
      <div className="flex items-end px-2 pt-2 pb-1 md:px-3 md:pt-3">
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full text-muted-foreground hover:text-foreground mb-0.5 ml-1 hidden sm:flex"
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <input
          type="file"
          multiple
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask GenReport or type a prompt..."
          disabled={disabled}
          className="flex-1 bg-transparent border-0 resize-none max-h-[200px] px-4 py-2.5 text-[15px] focus:outline-none focus:ring-0 disabled:opacity-50 leading-relaxed placeholder:text-muted-foreground/70"
          rows={1}
        />
      </div>

      {/* Bottom toolbar row */}
      <div className="flex items-center justify-between px-3 pb-2.5 pt-0.5 gap-2">

        {/* Left pills: Provider + Model */}
        <div className="flex items-center gap-2 min-w-0">

          {/* ── Provider dropdown ── */}
          <div className="relative" ref={providerRef}>
            <button
              type="button"
              disabled={providers.length === 0 || isLoadingProviders}
              onClick={() => setProviderOpen((o) => !o)}
              className={`
                inline-flex items-center gap-1.5 h-8 pl-2.5 pr-2 rounded-full
                bg-primary/10 hover:bg-primary/15 text-primary
                text-xs font-semibold border border-primary/20 hover:border-primary/30
                cursor-pointer transition-all focus:outline-none focus:ring-1 focus:ring-primary/40
                disabled:opacity-50 disabled:cursor-not-allowed
                ${providerOpen ? "bg-primary/15 border-primary/30" : ""}
              `}
            >
              {selectedProvider && (
                <ProviderIcon provider={selectedProvider.provider} className="h-3.5 w-3.5 shrink-0" />
              )}
              <span className="max-w-[100px] truncate">{providerLabel}</span>
              <ChevronDown
                className={`h-3 w-3 shrink-0 transition-transform duration-200 ${providerOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown panel */}
            {providerOpen && providers.length > 0 && (
              <div className="absolute bottom-full mb-2 left-0 z-50 min-w-[180px] bg-popover border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
                <div className="p-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1">
                    Provider
                  </p>
                  {providers.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        onProviderChange?.(String(p.id));
                        setProviderOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left text-sm transition-colors
                        ${
                          String(p.id) === selectedProviderId
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-foreground hover:bg-muted"
                        }
                      `}
                    >
                      <span className={`${String(p.id) === selectedProviderId ? "text-primary" : "text-muted-foreground"}`}>
                        <ProviderIcon provider={p.provider} className="h-4 w-4" />
                      </span>
                      <span className="flex-1 truncate">{p.provider}</span>
                      {p.isDefault && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-primary/60 bg-primary/10 rounded px-1 py-0.5">
                          Default
                        </span>
                      )}
                      {String(p.id) === selectedProviderId && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Model selector ── */}
          <div className="relative">
            <select
              value={selectedModelId}
              onChange={(e) => onModelChange?.(e.target.value)}
              disabled={models.length === 0}
              className="appearance-none h-8 pl-3 pr-7 max-w-[140px] sm:max-w-[200px] truncate rounded-full bg-muted/50 hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground border border-transparent hover:border-border cursor-pointer transition-all focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
            >
              {isLoadingModels && <option value="">Loading models...</option>}
              {!isLoadingModels && models.length === 0 && <option value="">No models available</option>}
              {models.map((m) => (
                <option key={m.id} value={m.id} className="bg-background text-foreground">
                  {m.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>

        {/* Send or Stop button */}
        {isGenerating ? (
          <Button
            type="button"
            size="icon"
            onClick={onStop}
            className="h-9 w-9 shrink-0 rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive shadow-sm transition-transform"
          >
            <Square className="h-4 w-4 fill-current" />
          </Button>
        ) : input.trim() || files.length > 0 ? (
          <Button
            type="button"
            size="icon"
            onClick={handleSend}
            disabled={disabled || files.some(f => f.isUploading)}
            className="h-9 w-9 shrink-0 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-transform"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={true}
            className="h-9 w-9 shrink-0 rounded-full text-muted-foreground/40 cursor-not-allowed"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
