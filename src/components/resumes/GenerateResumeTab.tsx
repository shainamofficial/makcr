import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import ResumeGapChat from "./ResumeGapChat";
import { cn } from "@/lib/utils";

interface Props {
  userId: string;
}

export default function GenerateResumeTab({ userId }: Props) {
  const { session: authSession } = useAuth();
  const [jd, setJd] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [includePhoto, setIncludePhoto] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);

  // Check if profile has enough data
  const { data: workCount } = useQuery({
    queryKey: ["work_count", userId],
    queryFn: async () => {
      const { count } = await supabase.from("work_experience").select("id", { count: "exact", head: true }).eq("user_id", userId);
      return count ?? 0;
    },
  });

  const { data: eduCount } = useQuery({
    queryKey: ["edu_count", userId],
    queryFn: async () => {
      const { count } = await supabase.from("education").select("id", { count: "exact", head: true }).eq("user_id", userId);
      return count ?? 0;
    },
  });

  const { data: templates } = useQuery({
    queryKey: ["resume_templates"],
    queryFn: async () => {
      const { data } = await supabase.from("resume_template").select("*").eq("is_active", true);
      return data ?? [];
    },
  });

  useEffect(() => {
    if (templates?.length && !selectedTemplate) {
      setSelectedTemplate(templates[0].id);
    }
  }, [templates, selectedTemplate]);

  const hasEnoughData = (workCount ?? 0) >= 1 || (eduCount ?? 0) >= 1;
  const wordCount = jd.trim().split(/\s+/).filter(Boolean).length;
  const isShort = wordCount > 0 && wordCount < 50;

  const handleGenerate = async () => {
    if (!jd.trim() || !selectedTemplate) {
      toast({ title: "Please fill in the job description and select a template", variant: "destructive" });
      return;
    }
    setGenerating(true);

    try {
      // Create chat session for resume generation
      const { data: chatSession, error: csErr } = await supabase
        .from("chat_session")
        .insert({ user_id: userId, session_type: "resume_generation", status: "in_progress" })
        .select()
        .single();

      if (csErr) throw csErr;

      // Create resume record
      const { data: resume, error: rErr } = await supabase
        .from("resume")
        .insert({
          user_id: userId,
          job_description: jd,
          resume_template_id: selectedTemplate,
          include_profile_picture: includePhoto,
          chat_session_id: chatSession.id,
          status: "in_progress",
        })
        .select()
        .single();

      if (rErr) throw rErr;

      setChatSessionId(chatSession.id);
      setResumeId(resume.id);
      setChatOpen(true);

      // Send initial message to start gap analysis
      const CHAT_FN_URL = `https://tnosyowzngwbwgmxtioh.supabase.co/functions/v1/chat`;

      // Save initial user message (the JD)
      await supabase.from("chat_message").insert({
        chat_session_id: chatSession.id,
        role: "user",
        content: `Here is the job description I want to tailor my resume for:\n\n${jd}`,
      });

      const response = await fetch(CHAT_FN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authSession?.access_token}`,
        },
        body: JSON.stringify({
          message: `Here is the job description I want to tailor my resume for:\n\n${jd}`,
          sessionId: chatSession.id,
          userId,
        }),
      });

      if (!response.ok) throw new Error("Failed to start gap analysis");
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to start resume generation", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateResume = async () => {
    if (!resumeId) return;

    try {
      const response = await fetch(
        `https://tnosyowzngwbwgmxtioh.supabase.co/functions/v1/generate-resume`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authSession?.access_token}`,
          },
          body: JSON.stringify({ resumeId, userId }),
        }
      );

      if (!response.ok) throw new Error("Generation failed");

      const data = await response.json();

      // Update resume status
      await supabase
        .from("resume")
        .update({
          status: "completed",
          generated_resume_link: data.downloadUrl,
          title: data.title,
        })
        .eq("id", resumeId);

      toast({ title: "Resume generated successfully!" });
      setChatOpen(false);
    } catch (err) {
      console.error(err);
      toast({ title: "Resume generation failed", variant: "destructive" });
    }
  };

  if (!hasEnoughData) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold text-foreground">Not enough profile data</h2>
        <p className="text-muted-foreground max-w-md">
          Your career profile doesn't have enough information yet. Complete your career interview first.
        </p>
        <Button asChild>
          <Link to="/interview">Start Interview</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Job Description */}
      <div>
        <Label className="text-base font-semibold">Paste the full job description here</Label>
        <Textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste the full job description..."
          className="mt-2 min-h-[200px]"
        />
        <div className="flex items-center justify-between mt-1">
          <div>
            {isShort && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                This seems too short. Paste the full description.
              </p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{wordCount} words</p>
        </div>
      </div>

      {/* Templates */}
      <div>
        <Label className="text-base font-semibold">Choose a Template</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
          {templates?.map((t) => (
            <Card
              key={t.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedTemplate === t.id ? "ring-2 ring-primary" : ""
              )}
              onClick={() => setSelectedTemplate(t.id)}
            >
              <CardContent className="p-4 flex flex-col items-center gap-2">
                {t.preview_image_url ? (
                  <img src={t.preview_image_url} alt={t.name} className="h-32 w-full object-cover rounded" />
                ) : (
                  <div className="h-32 w-full bg-muted rounded flex items-center justify-center">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <p className="text-sm font-medium text-center">{t.name}</p>
                {t.description && <p className="text-xs text-muted-foreground text-center">{t.description}</p>}
              </CardContent>
            </Card>
          ))}
          {(!templates || templates.length === 0) && (
            <p className="text-sm text-muted-foreground col-span-full">No templates available yet.</p>
          )}
        </div>
      </div>

      {/* Photo Toggle */}
      <div className="flex items-center gap-3">
        <Switch checked={includePhoto} onCheckedChange={setIncludePhoto} />
        <Label>Include profile picture</Label>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={generating || !jd.trim() || !selectedTemplate}
        className="w-full sm:w-auto"
        size="lg"
      >
        {generating ? "Starting..." : "Generate Resume"}
      </Button>

      {/* Gap Analysis Chat */}
      {chatOpen && chatSessionId && (
        <ResumeGapChat
          sessionId={chatSessionId}
          userId={userId}
          onClose={() => setChatOpen(false)}
          onGenerateResume={handleGenerateResume}
        />
      )}
    </div>
  );
}
