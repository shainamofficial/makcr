import { useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";
import { getTemplateComponent } from "./templates";
import type { ResumeData } from "./templates/types";
import { exportElementAsPdf } from "@/lib/export-pdf";

interface Props {
  templateName: string;
  data: ResumeData;
  onClose: () => void;
}

export default function ResumePreviewModal({ templateName, data, onClose }: Props) {
  const Template = getTemplateComponent(templateName);
  const containerRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const handleDownload = async () => {
    if (!containerRef.current || exporting) return;
    setExporting(true);
    try {
      await exportElementAsPdf(containerRef.current, "resume.pdf");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[9in] w-full max-h-[95vh] overflow-y-auto p-0">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-background border-b px-4 py-3 print:hidden">
          <Button variant="ghost" size="sm" onClick={onClose} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
          <Button size="sm" onClick={handleDownload} disabled={exporting} className="gap-1">
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
            {exporting ? "Generating…" : "Download as PDF"}
          </Button>
        </div>
        <div ref={containerRef} className="resume-preview-container">
          <Template {...data} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
