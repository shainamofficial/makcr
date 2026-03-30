import { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Loader2, Pencil, Mail } from "lucide-react";
import { useUpdateProfile } from "@/hooks/useProfileData";
import { useAuth } from "@/contexts/AuthContext";
import { uploadProfilePicture } from "@/lib/chat-service";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import type { ProfileLayoutProps } from "./types";
import WorkExperienceSection from "@/components/profile/WorkExperienceSection";
import EducationSection from "@/components/profile/EducationSection";
import SkillsSection from "@/components/profile/SkillsSection";
import ProjectsSection from "@/components/profile/ProjectsSection";
import { Card, CardContent } from "@/components/ui/card";

export default function HeroLayout({ profile, workData, educationData, skillsData, projectsData }: ProfileLayoutProps) {
  const [editing, setEditing] = useState(false);
  const [summary, setSummary] = useState(profile.profile_summary ?? "");
  const [uploading, setUploading] = useState(false);
  const updateProfile = useUpdateProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const qc = useQueryClient();

  const initials = `${(profile.first_name ?? "")[0] ?? ""}${(profile.last_name ?? "")[0] ?? ""}`.toUpperCase() || "?";
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Unnamed User";
  const picUrl = profile.profile_picture?.link_to_storage;

  const handleSave = () => {
    setEditing(false);
    if (summary !== (profile.profile_summary ?? "")) {
      updateProfile.mutate({ profile_summary: summary || null }, {
        onSuccess: () => toast({ title: "Profile updated successfully" }),
      });
    }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5 MB", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      await uploadProfilePicture(user.id, file);
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast({ title: "Profile picture updated!" });
    } catch {
      toast({ title: "Failed to upload picture", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-accent-foreground text-primary-foreground">
        {/* Decorative shapes */}
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary-foreground/5" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-primary-foreground/5" />
        <div className="absolute top-1/2 right-1/4 h-32 w-32 rounded-full bg-primary-foreground/[0.03]" />

        <div className="relative z-10 flex flex-col items-center gap-6 p-8 sm:flex-row sm:items-center sm:p-10">
          {/* Avatar */}
          <div className="relative group cursor-pointer shrink-0" onClick={handleAvatarClick}>
            <Avatar className="h-28 w-28 text-3xl ring-4 ring-primary-foreground/20 shadow-2xl">
              {picUrl && <AvatarImage src={picUrl} alt={fullName} />}
              <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-3xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              {uploading ? (
                <Loader2 className="h-7 w-7 text-white animate-spin" />
              ) : (
                <Camera className="h-7 w-7 text-white" />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Name & info */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight break-words overflow-hidden">{fullName}</h1>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <span className="flex items-center gap-1.5 text-sm text-primary-foreground/70">
                <Mail className="h-3.5 w-3.5" />
                {profile.email}
              </span>
              {profile.years_of_experience != null && (
                <Badge variant="secondary" className="bg-primary-foreground/15 text-primary-foreground border-0 hover:bg-primary-foreground/20">
                  {profile.years_of_experience} years experience
                </Badge>
              )}
            </div>

            {/* Summary */}
            <div className="mt-4 w-full max-w-2xl overflow-hidden">
              {editing ? (
                <Textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  onBlur={handleSave}
                  autoFocus
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40"
                  placeholder="Write a short profile summary..."
                />
              ) : (
                <div className="group flex items-start gap-2">
                  <p className="text-sm text-primary-foreground/70 leading-relaxed">
                    {summary || <span className="italic">No profile summary yet.</span>}
                  </p>
                  <button
                    onClick={() => setEditing(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-primary-foreground/50 hover:text-primary-foreground shrink-0 mt-0.5"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Two-column body */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Experience & Projects */}
        <div className="lg:col-span-2 space-y-8">
          {workData.length > 0 && <WorkExperienceSection data={workData} />}
          {projectsData.length > 0 && <ProjectsSection data={projectsData} />}
        </div>

        {/* Right: Education & Skills */}
        <div className="space-y-6">
          {educationData.length > 0 && (
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-5">
                <EducationSection data={educationData} />
              </CardContent>
            </Card>
          )}
          {skillsData.length > 0 && (
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-5">
                <SkillsSection data={skillsData} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
