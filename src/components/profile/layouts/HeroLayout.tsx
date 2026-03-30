import type { ProfileLayoutProps } from "./types";
import ProfileHeader from "@/components/profile/ProfileHeader";
import WorkExperienceSection from "@/components/profile/WorkExperienceSection";
import EducationSection from "@/components/profile/EducationSection";
import SkillsSection from "@/components/profile/SkillsSection";
import ProjectsSection from "@/components/profile/ProjectsSection";

export default function HeroLayout({ profile, workData, educationData, skillsData, projectsData }: ProfileLayoutProps) {
  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <div className="relative rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 p-8 sm:p-12">
        <ProfileHeader profile={profile} />
      </div>

      {/* Two-column body */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Experience & Projects */}
        <div className="lg:col-span-2 space-y-8">
          {workData.length > 0 && <WorkExperienceSection data={workData} />}
          {projectsData.length > 0 && <ProjectsSection data={projectsData} />}
        </div>

        {/* Right: Education & Skills */}
        <div className="space-y-8">
          {educationData.length > 0 && <EducationSection data={educationData} />}
          {skillsData.length > 0 && <SkillsSection data={skillsData} />}
        </div>
      </div>
    </div>
  );
}
