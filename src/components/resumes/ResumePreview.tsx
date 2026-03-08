import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { getTemplateComponent, type ResumeData } from "./templates";

interface Props {
  templateName: string;
  data: ResumeData;
}

export default function ResumePreview({ templateName, data }: Props) {
  const Template = getTemplateComponent(templateName);

  return (
    <div>
      <div className="flex justify-end mb-4 print:hidden">
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="h-4 w-4" />
          Download as PDF
        </Button>
      </div>
      <div className="resume-preview-container border rounded-lg overflow-hidden shadow-sm print:border-none print:shadow-none">
        <Template {...data} />
      </div>
    </div>
  );
}
