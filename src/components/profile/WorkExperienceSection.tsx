import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, ExternalLink, Building2 } from "lucide-react";
import { format } from "date-fns";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import WorkExperienceModal from "./WorkExperienceModal";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

function formatRange(start: string | null, end: string | null) {
  const s = start ? format(new Date(start), "MMM yyyy") : "";
  const e = end ? format(new Date(end), "MMM yyyy") : "Present";
  return s ? `${s} — ${e}` : e;
}

interface GroupedCompany {
  companyId: string;
  companyName: string;
  roles: any[];
}

function groupByCompany(data: any[]): GroupedCompany[] {
  const map = new Map<string, GroupedCompany>();
  const order: string[] = [];

  for (const we of data) {
    const companyId = we.company?.id ?? "unknown";
    if (!map.has(companyId)) {
      map.set(companyId, {
        companyId,
        companyName: we.company?.name ?? "Unknown Company",
        roles: [],
      });
      order.push(companyId);
    }
    map.get(companyId)!.roles.push(we);
  }

  return order.map((k) => map.get(k)!);
}

export default function WorkExperienceSection({ data }: { data: any[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const qc = useQueryClient();
  const { user } = useAuth();

  const grouped = useMemo(() => groupByCompany(data), [data]);

  const handleDelete = async () => {
    if (!deleting) return;
    await supabase.from("work_experience_points").delete().eq("work_experience_id", deleting);
    const { error } = await supabase.from("work_experience").delete().eq("id", deleting);
    if (error) { toast({ title: "Delete failed", variant: "destructive" }); return; }
    toast({ title: "Work experience deleted" });
    qc.invalidateQueries({ queryKey: ["work_experience"] });
    setDeleting(null);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Work Experience</h2>
        <Button size="sm" onClick={() => { setEditing(null); setModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      <div className="space-y-4">
        {grouped.map((group) => (
          <Card key={group.companyId}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">{group.companyName}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {group.roles.map((we: any, idx: number) => (
                <div key={we.id} className={idx > 0 ? "border-t border-border pt-4" : ""}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{we.title}</p>
                      <p className="text-xs text-muted-foreground">{formatRange(we.start_date, we.end_date)}</p>
                    </div>
                    <div className="flex gap-1">
                      {we.is_full_remote && <Badge variant="secondary">Remote</Badge>}
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(we); setModalOpen(true); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleting(we.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  {we.description && <p className="text-sm mt-1">{we.description}</p>}
                  {we.work_experience_points?.length > 0 && (
                    <ul className="ml-4 mt-1 space-y-1">
                      {we.work_experience_points.map((pt: any) => (
                        <li key={pt.id} className="text-sm list-disc">
                          {pt.details}
                          {pt.impact && <span className="italic text-muted-foreground"> — {pt.impact}</span>}
                          {pt.links && Array.isArray(pt.links) && pt.links.map((link: string, i: number) => (
                            <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center ml-1 text-primary hover:underline">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ))}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <WorkExperienceModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editing={editing}
        userId={user?.id ?? ""}
      />

      <DeleteConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Work Experience"
        description="This will permanently delete this work experience entry. Associated skills will remain in your profile."
      />
    </section>
  );
}
