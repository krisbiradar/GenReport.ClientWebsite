import React, { useState, useEffect, useRef } from "react";
import { Message, ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { Bot } from "lucide-react";

// Mock AI endpoint or service interaction
const generateMockResponse = async (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let response = `I understand you said: "${prompt}".\n\n`;
      if (prompt.toLowerCase().includes("code")) {
        response += `Here is some test code to show colored highlighting:\n\n\`\`\`javascript\nconst hello = "world";\nconsole.log(hello);\nfunction test() {\n  return true;\n}\n\`\`\`\n`;
      }
      if (prompt.toLowerCase().includes("table")) {
        response += `Here is a sample table:\n\n| ID | Name | Role |\n|---|---|---|\n| 1 | Kris | Default User |\n| 2 | Bot | Assistant |\n`;
      }
      if (prompt.toLowerCase().includes("pdf")) {
        response += `Take a look at this document:\n\n[Sample PDF](https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf)\n`;
      }
      if (!prompt.toLowerCase().includes("code") && !prompt.toLowerCase().includes("table") && !prompt.toLowerCase().includes("pdf")) {
        response += `This demonstrates the **typewriter** effect. Try asking me for \`code\`, a \`table\`, or a \`pdf\`!`;
      }
      resolve(response);
    }, 1000); // 1s simulation delay
  });
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I am your AI assistant. I can render **Markdown**, `code` blocks, tables, and even embed `.pdf` documents if you link them. Try asking me for 'code', 'table', or 'pdf'!"
    }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (content: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);

    try {
      const responseContent = await generateMockResponse(content);
      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: responseContent };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-screen w-full bg-muted/10">
      
      {/* Header */}
      <div className="flex items-center px-6 py-4 border-b border-border/50 bg-background/95 backdrop-blur shrink-0 shadow-sm z-10 sticky top-0">
        <Bot className="h-6 w-6 text-primary mr-3" />
        <div>
          <h1 className="text-lg font-semibold tracking-tight">AI Assistant Chat</h1>
          <p className="text-xs text-muted-foreground">Experimenting with typewriter effects, code, & PDFs.</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto w-full relative">
        <div className="divide-y divide-border/10 pb-32">
          {messages.map((m, i) => (
            <ChatMessage 
              key={m.id} 
              message={m} 
              // Only animate the very last assistant message if it just arrived
              animate={m.role === "assistant" && i === messages.length - 1} 
            />
          ))}
          {/* Invisible ref for auto scrolling */}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input container placed at the bottom */}
      <div className="absolute bottom-0 w-full bg-gradient-to-t from-background via-background to-transparent pt-6 pb-6 px-4">
        <ChatInput onSend={handleSend} disabled={isGenerating} />
        <p className="text-center text-[10px] text-muted-foreground mt-2">
          AI generated responses can make mistakes. Check important information.
        </p>
      </div>
      
    </div>
  );
}
