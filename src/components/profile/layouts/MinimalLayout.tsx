import type { ProfileLayoutProps } from "./types";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";

function range(s: string | null, e: string | null) {
  const start = s ? format(new Date(s), "MMM yyyy") : "";
  const end = e ? format(new Date(e), "MMM yyyy") : "Present";
  return start ? `${start} — ${end}` : end;
}

export default function MinimalLayout({ profile, workData, educationData, skillsData, projectsData }: ProfileLayoutProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <ProfileHeader profile={profile} />

      {workData.length > 0 && (
        <>
          <Separator />
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Experience</h2>
            <div className="space-y-4">
              {workData.map((w: any) => (
                <div key={w.id}>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-medium text-foreground">{w.title}</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{range(w.start_date, w.end_date)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{w.company?.name}</p>
                  {w.description && <p className="text-sm mt-1">{w.description}</p>}
                  {w.work_experience_points?.length > 0 && (
                    <ul className="ml-4 mt-1 space-y-0.5">
                      {w.work_experience_points.map((pt: any) => (
                        <li key={pt.id} className="text-sm list-disc">{pt.details}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {educationData.length > 0 && (
        <>
          <Separator />
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Education</h2>
            <div className="space-y-3">
              {educationData.map((e: any) => (
                <div key={e.id}>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-medium text-foreground">{e.institution?.institution_name}</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{range(e.start_date, e.end_date)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{e.degree?.degree_name} — {e.discipline?.discipline_name}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {skillsData.length > 0 && (
        <>
          <Separator />
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Skills</h2>
            <div className="flex flex-wrap gap-1.5">
              {skillsData.map((s: any) => (
                <span key={s.id} className="text-sm text-foreground">
                  {s.skill?.skill_name}{skillsData.indexOf(s) < skillsData.length - 1 ? " ·" : ""}
                </span>
              ))}
            </div>
          </section>
        </>
      )}

      {projectsData.length > 0 && (
        <>
          <Separator />
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Projects</h2>
            <div className="space-y-3">
              {projectsData.map((p: any) => (
                <div key={p.id}>
                  <h3 className="font-medium text-foreground">{p.title}</h3>
                  {p.description && <p className="text-sm mt-0.5">{p.description}</p>}
                  {p.project_urls && Array.isArray(p.project_urls) && p.project_urls.length > 0 && (
                    <div className="flex gap-2 mt-1">
                      {p.project_urls.map((url: string, i: number) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" /> Link
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
