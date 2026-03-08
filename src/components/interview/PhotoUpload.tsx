import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { uploadProfilePicture } from "@/lib/chat-service";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

interface PhotoUploadProps {
  onComplete: (url: string) => void;
  onSkip: () => void;
}

const PhotoUpload = ({ onComplete, onSkip }: PhotoUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleFile = useCallback(
    (f: File) => {
      if (!ACCEPTED.includes(f.type)) {
        toast({ title: "Invalid format", description: "Please upload JPG, PNG, or WebP.", variant: "destructive" });
        return;
      }
      if (f.size > MAX_SIZE) {
        toast({ title: "File too large", description: "Maximum size is 5 MB.", variant: "destructive" });
        return;
      }
      setFile(f);
      setPreview(URL.createObjectURL(f));
    },
    [toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleUpload = async () => {
    if (!file || !user) return;
    setUploading(true);
    try {
      const url = await uploadProfilePicture(user.id, file);
      setUploaded(true);
      onComplete(url);
      toast({ title: "Photo uploaded!", description: "Your profile picture has been saved." });
    } catch (err) {
      console.error("Upload error:", err);
      toast({ title: "Upload failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  if (uploaded && preview) {
    return (
      <div className="flex items-start gap-3 ml-11">
        <div className="rounded-2xl border border-border bg-muted/50 p-4 max-w-xs">
          <img src={preview} alt="Profile" className="w-24 h-24 rounded-full object-cover mx-auto" />
          <p className="text-xs text-muted-foreground text-center mt-2">Photo uploaded ✓</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 ml-11">
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-4 max-w-sm w-full">
        {preview ? (
          <div className="space-y-3">
            <div className="relative w-24 h-24 mx-auto">
              <img src={preview} alt="Preview" className="w-24 h-24 rounded-full object-cover" />
              <button
                onClick={() => { setFile(null); setPreview(null); }}
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="flex gap-2 justify-center">
              <Button size="sm" onClick={handleUpload} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload"}
              </Button>
              <Button size="sm" variant="ghost" onClick={onSkip} disabled={uploading}>
                Skip
              </Button>
            </div>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="flex flex-col items-center gap-2 cursor-pointer py-4"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ACCEPTED.join(",");
              input.onchange = (e) => {
                const f = (e.target as HTMLInputElement).files?.[0];
                if (f) handleFile(f);
              };
              input.click();
            }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Drop a photo here or <span className="text-primary underline">browse</span>
            </p>
            <p className="text-xs text-muted-foreground">JPG, PNG, WebP · Max 5 MB</p>
            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onSkip(); }} className="mt-1">
              Skip for now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoUpload;
