import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Loader2 } from "lucide-react";
import { getTemplateComponent, type ResumeData } from "./templates";
import { exportElementAsPdf } from "@/lib/export-pdf";

interface Props {
  templateName: string;
  data: ResumeData;
}

export default function ResumePreview({ templateName, data }: Props) {
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
    <div>
      <div className="flex justify-end mb-4 print:hidden">
        <Button onClick={handleDownload} disabled={exporting} className="gap-2">
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
          {exporting ? "Generating…" : "Download as PDF"}
        </Button>
      </div>
      <div ref={containerRef} className="resume-preview-container border rounded-lg overflow-hidden shadow-sm print:border-none print:shadow-none">
        <Template {...data} />
      </div>
    </div>
  );
}
