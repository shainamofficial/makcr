import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/use-mobile";
import AutocompleteInput from "./AutocompleteInput";
import { searchCompanies } from "@/hooks/useProfileData";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: any;
  userId: string;
}

export default function WorkExperienceModal({ open, onOpenChange, editing, userId }: Props) {
  const isMobile = useIsMobile();
  const qc = useQueryClient();

  const [companyName, setCompanyName] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [remote, setRemote] = useState(false);
  const [description, setDescription] = useState("");
  const [dateError, setDateError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setCompanyName(editing.company?.name ?? "");
      setCompanyId(editing.company_id ?? null);
      setTitle(editing.title ?? "");
      setStartDate(editing.start_date ?? "");
      setEndDate(editing.end_date ?? "");
      setRemote(editing.is_full_remote ?? false);
      setDescription(editing.description ?? "");
    } else {
      setCompanyName(""); setCompanyId(null); setTitle(""); setStartDate(""); setEndDate(""); setRemote(false); setDescription("");
    }
    setDateError("");
  }, [editing, open]);

  const searchCo = useCallback(async (q: string) => {
    const res = await searchCompanies(q);
    return res.map(c => ({ id: c.id, label: c.name }));
  }, []);

  const validate = () => {
    if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
      setDateError("End date must be after start date");
      return false;
    }
    setDateError("");
    return true;
  };

  const handleSave = async () => {
    if (!companyName || !title) { toast({ title: "Company and title required", variant: "destructive" }); return; }
    if (!validate()) return;
    setSaving(true);

    let cId = companyId;
    if (!cId) {
      const { data: existing } = await supabase.from("company").select("id").ilike("name", companyName).limit(1);
      if (existing?.length) {
        cId = existing[0].id;
      } else {
        const { data: newCo } = await supabase.from("company").insert({ name: companyName }).select("id").single();
        cId = newCo?.id ?? null;
      }
    }
    if (!cId) { setSaving(false); toast({ title: "Failed to resolve company", variant: "destructive" }); return; }

    const payload = {
      company_id: cId,
      title,
      start_date: startDate || null,
      end_date: endDate || null,
      is_full_remote: remote,
      description: description || null,
      user_id: userId,
    };

    if (editing) {
      const { error } = await supabase.from("work_experience").update(payload).eq("id", editing.id);
      if (error) { setSaving(false); toast({ title: "Update failed", variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("work_experience").insert(payload);
      if (error) { setSaving(false); toast({ title: "Insert failed", variant: "destructive" }); return; }
    }

    toast({ title: editing ? "Updated" : "Added" });
    qc.invalidateQueries({ queryKey: ["work_experience"] });
    setSaving(false);
    onOpenChange(false);
  };

  const form = (
    <div className="space-y-4 py-2">
      <div>
        <Label>Company</Label>
        <AutocompleteInput
          value={companyName}
          onChange={(v, opt) => { setCompanyName(v); setCompanyId(opt?.id ?? null); }}
          searchFn={searchCo}
          placeholder="Company name"
        />
      </div>
      <div>
        <Label>Title</Label>
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Job title" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Start Date</Label>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <Label>End Date</Label>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          {dateError && <p className="text-xs text-destructive mt-1">{dateError}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={remote} onCheckedChange={setRemote} />
        <Label>Full Remote</Label>
      </div>
      <div>
        <Label>Description</Label>
        <Textarea value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? "Saving..." : editing ? "Update" : "Add"}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader><SheetTitle>{editing ? "Edit" : "Add"} Work Experience</SheetTitle></SheetHeader>
          {form}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Work Experience</DialogTitle></DialogHeader>
        {form}
      </DialogContent>
    </Dialog>
  );
}
