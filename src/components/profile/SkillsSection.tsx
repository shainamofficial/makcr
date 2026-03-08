import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import SkillModal from "./SkillModal";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const profColors: Record<string, string> = {
  Beginner: "bg-muted text-muted-foreground",
  Intermediate: "bg-primary/10 text-primary",
  Advanced: "bg-accent text-accent-foreground",
  Expert: "bg-destructive/10 text-destructive",
};

export default function SkillsSection({ data }: { data: any[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const qc = useQueryClient();
  const { user } = useAuth();

  const grouped = data.reduce((acc: Record<string, any[]>, item) => {
    const cat = item.skill?.category || "Other";
    (acc[cat] = acc[cat] || []).push(item);
    return acc;
  }, {});

  const handleDelete = async () => {
    if (!deleting) return;
    const { error } = await supabase.from("user_skill_mapping").delete().eq("id", deleting);
    if (error) { toast({ title: "Delete failed", variant: "destructive" }); return; }
    toast({ title: "Skill removed" });
    qc.invalidateQueries({ queryKey: ["skills"] });
    setDeleting(null);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Skills</h2>
        <Button size="sm" onClick={() => { setEditing(null); setModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      {Object.entries(grouped).map(([category, skills]) => (
        <div key={category} className="mb-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">{category}</h3>
          <div className="flex flex-wrap gap-2">
            {(skills as any[]).map((s: any) => (
              <div key={s.id} className="group flex items-center gap-1 rounded-md border bg-card px-3 py-1.5">
                <span className="text-sm font-medium">{s.skill?.skill_name}</span>
                <Badge className={`text-xs ${profColors[s.proficiency] || ""}`}>{s.proficiency}</Badge>
                {s.years_of_experience != null && (
                  <span className="text-xs text-muted-foreground">{s.years_of_experience}y</span>
                )}
                <div className="hidden group-hover:flex gap-0.5 ml-1">
                  <button onClick={() => { setEditing(s); setModalOpen(true); }} className="text-muted-foreground hover:text-foreground">
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button onClick={() => setDeleting(s.id)} className="text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <SkillModal open={modalOpen} onOpenChange={setModalOpen} editing={editing} userId={user?.id ?? ""} />
      <DeleteConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Skill"
        description="Remove this skill from your profile?"
      />
    </section>
  );
}
