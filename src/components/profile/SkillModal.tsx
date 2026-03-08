import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import AutocompleteInput from "./AutocompleteInput";
import { searchSkills } from "@/hooks/useProfileData";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface Props { open: boolean; onOpenChange: (o: boolean) => void; editing: any; userId: string; }

export default function SkillModal({ open, onOpenChange, editing, userId }: Props) {
  const isMobile = useIsMobile();
  const qc = useQueryClient();

  const [skillName, setSkillName] = useState("");
  const [skillId, setSkillId] = useState<string | null>(null);
  const [category, setCategory] = useState("Technical");
  const [proficiency, setProficiency] = useState("Intermediate");
  const [years, setYears] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setSkillName(editing.skill?.skill_name ?? "");
      setSkillId(editing.skill_id ?? null);
      setCategory(editing.skill?.category ?? "Technical");
      setProficiency(editing.proficiency ?? "Intermediate");
      setYears(editing.years_of_experience?.toString() ?? "");
    } else {
      setSkillName(""); setSkillId(null); setCategory("Technical"); setProficiency("Intermediate"); setYears("");
    }
  }, [editing, open]);

  const searchSk = useCallback(async (q: string) => (await searchSkills(q)).map(s => ({ id: s.id, label: s.skill_name, category: s.category })), []);

  const handleSave = async () => {
    if (!skillName) { toast({ title: "Skill name required", variant: "destructive" }); return; }
    setSaving(true);

    let sId = skillId;
    if (!sId) {
      const { data: found } = await supabase.from("skill").select("id").ilike("skill_name", skillName).limit(1);
      if (found?.length) { sId = found[0].id; } else {
        const { data: created } = await supabase.from("skill").insert({ skill_name: skillName, category }).select("id").single();
        sId = created?.id ?? null;
      }
    }
    if (!sId) { setSaving(false); toast({ title: "Failed to resolve skill", variant: "destructive" }); return; }

    const payload = { skill_id: sId, proficiency, years_of_experience: years ? parseFloat(years) : null, user_id: userId };

    if (editing) {
      const { error } = await supabase.from("user_skill_mapping").update(payload).eq("id", editing.id);
      if (error) { setSaving(false); toast({ title: "Update failed", variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("user_skill_mapping").insert(payload);
      if (error) { setSaving(false); toast({ title: "Insert failed", variant: "destructive" }); return; }
    }

    toast({ title: editing ? "Updated" : "Added" });
    qc.invalidateQueries({ queryKey: ["skills"] });
    setSaving(false);
    onOpenChange(false);
  };

  const form = (
    <div className="space-y-4 py-2">
      <div>
        <Label>Skill</Label>
        <AutocompleteInput value={skillName} onChange={(v, opt) => { setSkillName(v); setSkillId(opt?.id ?? null); if (opt?.category) setCategory(opt.category); }} searchFn={searchSk} placeholder="Skill name" />
      </div>
      <div>
        <Label>Category</Label>
        <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Technical, Soft Skills" />
      </div>
      <div>
        <Label>Proficiency</Label>
        <Select value={proficiency} onValueChange={setProficiency}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
            <SelectItem value="Expert">Expert</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Years of Experience</Label>
        <Input type="number" value={years} onChange={e => setYears(e.target.value)} placeholder="Optional" />
      </div>
      <Button onClick={handleSave} disabled={saving} className="w-full">{saving ? "Saving..." : editing ? "Update" : "Add"}</Button>
    </div>
  );

  if (isMobile) return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto"><SheetHeader><SheetTitle>{editing ? "Edit" : "Add"} Skill</SheetTitle></SheetHeader>{form}</SheetContent>
    </Sheet>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md"><DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Skill</DialogTitle></DialogHeader>{form}</DialogContent>
    </Dialog>
  );
}
