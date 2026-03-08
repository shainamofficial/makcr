import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface Props { open: boolean; onOpenChange: (o: boolean) => void; editing: any; userId: string; }

export default function ProjectModal({ open, onOpenChange, editing, userId }: Props) {
  const isMobile = useIsMobile();
  const qc = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [urls, setUrls] = useState("");
  const [dateError, setDateError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setTitle(editing.title ?? "");
      setDescription(editing.description ?? "");
      setStartDate(editing.start_date ?? "");
      setEndDate(editing.end_date ?? "");
      setUrls(Array.isArray(editing.project_urls) ? editing.project_urls.join("\n") : "");
    } else {
      setTitle(""); setDescription(""); setStartDate(""); setEndDate(""); setUrls("");
    }
    setDateError("");
  }, [editing, open]);

  const handleSave = async () => {
    if (!title) { toast({ title: "Title required", variant: "destructive" }); return; }
    if (endDate && startDate && new Date(endDate) < new Date(startDate)) { setDateError("End date must be after start"); return; }
    setDateError("");
    setSaving(true);

    const urlList = urls.split("\n").map(u => u.trim()).filter(Boolean);

    const payload = {
      title,
      description: description || null,
      start_date: startDate || null,
      end_date: endDate || null,
      project_urls: urlList.length ? urlList : null,
      user_id: userId,
    };

    if (editing) {
      const { error } = await supabase.from("project").update(payload).eq("id", editing.id);
      if (error) { setSaving(false); toast({ title: "Update failed", variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("project").insert(payload);
      if (error) { setSaving(false); toast({ title: "Insert failed", variant: "destructive" }); return; }
    }

    toast({ title: editing ? "Project updated" : "Project added" });
    qc.invalidateQueries({ queryKey: ["projects"] });
    setSaving(false);
    onOpenChange(false);
  };

  const form = (
    <div className="space-y-4 py-2">
      <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Project title" /></div>
      <div><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Start Date</Label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
        <div><Label>End Date</Label><Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />{dateError && <p className="text-xs text-destructive mt-1">{dateError}</p>}</div>
      </div>
      <div><Label>URLs (one per line)</Label><Textarea value={urls} onChange={e => setUrls(e.target.value)} placeholder="https://github.com/..." /></div>
      <Button onClick={handleSave} disabled={saving} className="w-full">{saving ? "Saving..." : editing ? "Update" : "Add"}</Button>
    </div>
  );

  if (isMobile) return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto"><SheetHeader><SheetTitle>{editing ? "Edit" : "Add"} Project</SheetTitle></SheetHeader>{form}</SheetContent>
    </Sheet>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Project</DialogTitle></DialogHeader>{form}</DialogContent>
    </Dialog>
  );
}
