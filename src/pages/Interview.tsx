import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import ChatMessages from "@/components/interview/ChatMessages";
import ChatInput from "@/components/interview/ChatInput";
import CareerSidebar from "@/components/interview/CareerSidebar";
import ProgressStepper from "@/components/interview/ProgressStepper";
import {
  findActiveSession,
  loadMessages,
  createSession,
  saveMessage,
  checkHasWorkExperience,
  getUserProfile,
  type ChatMessage,
  type ChatSession,
} from "@/lib/chat-service";

const SUPABASE_PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const CHAT_FN_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/chat`;

const Interview = () => {
  const { user, session: authSession } = useAuth();
  const { toast } = useToast();
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTopic, setCurrentTopic] = useState<string | null>("work_experience");
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const userInitial =
    user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() ??
    user?.email?.charAt(0)?.toUpperCase() ??
    "U";

  const initSession = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const existing = await findActiveSession(user.id);

      if (existing) {
        setChatSession(existing);
        setCurrentTopic(existing.current_topic ?? "work_experience");
        const msgs = await loadMessages(existing.id);
        setMessages(msgs);
        setLoading(false);
        return;
      }

      const hasWork = await checkHasWorkExperience(user.id);
      const profile = await getUserProfile(user.id);

      let sessionType: "initial_interview" | "update";
      let firstMessage: string;

      if (hasWork) {
        sessionType = "update";
        const updatedDate = profile.updated_at
          ? format(new Date(profile.updated_at), "MMMM d, yyyy")
          : "recently";
        const name = profile.first_name || "there";
        firstMessage = `Welcome back, ${name}! Your career profile was last updated on ${updatedDate}. Has anything changed since then — new role, new skills, new projects?`;
      } else {
        sessionType = "initial_interview";
        firstMessage = `Welcome to Makcr! I'm here to help build your career profile. This will take about 10-15 minutes, and everything we capture will be used to generate perfectly tailored resumes for you.\n\nLet's start — what company do you currently work at, or what was your most recent employer?`;
      }

      const newSession = await createSession(user.id, sessionType);
      const aiMsg = await saveMessage(newSession.id, "assistant", firstMessage);

      setChatSession(newSession);
      setMessages([aiMsg]);
    } catch (err) {
      console.error("Failed to initialize interview session:", err);
      toast({ title: "Error", description: "Failed to load interview session.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  const handleSend = async (content: string) => {
    if (!chatSession || !authSession) return;

    // Optimistic user message
    const tempMsg: ChatMessage = {
      id: crypto.randomUUID(),
      chat_session_id: chatSession.id,
      role: "user",
      content,
      created_at: new Date().toISOString(),
      structured_data_extracted: null,
    };
    setMessages((prev) => [...prev, tempMsg]);
    setPendingMessage(null);

    try {
      // Save user message to DB
      await saveMessage(chatSession.id, "user", content);

      // Show typing
      setIsTyping(true);

      // Call edge function
      const response = await fetch(CHAT_FN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authSession.access_token}`,
        },
        body: JSON.stringify({
          message: content,
          sessionId: chatSession.id,
          userId: user!.id,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Request failed");
      }

      // Add AI message (already saved by edge function)
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        chat_session_id: chatSession.id,
        role: "assistant",
        content: data.message,
        created_at: new Date().toISOString(),
        structured_data_extracted: data.extractedData ?? null,
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Update topic
      if (data.currentTopic) {
        setCurrentTopic(data.currentTopic);
      }

      // Refresh sidebar if data was extracted
      if (data.extractedData) {
        setSidebarRefreshKey((k) => k + 1);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setPendingMessage(content);
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Loading your interview...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 3.5rem)" }}>
      {/* Chat panel */}
      <div className="flex flex-col flex-1 min-w-0">
        <ProgressStepper currentTopic={currentTopic} />
        <ChatMessages messages={messages} userInitial={userInitial} isTyping={isTyping} />
        <ChatInput
          onSend={handleSend}
          disabled={isTyping}
          defaultValue={pendingMessage ?? undefined}
        />
      </div>

      {/* Desktop sidebar */}
      <CareerSidebar refreshKey={sidebarRefreshKey} />
    </div>
  );
};

export default Interview;
