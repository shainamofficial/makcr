import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type ChatSession = Tables<"chat_session">;
export type ChatMessage = Tables<"chat_message">;

export async function findActiveSession(userId: string): Promise<ChatSession | null> {
  const { data, error } = await supabase
    .from("chat_session")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "in_progress")
    .in("session_type", ["initial_interview", "update"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function loadMessages(sessionId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("chat_message")
    .select("*")
    .eq("chat_session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createSession(
  userId: string,
  sessionType: "initial_interview" | "update"
): Promise<ChatSession> {
  const { data, error } = await supabase
    .from("chat_session")
    .insert({ user_id: userId, session_type: sessionType, status: "in_progress" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function saveMessage(
  sessionId: string,
  role: "user" | "assistant",
  content: string
): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from("chat_message")
    .insert({ chat_session_id: sessionId, role, content })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function checkHasWorkExperience(userId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from("work_experience")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("user")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}
