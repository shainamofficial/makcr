import { useRef, useEffect, useCallback, ReactNode } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { ChatMessage } from "@/lib/chat-service";

interface ChatMessagesProps {
  messages: ChatMessage[];
  userInitial: string;
  isTyping: boolean;
  children?: ReactNode;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
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

const ChatMessages = ({ messages, userInitial, isTyping, children, onLoadMore, hasMore, loadingMore }: ChatMessagesProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const isInitialLoadRef = useRef(true);

  // Auto-scroll to bottom on new messages (not when loading older ones)
  useEffect(() => {
    if (!loadingMore) {
      bottomRef.current?.scrollIntoView({ behavior: isInitialLoadRef.current ? "instant" : "smooth" });
      isInitialLoadRef.current = false;
    }
  }, [messages, isTyping, children, loadingMore]);

  // Preserve scroll position after prepending older messages
  useEffect(() => {
    if (prevScrollHeightRef.current > 0 && scrollContainerRef.current) {
      const newScrollHeight = scrollContainerRef.current.scrollHeight;
      scrollContainerRef.current.scrollTop = newScrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = 0;
    }
  }, [messages]);

  // IntersectionObserver for scroll-to-top loading
  const handleLoadMore = useCallback(() => {
    if (onLoadMore && hasMore && !loadingMore && scrollContainerRef.current) {
      prevScrollHeightRef.current = scrollContainerRef.current.scrollHeight;
      onLoadMore();
    }
  }, [onLoadMore, hasMore, loadingMore]);

  useEffect(() => {
    const sentinel = topSentinelRef.current;
    if (!sentinel || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { root: scrollContainerRef.current, threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleLoadMore, onLoadMore]);

  return (
    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4">
      {hasMore && (
        <div ref={topSentinelRef} className="flex justify-center py-2">
          {loadingMore && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
        </div>
      )}
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
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm leading-relaxed ${
                isUser
                  ? "rounded-tr-sm bg-primary text-primary-foreground"
                  : "rounded-tl-sm bg-muted text-foreground"
              }`}
            >
              {isUser ? (
                <span className="whitespace-pre-wrap">{msg.content}</span>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1 [&>li]:my-0.5">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              )}
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
