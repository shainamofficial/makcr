import { LayoutGrid, Clock, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import type { ProfileLayoutType } from "./layouts/types";

const layouts: { key: ProfileLayoutType; label: string; icon: React.ReactNode }[] = [
  { key: "classic", label: "Classic", icon: <LayoutGrid className="h-4 w-4" /> },
  { key: "timeline", label: "Timeline", icon: <Clock className="h-4 w-4" /> },
  { key: "minimal", label: "Minimal", icon: <AlignLeft className="h-4 w-4" /> },
];

interface Props {
  value: ProfileLayoutType;
  onChange: (layout: ProfileLayoutType) => void;
  saving?: boolean;
}

export default function LayoutPicker({ value, onChange, saving }: Props) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 rounded-lg border bg-card p-1">
        {layouts.map((l) => (
          <Tooltip key={l.key}>
            <TooltipTrigger asChild>
              <Button
                variant={value === l.key ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => onChange(l.key)}
                disabled={saving}
              >
                {l.icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{l.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
