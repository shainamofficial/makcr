import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import AutocompleteInput from "./AutocompleteInput";
import { searchInstitutions, searchDegrees, searchDisciplines } from "@/hooks/useProfileData";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface Props { open: boolean; onOpenChange: (o: boolean) => void; editing: any; userId: string; }

export default function EducationModal({ open, onOpenChange, editing, userId }: Props) {
  const isMobile = useIsMobile();
  const qc = useQueryClient();

  const [instName, setInstName] = useState("");
  const [instId, setInstId] = useState<string | null>(null);
  const [instType, setInstType] = useState("University");
  const [degreeName, setDegreeName] = useState("");
  const [degreeId, setDegreeId] = useState<string | null>(null);
  const [discName, setDiscName] = useState("");
  const [discId, setDiscId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setInstName(editing.institution?.institution_name ?? "");
      setInstId(editing.institution_id ?? null);
      setInstType(editing.institution?.institution_type ?? "University");
      setDegreeName(editing.degree?.degree_name ?? "");
      setDegreeId(editing.degree_id ?? null);
      setDiscName(editing.discipline?.discipline_name ?? "");
      setDiscId(editing.discipline_id ?? null);
      setStartDate(editing.start_date ?? "");
      setEndDate(editing.end_date ?? "");
    } else {
      setInstName(""); setInstId(null); setInstType("University"); setDegreeName(""); setDegreeId(null); setDiscName(""); setDiscId(null); setStartDate(""); setEndDate("");
    }
    setDateError("");
  }, [editing, open]);

  const searchInst = useCallback(async (q: string) => (await searchInstitutions(q)).map(i => ({ id: i.id, label: i.institution_name, institution_type: i.institution_type })), []);
  const searchDeg = useCallback(async (q: string) => (await searchDegrees(q)).map(d => ({ id: d.id, label: d.degree_name })), []);
  const searchDisc = useCallback(async (q: string) => (await searchDisciplines(q)).map(d => ({ id: d.id, label: d.discipline_name })), []);

  const resolveOrCreate = async (table: "institution" | "degree" | "discipline", nameCol: string, name: string, existingId: string | null, extra?: Record<string, string>): Promise<string | null> => {
    if (existingId) return existingId;
    if (table === "institution") {
      const { data: found } = await supabase.from("institution").select("id").ilike("institution_name", name).limit(1);
      if (found?.length) return found[0].id;
      const { data: created } = await supabase.from("institution").insert({ institution_name: name, institution_type: extra?.institution_type ?? "University" }).select("id").single();
      return created?.id ?? null;
    } else if (table === "degree") {
      const { data: found } = await supabase.from("degree").select("id").ilike("degree_name", name).limit(1);
      if (found?.length) return found[0].id;
      const { data: created } = await supabase.from("degree").insert({ degree_name: name }).select("id").single();
      return created?.id ?? null;
    } else {
      const { data: found } = await supabase.from("discipline").select("id").ilike("discipline_name", name).limit(1);
      if (found?.length) return found[0].id;
      const { data: created } = await supabase.from("discipline").insert({ discipline_name: name }).select("id").single();
      return created?.id ?? null;
    }
  };

  const handleSave = async () => {
    if (!instName || !degreeName || !discName) { toast({ title: "All fields required", variant: "destructive" }); return; }
    if (endDate && startDate && new Date(endDate) < new Date(startDate)) { setDateError("End date must be after start"); return; }
    setDateError("");
    setSaving(true);

    const iId = await resolveOrCreate("institution", "institution_name", instName, instId, { institution_type: instType });
    const dId = await resolveOrCreate("degree", "degree_name", degreeName, degreeId);
    const diId = await resolveOrCreate("discipline", "discipline_name", discName, discId);

    if (!iId || !dId || !diId) { setSaving(false); toast({ title: "Failed to resolve lookup", variant: "destructive" }); return; }

    const payload = { institution_id: iId, degree_id: dId, discipline_id: diId, start_date: startDate || null, end_date: endDate || null, user_id: userId };

    if (editing) {
      const { error } = await supabase.from("education").update(payload).eq("id", editing.id);
      if (error) { setSaving(false); toast({ title: "Update failed", variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("education").insert(payload);
      if (error) { setSaving(false); toast({ title: "Insert failed", variant: "destructive" }); return; }
    }

    toast({ title: editing ? "Updated" : "Added" });
    qc.invalidateQueries({ queryKey: ["education"] });
    setSaving(false);
    onOpenChange(false);
  };

  const form = (
    <div className="space-y-4 py-2">
      <div>
        <Label>Institution</Label>
        <AutocompleteInput value={instName} onChange={(v, opt) => { setInstName(v); setInstId(opt?.id ?? null); if (opt?.institution_type) setInstType(opt.institution_type); }} searchFn={searchInst} placeholder="Institution name" />
      </div>
      <div>
        <Label>Degree</Label>
        <AutocompleteInput value={degreeName} onChange={(v, opt) => { setDegreeName(v); setDegreeId(opt?.id ?? null); }} searchFn={searchDeg} placeholder="e.g. B.Tech" />
      </div>
      <div>
        <Label>Discipline</Label>
        <AutocompleteInput value={discName} onChange={(v, opt) => { setDiscName(v); setDiscId(opt?.id ?? null); }} searchFn={searchDisc} placeholder="e.g. Computer Science" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Start Date</Label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
        <div><Label>End Date</Label><Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />{dateError && <p className="text-xs text-destructive mt-1">{dateError}</p>}</div>
      </div>
      <Button onClick={handleSave} disabled={saving} className="w-full">{saving ? "Saving..." : editing ? "Update" : "Add"}</Button>
    </div>
  );

  if (isMobile) return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto"><SheetHeader><SheetTitle>{editing ? "Edit" : "Add"} Education</SheetTitle></SheetHeader>{form}</SheetContent>
    </Sheet>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Education</DialogTitle></DialogHeader>{form}</DialogContent>
    </Dialog>
  );
}
