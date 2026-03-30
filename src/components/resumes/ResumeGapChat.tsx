import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Send, Loader2, FileCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import MultiQuestionForm, { type StructuredQuestion } from "@/components/interview/MultiQuestionForm";

interface Props {
  sessionId: string;
  userId: string;
  onClose: () => void;
  onGenerateResume: () => void;
}

interface Message {
  id: string;
  role: string;
  content: string;
  structured_data_extracted?: any;
}

export default function ResumeGapChat({ sessionId, userId, onClose, onGenerateResume }: Props) {
  const { session: authSession } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [pendingQuestions, setPendingQuestions] = useState<StructuredQuestion[] | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load existing messages
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("chat_message")
        .select("id, role, content, structured_data_extracted")
        .eq("chat_session_id", sessionId)
        .order("created_at", { ascending: true });
      if (data) {
        setMessages(data);
        // Restore pending questions from last assistant message
        const lastAssistant = [...data].reverse().find((m: Message) => m.role === "assistant");
        const stored = lastAssistant?.structured_data_extracted as any;
        if (stored?.questions && Array.isArray(stored.questions) && stored.questions.length > 0) {
          setPendingQuestions(stored.questions);
        }
      }
      setInitialLoading(false);
    })();
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingQuestions]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;
    setInput("");
    setPendingQuestions(null);

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [...prev, { id: tempId, role: "user", content }]);

    // Save user message
    await supabase.from("chat_message").insert({
      chat_session_id: sessionId,
      role: "user",
      content,
    });

    setLoading(true);
    try {
      const response = await fetch(
        `https://tnosyowzngwbwgmxtioh.supabase.co/functions/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authSession?.access_token}`,
          },
          body: JSON.stringify({ message: content, sessionId, userId }),
        }
      );

      if (!response.ok) throw new Error("Chat failed");

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { id: `ai-${Date.now()}`, role: "assistant", content: data.message },
      ]);

      // Handle structured questions
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        setPendingQuestions(data.questions as StructuredQuestion[]);
      }

      // If the AI says gap analysis is done
      if (data.currentTopic === "completed" || data.currentTopic === "resume_ready") {
        setIsComplete(true);
      }
    } catch {
      toast({ title: "Failed to get response", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputSend = () => {
    sendMessage(input.trim());
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl h-[90vh] sm:h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Resume Gap Analysis</DialogTitle>
        </DialogHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 py-2">
          {initialLoading ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground py-8">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading conversation...</span>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "max-w-[80%] rounded-lg px-4 py-2 text-sm",
                    msg.role === "assistant"
                      ? "bg-muted text-foreground mr-auto"
                      : "bg-primary text-primary-foreground ml-auto"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:my-1">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-muted-foreground mr-auto">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Analyzing...</span>
                </div>
              )}
              {pendingQuestions && !loading && !isComplete && (
                <MultiQuestionForm
                  questions={pendingQuestions}
                  onSubmit={(formatted) => sendMessage(formatted)}
                  disabled={loading}
                />
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2 pt-2 border-t">
          {isComplete ? (
            <Button onClick={onGenerateResume} className="w-full gap-2">
              <FileCheck className="h-4 w-4" />
              Generate Resume Now
            </Button>
          ) : !pendingQuestions ? (
            <>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleInputSend()}
                disabled={loading}
              />
              <Button onClick={handleInputSend} disabled={loading || !input.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
