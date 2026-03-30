import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send } from "lucide-react";

export interface StructuredQuestion {
  id: string;
  label: string;
  type: "text" | "date" | "select" | "textarea";
  options?: string[];
  placeholder?: string;
}

interface MultiQuestionFormProps {
  questions: StructuredQuestion[];
  onSubmit: (formattedAnswer: string) => void;
  disabled?: boolean;
}

const MultiQuestionForm = ({ questions, onSubmit, disabled }: MultiQuestionFormProps) => {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(questions.map((q) => [q.id, ""]))
  );

  const handleChange = (id: string, value: string) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    const lines = questions
      .map((q) => {
        const val = values[q.id]?.trim();
        return val ? `${q.label}: ${val}` : null;
      })
      .filter(Boolean);
    if (lines.length === 0) return;
    onSubmit(lines.join("\n"));
  };

  const hasAnyValue = questions.some((q) => values[q.id]?.trim());

  return (
    <div className="ml-2 sm:ml-11 max-w-[95%] sm:max-w-[75%] space-y-3 rounded-2xl border border-border bg-card p-4">
      {questions.map((q) => (
        <div key={q.id} className="space-y-1.5">
          <Label htmlFor={`q-${q.id}`} className="text-xs font-medium text-muted-foreground">
            {q.label}
          </Label>
          {q.type === "text" && (
            <Input
              id={`q-${q.id}`}
              value={values[q.id] ?? ""}
              onChange={(e) => handleChange(q.id, e.target.value)}
              placeholder={q.placeholder ?? ""}
              disabled={disabled}
              className="h-9 text-sm"
            />
          )}
          {q.type === "date" && (
            <Input
              id={`q-${q.id}`}
              type="date"
              value={values[q.id] ?? ""}
              onChange={(e) => handleChange(q.id, e.target.value)}
              disabled={disabled}
              className="h-9 text-sm"
            />
          )}
          {q.type === "textarea" && (
            <Textarea
              id={`q-${q.id}`}
              value={values[q.id] ?? ""}
              onChange={(e) => handleChange(q.id, e.target.value)}
              placeholder={q.placeholder ?? ""}
              disabled={disabled}
              className="min-h-[60px] text-sm"
              rows={2}
            />
          )}
          {q.type === "select" && q.options && (
            <Select
              value={values[q.id] ?? ""}
              onValueChange={(v) => handleChange(q.id, v)}
              disabled={disabled}
            >
              <SelectTrigger id={`q-${q.id}`} className="h-9 text-sm">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {q.options.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      ))}
      <Button
        size="sm"
        onClick={handleSubmit}
        disabled={disabled || !hasAnyValue}
        className="w-full gap-2"
      >
        <Send className="h-3.5 w-3.5" />
        Send
      </Button>
    </div>
  );
};

export default MultiQuestionForm;
