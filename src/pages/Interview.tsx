import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { format, differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import ChatMessages from "@/components/interview/ChatMessages";
import ChatInput from "@/components/interview/ChatInput";
import CareerSidebar from "@/components/interview/CareerSidebar";
import ProgressStepper from "@/components/interview/ProgressStepper";
import PhotoUpload from "@/components/interview/PhotoUpload";
import ResumeUpload from "@/components/interview/ResumeUpload";
import CompletionBanner from "@/components/interview/CompletionBanner";
import {
  findActiveSession,
  loadMessages,
  createSession,
  abandonSession,
  saveMessage,
  checkHasWorkExperience,
  getUserProfile,
  type ChatMessage,
  type ChatSession,
} from "@/lib/chat-service";

const SUPABASE_PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const CHAT_FN_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/chat`;
const PARSE_FN_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/parse-resume`;

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
  const [isComplete, setIsComplete] = useState(false);
  const [awaitingStaleChoice, setAwaitingStaleChoice] = useState(false);
  const [showResumeUpload, setShowResumeUpload] = useState(false);

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
        const msgs = await loadMessages(existing.id);

        // Check if session is stale (>30 days)
        const daysSinceUpdate = differenceInDays(new Date(), new Date(existing.updated_at));
        if (daysSinceUpdate > 30) {
          setChatSession(existing);
          setCurrentTopic(existing.current_topic ?? "work_experience");
          setMessages(msgs);

          // Append stale session prompt
          const staleMsg = await saveMessage(
            existing.id,
            "assistant",
            "It's been a while since we last spoke! Would you like to continue where we left off, or start fresh?"
          );
          setMessages((prev) => [...prev, staleMsg]);
          setAwaitingStaleChoice(true);
          setLoading(false);
          return;
        }

        setChatSession(existing);
        setCurrentTopic(existing.current_topic ?? "work_experience");
        setMessages(msgs);

        // Check if already completed
        if (existing.current_topic === "completed") {
          setIsComplete(true);
        }

        // Show resume upload if session is early (work_experience topic, few messages)
        if (
          existing.session_type === "initial_interview" &&
          (existing.current_topic === "work_experience" || !existing.current_topic) &&
          msgs.length <= 3
        ) {
          setShowResumeUpload(true);
        }

        setLoading(false);
        return;
      }

      // No active session — create new one
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
      if (sessionType === "initial_interview") {
        setShowResumeUpload(true);
      }
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

  const handleStartFresh = async () => {
    if (!chatSession || !user) return;
    setAwaitingStaleChoice(false);
    setLoading(true);

    try {
      await abandonSession(chatSession.id);

      const hasWork = await checkHasWorkExperience(user.id);
      const sessionType = hasWork ? "update" : "initial_interview";
      const firstMessage = hasWork
        ? "Let's start fresh! What's the most recent update to your career?"
        : "Let's start fresh! What company do you currently work at, or what was your most recent employer?";

      const newSession = await createSession(user.id, sessionType);
      const aiMsg = await saveMessage(newSession.id, "assistant", firstMessage);

      setChatSession(newSession);
      setMessages([aiMsg]);
      setCurrentTopic("work_experience");
    } catch (err) {
      console.error("Failed to start fresh:", err);
      toast({ title: "Error", description: "Failed to create new session.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (content: string) => {
    if (!chatSession || !authSession) return;

    // Handle stale session choice
    if (awaitingStaleChoice) {
      const lower = content.toLowerCase();
      if (lower.includes("fresh") || lower.includes("start over") || lower.includes("new")) {
        await handleStartFresh();
        return;
      }
      // "Continue" — just proceed normally
      setAwaitingStaleChoice(false);
    }

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
      await saveMessage(chatSession.id, "user", content);
      setIsTyping(true);

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

      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        chat_session_id: chatSession.id,
        role: "assistant",
        content: data.message,
        created_at: new Date().toISOString(),
        structured_data_extracted: data.extractedData ?? null,
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (data.currentTopic) {
        setCurrentTopic(data.currentTopic);
        if (data.currentTopic === "completed") {
          setIsComplete(true);
        }
      }

      // Always refresh sidebar after AI response
      setSidebarRefreshKey((k) => k + 1);
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

  const handlePhotoUploaded = async (url: string) => {
    if (!chatSession) return;
    const msg = await saveMessage(
      chatSession.id,
      "user",
      `[Uploaded profile photo: ${url}]`
    );
    setMessages((prev) => [...prev, msg]);

    // Send a follow-up to the AI
    handleSend("I've uploaded my profile photo.");
  };

  const handlePhotoSkipped = async () => {
    handleSend("I'd like to skip the photo for now.");
  };

  const handleResumeUploaded = async (resumeText: string, fileName: string) => {
    setShowResumeUpload(false);
    handleSend(`[RESUME_UPLOAD] File: ${fileName}\n\n${resumeText}`);
  };

  const handleResumeSkipped = () => {
    setShowResumeUpload(false);
  };

  const handleResumeFile = async (file: File) => {
    if (!authSession) return;
    setIsTyping(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(PARSE_FN_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authSession.access_token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to parse resume");
      }

      handleSend(`[RESUME_UPLOAD] File: ${file.name}\n\n${data.text}`);
    } catch (err) {
      console.error("Resume parse error:", err);
      toast({ title: "Failed to process resume", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsTyping(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your interview...</p>
        </div>
      </div>
    );
  }

  const showPhotoUpload = currentTopic === "profile_photo" && !isComplete;
  const chatDisabled = isTyping || isComplete;

  return (
    <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100dvh - 3.5rem)" }}>
      <div className="flex flex-col flex-1 min-w-0">
        <ProgressStepper currentTopic={currentTopic} />
        <ChatMessages messages={messages} userInitial={userInitial} isTyping={isTyping}>
          {showResumeUpload && (
            <ResumeUpload onComplete={handleResumeUploaded} onSkip={handleResumeSkipped} />
          )}
          {showPhotoUpload && (
            <PhotoUpload onComplete={handlePhotoUploaded} onSkip={handlePhotoSkipped} />
          )}
          {isComplete && <CompletionBanner />}
        </ChatMessages>
        <ChatInput
          onSend={handleSend}
          disabled={chatDisabled}
          defaultValue={pendingMessage ?? undefined}
          onResumeFile={!isComplete ? handleResumeFile : undefined}
        />
      </div>
      <CareerSidebar refreshKey={sidebarRefreshKey} />
    </div>
  );
};

export default Interview;
