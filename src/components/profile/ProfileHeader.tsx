import { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import { useUpdateProfile } from "@/hooks/useProfileData";

interface Props {
  profile: {
    first_name: string | null;
    last_name: string | null;
    email: string;
    profile_summary: string | null;
    years_of_experience: number | null;
    profile_picture?: { link_to_storage: string } | null;
  };
}

export default function ProfileHeader({ profile }: Props) {
  const [editing, setEditing] = useState(false);
  const [summary, setSummary] = useState(profile.profile_summary ?? "");
  const updateProfile = useUpdateProfile();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <Avatar className="h-24 w-24 text-2xl">
        {picUrl && <AvatarImage src={picUrl} alt={fullName} />}
        <AvatarFallback className="bg-primary text-primary-foreground text-2xl">{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 text-center sm:text-left">
        <h1 className="text-3xl font-bold text-foreground">{fullName}</h1>
        <p className="text-muted-foreground">{profile.email}</p>

        {profile.years_of_experience != null && (
          <Badge variant="secondary" className="mt-1">
            {profile.years_of_experience} years experience
          </Badge>
        )}

        <div className="mt-3">
          {editing ? (
            <Textarea
              ref={textareaRef}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              onBlur={handleSave}
              autoFocus
              className="max-w-lg"
              placeholder="Write a short profile summary..."
            />
          ) : (
            <div className="group flex items-start gap-2">
              <p className="text-sm text-muted-foreground max-w-lg">
                {summary || <span className="italic">No profile summary yet.</span>}
              </p>
              <button
                onClick={() => setEditing(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
