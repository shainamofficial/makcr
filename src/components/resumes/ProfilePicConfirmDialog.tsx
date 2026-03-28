import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Loader2, Upload } from "lucide-react";
import { uploadProfilePicture } from "@/lib/chat-service";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userId: string;
  currentPicUrl: string | null;
  userName: string;
}

export default function ProfilePicConfirmDialog({ open, onClose, onConfirm, userId, currentPicUrl, userName }: Props) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const hasPhoto = !!currentPicUrl;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5 MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      await uploadProfilePicture(userId, file);
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["user_profile_resume"] });
      toast({ title: "Profile picture updated!" });
      // After upload, proceed with generation
      onConfirm();
    } catch {
      toast({ title: "Failed to upload picture", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const initials = userName.split(" ").map(n => n[0]).join("").toUpperCase() || "?";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{hasPhoto ? "Confirm Profile Picture" : "Upload Profile Picture"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {hasPhoto ? (
            <>
              <Avatar className="h-32 w-32 text-4xl">
                <AvatarImage src={currentPicUrl!} alt={userName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-4xl">{initials}</AvatarFallback>
              </Avatar>
              <p className="text-sm text-muted-foreground text-center">
                This photo will be included in your resume. Would you like to use it or upload a new one?
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center h-32 w-32 rounded-full border-2 border-dashed border-muted-foreground/30">
                <Camera className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                You don't have a profile picture yet. Please upload one to include it in your resume.
              </p>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleUpload}
        />

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Uploading...</>
            ) : (
              <><Upload className="h-4 w-4 mr-2" />{hasPhoto ? "Upload New" : "Upload Photo"}</>
            )}
          </Button>
          {hasPhoto && (
            <Button onClick={onConfirm} disabled={uploading}>
              Use This Photo
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
