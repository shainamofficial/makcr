import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, MessageSquare, FileText } from "lucide-react";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  userId: string;
}

export default function PastResumesTab({ userId }: Props) {
  const isMobile = useIsMobile();
  const [viewingChat, setViewingChat] = useState<string | null>(null);

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
      {/* Drafts */}
      {drafts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">Drafts</h3>
          <div className="space-y-3">
            {drafts.map((r) => (
              <Card key={r.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-sm">{r.title || "Untitled Resume"}</p>
                    <p className="text-xs text-muted-foreground">
                      Started {format(new Date(r.created_at), "MMM d, yyyy")}
                    </p>
                    <Badge variant="secondary" className="mt-1">In Progress</Badge>
                  </div>
                  <Button size="sm" variant="outline">Continue</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
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
                      <Badge variant="outline" className="text-xs">
                        {(r.resume_template as any)?.name}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(r.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex gap-2">
                  {r.generated_resume_link && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={r.generated_resume_link} target="_blank" rel="noopener noreferrer">
                        <Download className="h-3.5 w-3.5 mr-1" /> Download
                      </a>
                    </Button>
                  )}
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

      {/* Chat History Modal */}
      <Dialog open={!!viewingChat} onOpenChange={(o) => !o && setViewingChat(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chat History</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {chatMessages?.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                  msg.role === "assistant"
                    ? "bg-muted text-foreground mr-auto"
                    : "bg-primary text-primary-foreground ml-auto"
                }`}
              >
                {msg.content}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
