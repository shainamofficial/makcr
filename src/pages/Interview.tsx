import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import ChatMessages from "@/components/interview/ChatMessages";
import ChatInput from "@/components/interview/ChatInput";
import CareerSidebar from "@/components/interview/CareerSidebar";
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

const Interview = () => {
  const { user } = useAuth();
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);

  const userInitial =
    user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() ??
    user?.email?.charAt(0)?.toUpperCase() ??
    "U";

  const initSession = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Look for active session
      const existing = await findActiveSession(user.id);

      if (existing) {
        setSession(existing);
        const msgs = await loadMessages(existing.id);
        setMessages(msgs);
        setLoading(false);
        return;
      }

      // 2. No active session — check if returning user
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

      // 3. Create session and save first AI message
      const newSession = await createSession(user.id, sessionType);
      const aiMsg = await saveMessage(newSession.id, "assistant", firstMessage);

      setSession(newSession);
      setMessages([aiMsg]);
    } catch (err) {
      console.error("Failed to initialize interview session:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  const handleSend = async (content: string) => {
    if (!session) return;

    // Optimistically add user message
    const tempMsg: ChatMessage = {
      id: crypto.randomUUID(),
      chat_session_id: session.id,
      role: "user",
      content,
      created_at: new Date().toISOString(),
      structured_data_extracted: null,
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      // Persist user message
      await saveMessage(session.id, "user", content);

      // Simulate AI typing (placeholder until Claude is connected)
      setIsTyping(true);
      await new Promise((r) => setTimeout(r, 1500));

      const placeholderReply =
        "Thanks for sharing that! I've noted it down. (AI responses will be connected soon — for now this is a placeholder.)";
      const aiMsg = await saveMessage(session.id, "assistant", placeholderReply);
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Failed to send message:", err);
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
        <ChatMessages messages={messages} userInitial={userInitial} isTyping={isTyping} />
        <ChatInput onSend={handleSend} disabled={isTyping} />
      </div>

      {/* Desktop sidebar */}
      <CareerSidebar />
    </div>
  );
};

export default Interview;
