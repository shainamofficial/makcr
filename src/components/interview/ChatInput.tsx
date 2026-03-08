import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  defaultValue?: string;
  onResumeFile?: (file: File) => void;
}

const ChatInput = ({ onSend, disabled, defaultValue, onResumeFile }: ChatInputProps) => {
  const [value, setValue] = useState(defaultValue ?? "");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (defaultValue !== undefined) {
      setValue(defaultValue);
    }
  }, [defaultValue]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && onResumeFile) {
      onResumeFile(f);
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="border-t border-border bg-background p-3 sm:p-4 pb-[env(safe-area-inset-bottom,0.75rem)]">
      <div className="flex items-end gap-2 max-w-3xl mx-auto">
        {onResumeFile && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => fileRef.current?.click()}
              disabled={disabled}
              className="shrink-0 h-11 w-11 rounded-xl"
              title="Upload resume"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </>
        )}
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          disabled={disabled}
          className="min-h-[44px] max-h-32 resize-none rounded-xl text-base sm:text-sm"
          rows={1}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="shrink-0 h-11 w-11 rounded-xl"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
