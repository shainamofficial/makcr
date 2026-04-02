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
      <DialogContent className="w-[95vw] sm:max-w-[210mm] max-h-[95vh] overflow-y-auto p-0">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-background border-b px-3 sm:px-4 py-2 sm:py-3 print:hidden">
          <Button variant="ghost" size="sm" onClick={onClose} className="gap-1 text-xs sm:text-sm px-2 sm:px-3">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back to Dashboard</span><span className="sm:hidden">Back</span>
          </Button>
          <Button size="sm" onClick={handleDownload} disabled={exporting} className="gap-1 text-xs sm:text-sm px-2 sm:px-3">
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
            {exporting ? "Generating…" : <><span className="hidden sm:inline">Download as PDF</span><span className="sm:hidden">PDF</span></>}
          </Button>
        </div>
        <div className="resume-preview-container overflow-x-auto">
          <div ref={containerRef} className="origin-top-left sm:origin-top">
            <Template {...data} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
