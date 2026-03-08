import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import ProjectModal from "./ProjectModal";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

function range(s: string | null, e: string | null) {
  const start = s ? format(new Date(s), "MMM yyyy") : "";
  const end = e ? format(new Date(e), "MMM yyyy") : "Present";
  return start ? `${start} — ${end}` : end;
}

export default function ProjectsSection({ data }: { data: any[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const qc = useQueryClient();
  const { user } = useAuth();

  const handleDelete = async () => {
    if (!deleting) return;
    const { error } = await supabase.from("project").delete().eq("id", deleting);
    if (error) { toast({ title: "Delete failed", variant: "destructive" }); return; }
    toast({ title: "Project deleted" });
    qc.invalidateQueries({ queryKey: ["projects"] });
    setDeleting(null);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Projects</h2>
        <Button size="sm" onClick={() => { setEditing(null); setModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {data.map((p: any) => (
          <Card key={p.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {p.title}
                    {p.project_type?.type && <Badge variant="outline" className="text-xs">{p.project_type.type}</Badge>}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{range(p.start_date, p.end_date)}</p>
                  {p.education?.institution?.institution_name && (
                    <p className="text-xs text-muted-foreground">@ {p.education.institution.institution_name}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(p); setModalOpen(true); }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleting(p.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {p.description && <p className="text-sm mb-2">{p.description}</p>}
              {p.project_urls && Array.isArray(p.project_urls) && p.project_urls.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {p.project_urls.map((url: string, i: number) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" /> {new URL(url).hostname}
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <ProjectModal open={modalOpen} onOpenChange={setModalOpen} editing={editing} userId={user?.id ?? ""} />
      <DeleteConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        description="Permanently delete this project?"
      />
    </section>
  );
}
