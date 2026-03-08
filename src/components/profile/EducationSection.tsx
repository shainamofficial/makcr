import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import EducationModal from "./EducationModal";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

function fmt(d: string | null) {
  return d ? format(new Date(d), "MMM yyyy") : "";
}
function range(s: string | null, e: string | null) {
  const start = fmt(s);
  const end = e ? fmt(e) : "Present";
  return start ? `${start} — ${end}` : end;
}

export default function EducationSection({ data }: { data: any[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const qc = useQueryClient();
  const { user } = useAuth();

  const handleDelete = async () => {
    if (!deleting) return;
    // Delete child records first to avoid FK constraint errors
    await supabase.from("extra_curricular").delete().eq("education_id", deleting);
    await supabase.from("position_of_responsibility").delete().eq("education_id", deleting);
    const { error } = await supabase.from("education").delete().eq("id", deleting);
    if (error) { toast({ title: "Delete failed", variant: "destructive" }); return; }
    toast({ title: "Education deleted" });
    qc.invalidateQueries({ queryKey: ["education"] });
    setDeleting(null);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Education</h2>
        <Button size="sm" onClick={() => { setEditing(null); setModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {data.map((ed: any) => (
          <Card key={ed.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {ed.institution?.institution_name}
                    <Badge variant="outline" className="text-xs">{ed.institution?.institution_type}</Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {ed.degree?.degree_name} — {ed.discipline?.discipline_name}
                  </p>
                  <p className="text-xs text-muted-foreground">{range(ed.start_date, ed.end_date)}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(ed); setModalOpen(true); }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleting(ed.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {ed.extra_curricular?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Extra-curriculars</p>
                  {ed.extra_curricular.map((ec: any) => (
                    <div key={ec.id} className="ml-2 mb-1">
                      <p className="text-sm font-medium">
                        {ec.title}
                        {ec.extra_curricular_type?.type && <Badge variant="secondary" className="ml-2 text-xs">{ec.extra_curricular_type.type}</Badge>}
                      </p>
                      {ec.description && <p className="text-xs text-muted-foreground">{ec.description}</p>}
                      <p className="text-xs text-muted-foreground">{range(ec.start_date, ec.end_date)}</p>
                    </div>
                  ))}
                </div>
              )}
              {ed.position_of_responsibility?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Positions of Responsibility</p>
                  {ed.position_of_responsibility.map((pos: any) => (
                    <div key={pos.id} className="ml-2 mb-1">
                      <p className="text-sm font-medium">
                        {pos.title}
                        {pos.institution_organization?.name && <span className="text-muted-foreground font-normal"> at {pos.institution_organization.name}</span>}
                      </p>
                      {pos.description && <p className="text-xs text-muted-foreground">{pos.description}</p>}
                      <p className="text-xs text-muted-foreground">{range(pos.start_date, pos.end_date)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <EducationModal open={modalOpen} onOpenChange={setModalOpen} editing={editing} userId={user?.id ?? ""} />
      <DeleteConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Education"
        description="This will permanently delete this education entry and its associated extra-curriculars and positions of responsibility."
      />
    </section>
  );
}
