import type { ProfileLayoutProps } from "./types";
import ProfileHeader from "@/components/profile/ProfileHeader";
import WorkExperienceSection from "@/components/profile/WorkExperienceSection";
import EducationSection from "@/components/profile/EducationSection";
import SkillsSection from "@/components/profile/SkillsSection";
import ProjectsSection from "@/components/profile/ProjectsSection";

export default function ClassicLayout({ profile, workData, educationData, skillsData, projectsData }: ProfileLayoutProps) {
  return (
    <div className="space-y-8 sm:space-y-10">
      <ProfileHeader profile={profile} />
      {workData.length > 0 && <WorkExperienceSection data={workData} />}
      {educationData.length > 0 && <EducationSection data={educationData} />}
      {skillsData.length > 0 && <SkillsSection data={skillsData} />}
      {projectsData.length > 0 && <ProjectsSection data={projectsData} />}
    </div>
  );
}
