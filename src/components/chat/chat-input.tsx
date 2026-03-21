import React, { useRef, useEffect, useState } from "react";
import { SendHorizontal, Paperclip, Mic } from "lucide-react";
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
    <div className="relative w-full max-w-4xl mx-auto flex items-end p-2 md:p-3 bg-muted/30 backdrop-blur-xl border shadow-sm rounded-[32px] focus-within:bg-background focus-within:ring-2 focus-within:ring-border focus-within:shadow-md transition-all duration-300">
      
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

      {input.trim() ? (
        <Button 
          size="icon" 
          onClick={handleSend} 
          disabled={disabled}
          className="h-10 w-10 shrink-0 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-transform mb-0.5 mr-1"
        >
          <SendHorizontal className="h-5 w-5" />
        </Button>
      ) : (
        <Button 
          variant="ghost" 
          size="icon" 
          disabled={disabled}
          className="h-10 w-10 shrink-0 rounded-full text-muted-foreground hover:text-foreground mb-0.5 mr-1"
        >
          <Mic className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
