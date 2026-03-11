import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, MessageSquare, FileText, Loader2, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import ResumePreviewModal from "./ResumePreviewModal";
import type { ResumeData } from "./templates/types";

interface Props {
  userId: string;
}

function transformStoredContent(content: any, includePhoto: boolean): ResumeData {
  const sections = content?.sections || content;
  return {
    user: content?.user ?? { first_name: null, last_name: null, email: "", phone_number: null },
    summary: sections?.summary ?? "",
    workExperiences: (sections?.work_experience ?? []).map((w: any) => ({
      company: w.company ?? "",
      title: w.title ?? "",
      start_date: w.start_date ?? null,
      end_date: w.end_date ?? null,
      points: w.bullets ?? w.points ?? [],
    })),
    education: (sections?.education ?? []).map((e: any) => ({
      institution: e.institution ?? "",
      degree: e.degree ?? "",
      discipline: e.discipline ?? "",
      start_date: e.start_date ?? null,
      end_date: e.end_date ?? null,
    })),
    skills: (sections?.skills ?? []).map((s: any) =>
      typeof s === "string" ? { name: s, category: "General", proficiency: "Intermediate" } : s
    ),
    projects: (sections?.projects ?? []).map((p: any) => ({
      title: p.title ?? "",
      description: p.description ?? "",
      urls: p.urls ?? [],
    })),
    profilePictureUrl: content?.profilePictureUrl ?? null,
    includePhoto,
  };
}

export default function PastResumesTab({ userId }: Props) {
  const isMobile = useIsMobile();
  const { session: authSession } = useAuth();
  const qc = useQueryClient();
  const [viewingChat, setViewingChat] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<ResumeData | null>(null);
  const [previewTemplateName, setPreviewTemplateName] = useState("Classic");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState<string | null>(null);
  const [retrying, setRetrying] = useState<string | null>(null);

  const { data: resumes, isLoading } = useQuery({
    queryKey: ["resumes", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("resume")
        .select("*, resume_template:resume_template_id(name)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: chatMessages } = useQuery({
    queryKey: ["resume_chat", viewingChat],
    enabled: !!viewingChat,
    queryFn: async () => {
      const { data } = await supabase
        .from("chat_message")
        .select("id, role, content, created_at")
        .eq("chat_session_id", viewingChat!)
        .order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  const handleViewResume = async (resume: any) => {
    if (!resume.generated_resume_link) return;
    setLoadingPreview(resume.id);

    try {
      // generated_resume_link now stores a storage path; create a short-lived signed URL
      const storagePath = resume.generated_resume_link;
      const { data: signedData, error: signedErr } = await supabase.storage
        .from("resumes")
        .createSignedUrl(storagePath, 300); // 5 min TTL
      if (signedErr || !signedData?.signedUrl) throw new Error("Failed to get signed URL");

      const response = await fetch(signedData.signedUrl);
      if (!response.ok) throw new Error("Failed to fetch resume content");
      const content = await response.json();

      const data = transformStoredContent(content, resume.include_profile_picture ?? false);
      const templateName = (resume.resume_template as any)?.name ?? "Classic";

      setPreviewData(data);
      setPreviewTemplateName(templateName);
      setPreviewOpen(true);
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to load resume preview", variant: "destructive" });
    } finally {
      setLoadingPreview(null);
    }
  };

  const handleRetry = async (resume: any) => {
    setRetrying(resume.id);
    try {
      const response = await fetch(
        `https://tnosyowzngwbwgmxtioh.supabase.co/functions/v1/generate-resume`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authSession?.access_token}`,
          },
          body: JSON.stringify({ resumeId: resume.id, userId }),
        }
      );

      if (!response.ok) throw new Error("Generation failed");
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      toast({ title: "Resume generated successfully!" });
      qc.invalidateQueries({ queryKey: ["resumes"] });
    } catch (err) {
      console.error(err);
      toast({ title: "Resume generation failed. Please try again.", variant: "destructive" });
    } finally {
      setRetrying(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const drafts = resumes?.filter((r) => r.status === "in_progress") ?? [];
  const completed = resumes?.filter((r) => r.status === "completed") ?? [];

  if (!resumes?.length) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold text-foreground">No resumes yet</h2>
        <p className="text-muted-foreground">Generate your first resume from the Generate tab.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {drafts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">Drafts</h3>
          <div className="space-y-3">
            {drafts.map((r) => (
              <Card key={r.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-sm">{r.title || "Untitled Resume"}</p>
                    <p className="text-xs text-muted-foreground">Started {format(new Date(r.created_at), "MMM d, yyyy")}</p>
                    <Badge variant="secondary" className="mt-1">In Progress</Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRetry(r)}
                    disabled={retrying === r.id}
                    className="gap-1"
                  >
                    {retrying === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                    {retrying === r.id ? "Generating..." : "Retry"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">Completed</h3>
          <div className={isMobile ? "space-y-3" : "grid grid-cols-2 gap-4"}>
            {completed.map((r) => (
              <Card key={r.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{r.title || "Untitled Resume"}</CardTitle>
                  <div className="flex items-center gap-2">
                    {r.resume_template && (
                      <Badge variant="outline" className="text-xs">{(r.resume_template as any)?.name}</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{format(new Date(r.created_at), "MMM d, yyyy")}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewResume(r)}
                    disabled={loadingPreview === r.id || !r.generated_resume_link}
                    className="gap-1"
                  >
                    {loadingPreview === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                    {loadingPreview === r.id ? "Loading..." : "View & Download"}
                  </Button>
                  {r.chat_session_id && (
                    <Button size="sm" variant="ghost" onClick={() => setViewingChat(r.chat_session_id)}>
                      <MessageSquare className="h-3.5 w-3.5 mr-1" /> View Chat
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Dialog open={!!viewingChat} onOpenChange={(o) => !o && setViewingChat(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Chat History</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            {chatMessages?.map((msg) => (
              <div key={msg.id} className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${msg.role === "assistant" ? "bg-muted text-foreground mr-auto" : "bg-primary text-primary-foreground ml-auto"}`}>
                {msg.content}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {previewOpen && previewData && (
        <ResumePreviewModal templateName={previewTemplateName} data={previewData} onClose={() => setPreviewOpen(false)} />
      )}
    </div>
  );
}
