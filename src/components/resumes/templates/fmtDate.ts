export function fmtDate(d: string | null | undefined): string {
  if (!d) return "Present";
  const trimmed = d.trim();
  if (!trimmed) return "Present";
  const date = new Date(trimmed);
  if (isNaN(date.getTime())) return "Present";
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
