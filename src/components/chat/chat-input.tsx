import React, { useRef, useEffect, useState } from "react";
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
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

  return (
    <div className="relative w-full max-w-4xl mx-auto flex items-end p-2 bg-background border border-border shadow-sm rounded-xl focus-within:ring-1 focus-within:ring-ring transition-shadow">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message..."
        disabled={disabled}
        className="w-full bg-transparent border-0 resize-none max-h-[200px] px-3 py-2 text-sm focus:outline-none focus:ring-0 disabled:opacity-50"
        rows={1}
      />
      <Button 
        size="icon" 
        onClick={handleSend} 
        disabled={disabled || !input.trim()}
        className="h-8 w-8 shrink-0 rounded-lg ml-2 mb-1"
      >
        <SendHorizontal className="h-4 w-4" />
      </Button>
    </div>
  );
}
