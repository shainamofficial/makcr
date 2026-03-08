import { useRef, useEffect, ReactNode } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot } from "lucide-react";
import type { ChatMessage } from "@/lib/chat-service";

interface ChatMessagesProps {
  messages: ChatMessage[];
  userInitial: string;
  isTyping: boolean;
  children?: ReactNode; // For inline widgets (photo upload, completion banner)
}

const TypingIndicator = () => (
  <div className="flex items-start gap-3">
    <Avatar className="h-8 w-8 shrink-0">
      <AvatarFallback className="bg-muted text-muted-foreground">
        <Bot className="h-4 w-4" />
      </AvatarFallback>
    </Avatar>
    <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
      <div className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  </div>
);

const ChatMessages = ({ messages, userInitial, isTyping, children }: ChatMessagesProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, children]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {messages.map((msg) => {
        const isUser = msg.role === "user";
        return (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback
                className={
                  isUser
                    ? "bg-primary text-primary-foreground text-xs"
                    : "bg-muted text-muted-foreground"
                }
              >
                {isUser ? userInitial : <Bot className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                isUser
                  ? "rounded-tr-sm bg-primary text-primary-foreground"
                  : "rounded-tl-sm bg-muted text-foreground"
              }`}
            >
              {msg.content}
            </div>
          </div>
        );
      })}
      {isTyping && <TypingIndicator />}
      {children}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessages;
