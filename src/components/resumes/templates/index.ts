import ClassicTemplate from "./ClassicTemplate";
import ModernTemplate from "./ModernTemplate";
import MinimalTemplate from "./MinimalTemplate";
import type { ResumeData } from "./types";

export type { ResumeData };

export function getTemplateComponent(templateName: string): React.ComponentType<ResumeData> {
  const normalized = templateName.toLowerCase().trim();
  if (normalized.includes("modern")) return ModernTemplate;
  if (normalized.includes("minimal")) return MinimalTemplate;
  return ClassicTemplate;
}

export { ClassicTemplate, ModernTemplate, MinimalTemplate };
