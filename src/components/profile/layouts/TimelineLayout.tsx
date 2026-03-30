import type { ProfileLayoutProps } from "./types";
import ProfileHeader from "@/components/profile/ProfileHeader";
import SkillsSection from "@/components/profile/SkillsSection";
import ProjectsSection from "@/components/profile/ProjectsSection";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Briefcase, GraduationCap } from "lucide-react";

function fmt(d: string | null) {
  return d ? format(new Date(d), "MMM yyyy") : "";
}
function range(s: string | null, e: string | null) {
  const start = fmt(s);
  const end = e ? fmt(e) : "Present";
  return start ? `${start} — ${end}` : end;
}

interface TimelineEntry {
  id: string;
  type: "work" | "education";
  title: string;
  subtitle: string;
  dateRange: string;
  startDate: string | null;
  description?: string;
  badges?: string[];
  points?: { id: string; details: string; impact?: string }[];
}

export default function TimelineLayout({ profile, workData, educationData, skillsData, projectsData }: ProfileLayoutProps) {
  const entries: TimelineEntry[] = [
    ...workData.map((w: any) => ({
      id: w.id,
      type: "work" as const,
      title: w.title,
      subtitle: w.company?.name ?? "",
      dateRange: range(w.start_date, w.end_date),
      startDate: w.start_date,
      description: w.description,
      badges: w.is_full_remote ? ["Remote"] : [],
      points: w.work_experience_points?.map((p: any) => ({ id: p.id, details: p.details, impact: p.impact })) ?? [],
    })),
    ...educationData.map((e: any) => ({
      id: e.id,
      type: "education" as const,
      title: `${e.degree?.degree_name ?? ""} — ${e.discipline?.discipline_name ?? ""}`,
      subtitle: e.institution?.institution_name ?? "",
      dateRange: range(e.start_date, e.end_date),
      startDate: e.start_date,
    })),
  ].sort((a, b) => {
    if (!a.startDate) return -1;
    if (!b.startDate) return 1;
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  return (
    <div className="space-y-8 sm:space-y-10">
      <ProfileHeader profile={profile} />

      {entries.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-6">Experience & Education</h2>
          <div className="relative border-l-2 border-primary/20 ml-4 pl-8 space-y-8">
            {entries.map((entry) => (
              <div key={entry.id} className="relative">
                {/* Dot */}
                <div className="absolute -left-[2.55rem] top-1 flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 border-2 border-primary">
                  {entry.type === "work" ? (
                    <Briefcase className="h-3 w-3 text-primary" />
                  ) : (
                    <GraduationCap className="h-3 w-3 text-primary" />
                  )}
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">{entry.dateRange}</p>
                  <h3 className="text-base font-semibold text-foreground">{entry.title}</h3>
                  <p className="text-sm text-muted-foreground">{entry.subtitle}</p>
                  {entry.badges && entry.badges.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {entry.badges.map((b) => (
                        <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>
                      ))}
                    </div>
                  )}
                  {entry.description && <p className="text-sm mt-2">{entry.description}</p>}
                  {entry.points && entry.points.length > 0 && (
                    <ul className="ml-4 mt-2 space-y-1">
                      {entry.points.map((pt) => (
                        <li key={pt.id} className="text-sm list-disc">
                          {pt.details}
                          {pt.impact && <span className="italic text-muted-foreground"> — {pt.impact}</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {skillsData.length > 0 && <SkillsSection data={skillsData} />}
      {projectsData.length > 0 && <ProjectsSection data={projectsData} />}
    </div>
  );
}
