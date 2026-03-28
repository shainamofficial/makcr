import { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Loader2, Pencil } from "lucide-react";
import { useUpdateProfile } from "@/hooks/useProfileData";
import { useAuth } from "@/contexts/AuthContext";
import { uploadProfilePicture } from "@/lib/chat-service";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

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
  const [uploading, setUploading] = useState(false);
  const updateProfile = useUpdateProfile();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

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
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
        <Avatar className="h-24 w-24 text-2xl">
          {picUrl && <AvatarImage src={picUrl} alt={fullName} />}
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl">{initials}</AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          {uploading ? (
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
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
