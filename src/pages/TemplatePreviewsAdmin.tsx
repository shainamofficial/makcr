import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { ClassicTemplate, ModernTemplate, MinimalTemplate } from "@/components/resumes/templates";
import type { ResumeData } from "@/components/resumes/templates/types";

const dummy: ResumeData = {
  user: { first_name: "Jane", last_name: "Smith", email: "jane@example.com", phone_number: "+1 555 123 4567" },
  summary: "Product manager with 8 years of experience in B2B SaaS. Led cross-functional teams to ship products used by 10M+ users. Passionate about data-driven decision making.",
  workExperiences: [
    {
      company: "Acme Corp",
      title: "Senior Product Manager",
      start_date: "2021-03-01",
      end_date: null,
      points: [
        "Led a team of 12 engineers and designers to launch a new analytics platform, increasing customer retention by 25%.",
        "Defined product roadmap for a $15M ARR product line, prioritizing features based on user research and business impact.",
        "Implemented A/B testing framework that reduced decision-making time by 40% and improved feature adoption rates.",
      ],
    },
    {
      company: "StartupXYZ",
      title: "Product Manager",
      start_date: "2017-06-01",
      end_date: "2021-02-28",
      points: [
        "Shipped mobile app v2.0 that achieved 4.8★ rating and 500K+ downloads in the first quarter.",
        "Collaborated with sales and marketing to develop go-to-market strategy, resulting in 3x pipeline growth.",
        "Built and maintained product analytics dashboard used by the entire 40-person company for daily standups.",
      ],
    },
  ],
  education: [
    { institution: "University of California, Berkeley", degree: "Bachelor of Science", discipline: "Computer Science", start_date: "2013-08-01", end_date: "2017-05-15" },
  ],
  skills: [
    { name: "Product Strategy", category: "Product", proficiency: "Expert" },
    { name: "User Research", category: "Product", proficiency: "Advanced" },
    { name: "SQL", category: "Technical", proficiency: "Advanced" },
    { name: "Python", category: "Technical", proficiency: "Intermediate" },
    { name: "Stakeholder Management", category: "Leadership", proficiency: "Expert" },
    { name: "Agile / Scrum", category: "Leadership", proficiency: "Advanced" },
  ],
  projects: [
    { title: "Open Source Analytics SDK", description: "Created a lightweight analytics SDK for React applications. Used by 200+ projects on GitHub with 1.2K stars.", urls: ["https://github.com/janesmith/analytics-sdk"] },
  ],
  profilePictureUrl: null,
  includePhoto: false,
};

const templates = [
  { name: "Classic", Component: ClassicTemplate },
  { name: "Modern", Component: ModernTemplate },
  { name: "Minimal", Component: MinimalTemplate },
] as const;

export default function TemplatePreviewsAdmin() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  const printTemplate = (index: number) => {
    const el = refs.current[index];
    if (!el) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Print Template</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @page { size: letter; margin: 0; }
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      </style>
      </head><body>${el.innerHTML}</body></html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
  };

  return (
    <div className="bg-muted min-h-screen py-20 px-6 space-y-16 print:hidden">
      <h1 className="text-3xl font-bold text-foreground text-center">Template Previews</h1>

      {templates.map((t, i) => (
        <div key={t.name} className="max-w-[9in] mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-foreground">{t.name} Template</h2>
            <Button variant="outline" size="sm" onClick={() => printTemplate(i)} className="gap-2">
              <Printer className="h-4 w-4" /> Print This Template
            </Button>
          </div>
          <div ref={(el) => { refs.current[i] = el; }} className="border rounded-lg overflow-hidden shadow-lg">
            <t.Component {...dummy} includePhoto={t.name === "Modern"} profilePictureUrl={t.name === "Modern" ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face" : null} />
          </div>
        </div>
      ))}
    </div>
  );
}
