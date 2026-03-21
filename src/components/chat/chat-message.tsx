import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTypewriter } from "@/hooks/use-typewriter";
import { Bot, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PdfViewer } from "./pdf-viewer";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatMessageProps {
  message: Message;
  animate?: boolean;
}

export function ChatMessage({ message, animate = false }: ChatMessageProps) {
  const isUser = message.role === "user";
  const { displayedText } = useTypewriter(message.content, 15, animate && !isUser);

  const contentToRender = isUser ? message.content : (animate ? displayedText : message.content);

  return (
    <div className={`flex w-full px-4 py-8 border-b border-border/10 ${isUser ? "bg-background" : "bg-muted/30"}`}>
      <div className="flex gap-4 max-w-4xl mx-auto w-full">
        <Avatar className="h-8 w-8 shrink-0 rounded-md border border-border/50 shadow-sm mt-1 text-xs">
          <AvatarFallback className={isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}>
            {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden min-w-0">
          {!isUser && animate && displayedText === "" ? (
             <div className="h-6 flex items-center">
               <span className="animate-pulse h-2 w-2 bg-primary rounded-full inline-block"></span>
             </div>
          ) : (
            <div className="prose dark:prose-invert prose-sm md:prose-base max-w-none break-words">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <div className="my-4 rounded-md overflow-hidden border shadow-sm">
                      <div className="flex items-center px-4 py-2 bg-zinc-800 text-xs text-zinc-400 font-sans border-b border-zinc-700">
                        {match[1]}
                      </div>
                      <SyntaxHighlighter
                        {...props}
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        className="m-0 !bg-zinc-950 min-w-0"
                        showLineNumbers={false}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code {...props} className="bg-muted px-1.5 py-0.5 rounded-md font-mono text-[0.85em]">
                      {children}
                    </code>
                  );
                },
                a({ node, href, children, ...props }: any) {
                  if (href?.toLowerCase().endsWith(".pdf")) {
                    return <PdfViewer url={href} />;
                  }
                  return (
                    <a href={href} className="text-primary hover:underline font-medium" target="_blank" rel="noreferrer" {...props}>
                      {children}
                    </a>
                  );
                },
                table({ children, ...props }: any) {
                  return (
                    <div className="overflow-x-auto my-6 border rounded-lg shadow-sm">
                      <table className="w-full border-collapse text-sm m-0" {...props}>{children}</table>
                    </div>
                  );
                },
                th({ children, ...props }: any) {
                   return <th className="border-b bg-muted/50 p-3 text-left font-semibold text-foreground m-0" {...props}>{children}</th>;
                },
                td({ children, ...props }: any) {
                   return <td className="border-b border-border/50 p-3 last:border-0 text-muted-foreground m-0" {...props}>{children}</td>;
                },
                p({ children, ...props }: any) {
                   return <p className="leading-7 [&:not(:first-child)]:mt-4 m-0" {...props}>{children}</p>;
                }
              }}
            >
                {contentToRender}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
