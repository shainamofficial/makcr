import { useState } from "react";
import { useProfileData } from "@/hooks/useProfileData";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { MessageSquare, FileText, Upload } from "lucide-react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import WorkExperienceSection from "@/components/profile/WorkExperienceSection";
import EducationSection from "@/components/profile/EducationSection";
import SkillsSection from "@/components/profile/SkillsSection";
import ProjectsSection from "@/components/profile/ProjectsSection";
import ResumeUpload from "@/components/interview/ResumeUpload";

export default function Profile() {
  const { user } = useAuth();
  const { profileQuery, workQuery, educationQuery, skillsQuery, projectsQuery, isEmpty } = useProfileData();

  const loading = profileQuery.isLoading || workQuery.isLoading;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 pt-20 space-y-6">
        <div className="flex gap-4 items-center">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!profileQuery.data) return null;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-6 pt-20">
        <MessageSquare className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Your career profile is empty</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Get started by uploading your existing resume or let our AI interview you to build your profile from scratch.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg">
            <Link to="/interview">
              <Upload className="h-4 w-4 mr-2" />
              Upload Resume & Get Interviewed
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/interview">
              <MessageSquare className="h-4 w-4 mr-2" />
              Start AI Interview
            </Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground max-w-sm text-center">
          Upload your resume and the AI will read it, then ask clarifying questions to fill in the details.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:p-6 pt-16 sm:pt-20 pb-8 space-y-8 sm:space-y-10">
      <ProfileHeader profile={profileQuery.data as any} />
      {(workQuery.data?.length ?? 0) > 0 && <WorkExperienceSection data={workQuery.data!} />}
      {(educationQuery.data?.length ?? 0) > 0 && <EducationSection data={educationQuery.data!} />}
      {(skillsQuery.data?.length ?? 0) > 0 && <SkillsSection data={skillsQuery.data!} />}
      {(projectsQuery.data?.length ?? 0) > 0 && <ProjectsSection data={projectsQuery.data!} />}
    </div>
  );
}
