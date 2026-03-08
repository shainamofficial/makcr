import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { FileText, X, Upload, Loader2 } from "lucide-react";

const ACCEPTED = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ACCEPT_STRING = ".pdf,.docx";
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const SUPABASE_PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const PARSE_FN_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/parse-resume`;

interface ResumeUploadProps {
  onComplete: (resumeText: string, fileName: string) => void;
  onSkip: () => void;
}

const ResumeUpload = ({ onComplete, onSkip }: ResumeUploadProps) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = useCallback(
    (f: File) => {
      if (!ACCEPTED.includes(f.type)) {
        toast({ title: "Invalid format", description: "Please upload a PDF or DOCX file.", variant: "destructive" });
        return;
      }
      if (f.size > MAX_SIZE) {
        toast({ title: "File too large", description: "Maximum size is 10 MB.", variant: "destructive" });
        return;
      }
      setFile(f);
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
    if (!file || !session) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(PARSE_FN_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to parse resume");
      }

      toast({ title: "Resume processed!", description: "Analyzing your resume..." });
      onComplete(data.text, file.name);
    } catch (err) {
      console.error("Resume upload error:", err);
      toast({ title: "Upload failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-start gap-3 ml-11">
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-4 max-w-sm w-full">
        {file ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <FileText className="h-8 w-8 text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
              <button
                onClick={() => setFile(null)}
                disabled={uploading}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-2 justify-center">
              <Button size="sm" onClick={handleUpload} disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-3 w-3 mr-1" />
                    Upload & Analyze
                  </>
                )}
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
            className="flex flex-col items-center gap-3 py-5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold">Have a resume? Upload it!</p>
              <p className="text-xs text-muted-foreground max-w-[260px]">
                The AI will read your resume and ask follow-up questions to fill in the details.
              </p>
            </div>
            <Button
              size="sm"
              className="mt-1"
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ACCEPT_STRING;
                input.onchange = (e) => {
                  const f = (e.target as HTMLInputElement).files?.[0];
                  if (f) handleFile(f);
                };
                input.click();
              }}
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Upload Resume (PDF / DOCX)
            </Button>
            <p className="text-[11px] text-muted-foreground">Max 10 MB</p>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => { e.stopPropagation(); onSkip(); }}
              className="text-xs"
            >
              Skip — I'll answer questions instead
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;
