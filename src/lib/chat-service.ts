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
  // Concurrent session prevention: check for existing in_progress session first
  const existing = await findActiveSession(userId);
  if (existing) return existing;

  const { data, error } = await supabase
    .from("chat_session")
    .insert({ user_id: userId, session_type: sessionType, status: "in_progress" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function abandonSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from("chat_session")
    .update({ status: "abandoned" })
    .eq("id", sessionId);

  if (error) throw error;
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

export function isSessionStale(session: ChatSession, days = 30): boolean {
  const updatedAt = new Date(session.updated_at);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return updatedAt < cutoff;
}

export async function uploadProfilePicture(
  userId: string,
  file: File
): Promise<string> {
  const timestamp = Date.now();
  const filePath = `${userId}/${timestamp}_${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("profile-pictures")
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from("profile-pictures")
    .getPublicUrl(filePath);

  const publicUrl = urlData.publicUrl;

  // Create profile_picture record
  const { data: picRecord, error: picError } = await supabase
    .from("profile_picture")
    .insert({ user_id: userId, link_to_storage: publicUrl })
    .select()
    .single();

  if (picError) throw picError;

  // Update user's profile_picture_id
  const { error: userError } = await supabase
    .from("user")
    .update({ profile_picture_id: picRecord.id })
    .eq("id", userId);

  if (userError) throw userError;

  return publicUrl;
}
