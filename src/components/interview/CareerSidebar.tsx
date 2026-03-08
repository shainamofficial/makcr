import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Briefcase, GraduationCap, Wrench, FolderOpen, ChevronDown, CheckCircle2 } from "lucide-react";

interface WorkExp {
  title: string;
  company: { name: string } | null;
}
interface Education {
  institution: { institution_name: string } | null;
  degree: { degree_name: string } | null;
}
interface Skill {
  proficiency: string;
  skill: { skill_name: string } | null;
}
interface Project {
  title: string;
}

interface CareerSidebarProps {
  refreshKey?: number;
  inline?: boolean;
}

const CareerSidebar = ({ refreshKey, inline }: CareerSidebarProps) => {
  const { user } = useAuth();
  const [workExps, setWorkExps] = useState<WorkExp[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!user) return;
    const uid = user.id;

    supabase
      .from("work_experience")
      .select("title, company:company_id(name)")
      .eq("user_id", uid)
      .order("start_date", { ascending: false })
      .then(({ data }) => setWorkExps((data as unknown as WorkExp[]) ?? []))
      .catch(console.error);

    supabase
      .from("education")
      .select("institution:institution_id(institution_name), degree:degree_id(degree_name)")
      .eq("user_id", uid)
      .order("start_date", { ascending: false })
      .then(({ data }) => setEducations((data as unknown as Education[]) ?? []))
      .catch(console.error);

    supabase
      .from("user_skill_mapping")
      .select("proficiency, skill:skill_id(skill_name)")
      .eq("user_id", uid)
      .then(({ data }) => setSkills((data as unknown as Skill[]) ?? []))
      .catch(console.error);

    supabase
      .from("project")
      .select("title")
      .eq("user_id", uid)
      .order("start_date", { ascending: false })
      .then(({ data }) => setProjects((data as unknown as Project[]) ?? []))
      .catch(console.error);
  }, [user, refreshKey]);

  const sections = [
    {
      icon: Briefcase,
      title: "Work Experience",
      items: workExps,
      render: (w: WorkExp, i: number) => (
        <div key={`work-${i}`}>
          <p className="text-sm font-medium text-foreground">{w.title}</p>
          <p className="text-xs text-muted-foreground">{w.company?.name ?? "Unknown"}</p>
        </div>
      ),
    },
    {
      icon: GraduationCap,
      title: "Education",
      items: educations,
      render: (e: Education, i: number) => (
        <div key={`edu-${i}`}>
          <p className="text-sm font-medium text-foreground">
            {e.degree?.degree_name ?? "Degree"}
          </p>
          <p className="text-xs text-muted-foreground">
            {e.institution?.institution_name ?? "Institution"}
          </p>
        </div>
      ),
    },
    {
      icon: Wrench,
      title: "Skills",
      items: skills,
      render: (s: Skill, i: number) => (
        <div key={`skill-${i}`} className="flex items-center justify-between">
          <span className="text-sm text-foreground">{s.skill?.skill_name ?? "Skill"}</span>
          <Badge variant="secondary" className="text-xs">
            {s.proficiency}
          </Badge>
        </div>
      ),
    },
    {
      icon: FolderOpen,
      title: "Projects",
      items: projects,
      render: (p: Project, i: number) => (
        <p key={`proj-${i}`} className="text-sm text-foreground">{p.title}</p>
      ),
    },
  ];

  if (inline) {
    return (
      <div className="space-y-2">
        {sections.map((section) => {
          const hasEntries = section.items.length > 0;
          return (
            <Collapsible key={section.title} defaultOpen>
              <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-foreground hover:bg-accent/50 transition-colors">
                {hasEntries ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "hsl(142, 71%, 45%)" }} />
                ) : (
                  <section.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span className="flex-1 text-left">
                  {section.title}
                  {hasEntries && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({section.items.length})
                    </span>
                  )}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform [[data-state=open]>&]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-2 pb-2">
                {!hasEntries ? (
                  <p className="text-xs text-muted-foreground pl-6 py-1">No entries yet</p>
                ) : (
                  <div className="space-y-2 pl-6 pt-1">
                    {section.items.map((item, i) => section.render(item as any, i))}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    );
  }

  return (
    <aside className="hidden md:flex md:flex-col w-[30%] border-l border-border bg-muted/30 overflow-y-auto">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Career Graph Summary</h2>
      </div>
      <div className="p-3 space-y-2">
        {sections.map((section) => {
          const hasEntries = section.items.length > 0;
          return (
            <Collapsible key={section.title} defaultOpen>
              <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-foreground hover:bg-accent/50 transition-colors">
                {hasEntries ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "hsl(142, 71%, 45%)" }} />
                ) : (
                  <section.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span className="flex-1 text-left">
                  {section.title}
                  {hasEntries && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({section.items.length})
                    </span>
                  )}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform [[data-state=open]>&]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-2 pb-2">
                {!hasEntries ? (
                  <p className="text-xs text-muted-foreground pl-6 py-1">No entries yet</p>
                ) : (
                  <div className="space-y-2 pl-6 pt-1">
                    {section.items.map((item, i) => section.render(item as any, i))}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </aside>
  );
};

export default CareerSidebar;
