import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Sparkles, Paperclip } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { PdfViewer } from "./pdf-viewer";
import type { UIMessage } from "ai";

interface ChatMessageProps {
  message: UIMessage;
  animate?: boolean;
}

function getTextContent(message: UIMessage): string {
  if (message.parts) {
    return message.parts
      .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
      .map((p) => p.text)
      .join("");
  }
  return (message as any).text || (message as any).content || "";
}

export function ChatMessage({ message, animate = false }: ChatMessageProps) {
  const isUser = message.role === "user";
  const rawContent = getTextContent(message);
  const contentToRender = rawContent;

  return (
    <div className={`flex w-full px-4 md:px-8 py-2 md:py-4 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-4 w-full max-w-4xl ${isUser ? "justify-end" : "justify-start"}`}>

        {!isUser && (
          <Avatar className="h-8 w-8 shrink-0 rounded-full border border-primary/20 bg-primary/10 shadow-sm mt-1.5 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </Avatar>
        )}

        <div className={`overflow-hidden min-w-0 ${isUser ? "max-w-[85%] sm:max-w-[70%] bg-muted/60 text-foreground px-5 py-3.5 rounded-[24px] rounded-tr-md shadow-sm" : "flex-1 px-1 py-1"}`}>
          {isUser && (message as any).experimental_attachments && (message as any).experimental_attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {(message as any).experimental_attachments.map((a: any, i: number) => (
                <div key={i} className="flex items-center gap-2 bg-background/50 rounded-lg p-2 text-xs border border-border/50 shadow-sm max-w-[200px]">
                  {a.contentType?.startsWith('image/') ? (
                    <img src={a.url} alt={a.name || "Attachment"} className="h-10 w-10 object-cover rounded-md shrink-0" />
                  ) : (
                    <div className="h-10 w-10 bg-muted/80 flex items-center justify-center rounded-md shrink-0">
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <span className="truncate font-medium text-foreground/80">{a.name || "Attached File"}</span>
                </div>
              ))}
            </div>
          )}
          {!isUser && animate && rawContent === "" ? (
            <div className="h-6 flex items-center space-x-1 mt-2">
              <span className="animate-bounce h-2 w-2 bg-primary/60 rounded-full inline-block" style={{ animationDelay: "0ms" }} />
              <span className="animate-bounce h-2 w-2 bg-primary/60 rounded-full inline-block" style={{ animationDelay: "150ms" }} />
              <span className="animate-bounce h-2 w-2 bg-primary/60 rounded-full inline-block" style={{ animationDelay: "300ms" }} />
            </div>
          ) : (
            <div className={`prose dark:prose-invert prose-sm md:prose-base max-w-none break-words ${isUser ? "prose-p:leading-relaxed prose-p:my-0 text-[15px]" : "text-[15px] leading-7"}`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <div className="my-5 rounded-xl overflow-hidden border shadow-sm">
                        <div className="flex items-center px-4 py-2 bg-zinc-800 text-xs text-zinc-400 font-sans border-b border-zinc-700">
                          {match[1]}
                        </div>
                        <SyntaxHighlighter
                          {...props}
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          className="m-0 !bg-zinc-950 min-w-0 text-[13px] leading-relaxed p-4"
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
                      <div className="overflow-x-auto my-6 border rounded-xl shadow-sm">
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
                    return <p className={`m-0 ${!isUser ? "[&:not(:first-child)]:mt-5" : ""}`} {...props}>{children}</p>;
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
