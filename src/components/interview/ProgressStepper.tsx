import { Briefcase, GraduationCap, FolderOpen, Wrench, Camera, Check } from "lucide-react";

const steps = [
  { key: "work_experience", label: "Work Experience", icon: Briefcase, aliases: ["work_experience_points"] },
  { key: "education", label: "Education", icon: GraduationCap, aliases: ["extra_curriculars", "positions_of_responsibility"] },
  { key: "projects", label: "Projects", icon: FolderOpen, aliases: [] },
  { key: "skills", label: "Skills", icon: Wrench, aliases: [] },
  { key: "profile_photo", label: "Photo", icon: Camera, aliases: ["completed"] },
];

interface ProgressStepperProps {
  currentTopic: string | null;
}

const ProgressStepper = ({ currentTopic }: ProgressStepperProps) => {
  const currentIndex = steps.findIndex(
    (s) => s.key === currentTopic || s.aliases.includes(currentTopic ?? "")
  );

  return (
    <div className="flex items-center justify-center gap-1 px-2 sm:px-4 py-2 sm:py-3 border-b border-border bg-background overflow-x-auto scrollbar-none">
      {steps.map((step, i) => {
        const isCompleted = currentIndex > i;
        const isActive = currentIndex === i;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-center">
            {i > 0 && (
              <div
                className={`hidden sm:block w-6 h-px mx-1 ${
                  isCompleted ? "bg-primary" : "bg-border"
                }`}
              />
            )}
            <div
              className={`flex items-center gap-1 sm:gap-1.5 rounded-full px-2 sm:px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap min-h-[32px] ${
                isCompleted
                  ? "bg-primary/10 text-primary"
                  : isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {isCompleted ? (
                <Check className="h-3 w-3" />
              ) : (
                <Icon className="h-3 w-3" />
              )}
              <span className="hidden sm:inline">{step.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProgressStepper;
