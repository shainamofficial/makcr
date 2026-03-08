import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import { getTemplateComponent } from "./templates";
import type { ResumeData } from "./templates/types";

interface Props {
  templateName: string;
  data: ResumeData;
  onClose: () => void;
}

export default function ResumePreviewModal({ templateName, data, onClose }: Props) {
  const Template = getTemplateComponent(templateName);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[9in] w-full max-h-[95vh] overflow-y-auto p-0">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-background border-b px-4 py-3 print:hidden">
          <Button variant="ghost" size="sm" onClick={onClose} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
          <Button size="sm" onClick={() => window.print()} className="gap-1">
            <Printer className="h-4 w-4" /> Download as PDF
          </Button>
        </div>
        <div className="resume-preview-container">
          <Template {...data} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
