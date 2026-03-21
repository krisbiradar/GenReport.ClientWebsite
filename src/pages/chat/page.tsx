import React, { useState, useEffect, useRef } from "react";
import { Message, ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";

// Mock AI endpoint
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
    }, 800);
  });
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I am your AI assistant. I can render **Markdown**, `code` blocks, tables, and embed `.pdf` documents.\n\nTry asking me for 'code', 'table', or 'pdf'!"
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
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-screen w-full bg-background relative font-sans">
      
      {/* Header - Subtle Gemini style Top Content */}
      <div className="flex flex-col px-6 pt-12 pb-2 shrink-0 max-w-4xl mx-auto w-full">
        {messages.length <= 1 && (
          <div className="mt-8 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/50">
              Hello, Kris
            </h1>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-muted-foreground mt-3">
              How can I help you today?
            </h2>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto w-full relative scroll-smooth">
        <div className="flex flex-col gap-2 pb-40 pt-4 max-w-4xl mx-auto">
          {messages.map((m, i) => (
            <ChatMessage 
              key={m.id} 
              message={m} 
              animate={m.role === "assistant" && i === messages.length - 1} 
            />
          ))}
          <div ref={messagesEndRef} className="h-8" />
        </div>
      </div>

      {/* Input container placed at the bottom, floating style */}
      <div className="absolute bottom-0 w-full bg-gradient-to-t from-background via-background/95 to-transparent pt-12 pb-6 px-4 pointer-events-none">
        <div className="pointer-events-auto">
          <ChatInput onSend={handleSend} disabled={isGenerating} />
          <p className="text-center text-[12px] text-muted-foreground mt-4 font-medium max-w-2xl mx-auto">
            AI generated responses can make mistakes. Check important information.
          </p>
        </div>
      </div>
      
    </div>
  );
}
