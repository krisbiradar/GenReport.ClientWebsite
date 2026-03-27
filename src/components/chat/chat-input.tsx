import React, { useRef, useEffect, useState } from "react";
import { SendHorizontal, Paperclip, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiModel } from "@/utils/services/ai-model-service";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  models?: AiModel[];
  selectedModelId?: string;
  onModelChange?: (id: string) => void;
  isLoadingModels?: boolean;
}

export function ChatInput({ onSend, disabled, models = [], selectedModelId = "", onModelChange, isLoadingModels = false }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input);
      setInput("");
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

  const selectedModel = models.find((m) => m.id === selectedModelId);
  const modelLabel = selectedModel ? selectedModel.name : isLoadingModels ? "Loading..." : "No models";

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col bg-muted/30 backdrop-blur-xl border shadow-sm rounded-[28px] focus-within:bg-background focus-within:ring-2 focus-within:ring-border focus-within:shadow-md transition-all duration-300">

      {/* Text row */}
      <div className="flex items-end px-2 pt-2 pb-1 md:px-3 md:pt-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full text-muted-foreground hover:text-foreground mb-0.5 ml-1 hidden sm:flex"
        >
          <Paperclip className="h-5 w-5" />
        </Button>

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

      {/* Bottom toolbar row — model selector left, send button right */}
      <div className="flex items-center justify-between px-3 pb-2.5 pt-0.5">
        {/* Model pill */}
        <div className="relative">
          <select
            value={selectedModelId}
            onChange={(e) => onModelChange?.(e.target.value)}
            disabled={models.length === 0}
            className="appearance-none h-8 pl-3 pr-7 max-w-[160px] sm:max-w-[240px] truncate rounded-full bg-muted/50 hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground border border-transparent hover:border-border cursor-pointer transition-all focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
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

        {/* Send button */}
        {input.trim() ? (
          <Button
            size="icon"
            onClick={handleSend}
            disabled={disabled}
            className="h-9 w-9 shrink-0 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-transform"
          >
            <SendHorizontal className="h-4.5 w-4.5 h-4 w-4" />
          </Button>
        ) : (
          <Button
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
