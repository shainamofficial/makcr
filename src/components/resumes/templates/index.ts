import ClassicTemplate from "./ClassicTemplate";
import ModernTemplate from "./ModernTemplate";
import MinimalTemplate from "./MinimalTemplate";
import ExecutiveTemplate from "./ExecutiveTemplate";
import ProfessionalTemplate from "./ProfessionalTemplate";
import CreativeTemplate from "./CreativeTemplate";
import ElegantTemplate from "./ElegantTemplate";
import BoldTemplate from "./BoldTemplate";
import TechTemplate from "./TechTemplate";
import AcademicTemplate from "./AcademicTemplate";
import CompactTemplate from "./CompactTemplate";
import TwoColumnTemplate from "./TwoColumnTemplate";
import TimelineTemplate from "./TimelineTemplate";
import InfographicTemplate from "./InfographicTemplate";
import CorporateTemplate from "./CorporateTemplate";
import StarterTemplate from "./StarterTemplate";
import NordicTemplate from "./NordicTemplate";
import ManhattanTemplate from "./ManhattanTemplate";
import DiamondTemplate from "./DiamondTemplate";
import RibbonTemplate from "./RibbonTemplate";
import type { ResumeData } from "./types";

export type { ResumeData };

export function getTemplateComponent(templateName: string): React.ComponentType<ResumeData> {
  const n = templateName.toLowerCase().trim();
  if (n.includes("executive")) return ExecutiveTemplate;
  if (n.includes("professional")) return ProfessionalTemplate;
  if (n.includes("creative")) return CreativeTemplate;
  if (n.includes("elegant")) return ElegantTemplate;
  if (n.includes("bold")) return BoldTemplate;
  if (n.includes("tech")) return TechTemplate;
  if (n.includes("academic")) return AcademicTemplate;
  if (n.includes("compact")) return CompactTemplate;
  if (n.includes("two") && n.includes("column")) return TwoColumnTemplate;
  if (n.includes("timeline")) return TimelineTemplate;
  if (n.includes("infographic")) return InfographicTemplate;
  if (n.includes("corporate")) return CorporateTemplate;
  if (n.includes("starter")) return StarterTemplate;
  if (n.includes("nordic")) return NordicTemplate;
  if (n.includes("manhattan")) return ManhattanTemplate;
  if (n.includes("diamond")) return DiamondTemplate;
  if (n.includes("ribbon")) return RibbonTemplate;
  if (n.includes("modern")) return ModernTemplate;
  if (n.includes("minimal")) return MinimalTemplate;
  return ClassicTemplate;
}

export {
  ClassicTemplate, ModernTemplate, MinimalTemplate,
  ExecutiveTemplate, ProfessionalTemplate, CreativeTemplate,
  ElegantTemplate, BoldTemplate, TechTemplate,
  AcademicTemplate, CompactTemplate, TwoColumnTemplate,
  TimelineTemplate, InfographicTemplate, CorporateTemplate,
  StarterTemplate, NordicTemplate, ManhattanTemplate,
  DiamondTemplate, RibbonTemplate,
};
