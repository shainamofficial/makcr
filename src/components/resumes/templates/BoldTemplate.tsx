import type { ResumeData } from "./types";
import { groupWorkByCompany } from "./groupWorkByCompany";
import { fmtDate } from "./fmtDate";

const DEFAULT_ORDER = ["summary", "work", "projects", "education", "skills"];

export default function BoldTemplate({ user, summary, workExperiences, education, skills, projects, profilePictureUrl, includePhoto, sectionOrder }: ResumeData) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Your Name";
  const grouped = groupWorkByCompany(workExperiences);

  const groupedSkills = skills.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s.name);
    return acc;
  }, {});

  const sections: Record<string, () => JSX.Element | null> = {
    summary: () => summary ? (
      <section key="summary" style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 15, fontWeight: 900, textTransform: "uppercase", margin: "0 0 6px", borderBottom: "3px solid #111", paddingBottom: 4 }}>Summary</h2>
        <p style={{ fontSize: 11, lineHeight: 1.7, margin: 0, color: "#374151" }}>{summary}</p>
      </section>
    ) : null,
    work: () => grouped.length > 0 ? (
      <section key="work" style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 15, fontWeight: 900, textTransform: "uppercase", margin: "0 0 6px", borderBottom: "3px solid #111", paddingBottom: 4 }}>Experience</h2>
        {grouped.map((g, gi) => (
          <div key={gi} style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 900, margin: "0 0 4px" }}>{g.company}</p>
            {g.roles.map((r, ri) => (
              <div key={ri} style={{ marginBottom: 8, paddingLeft: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, margin: 0 }}>{r.title}</p>
                  <p style={{ fontSize: 10, color: "#6B7280", margin: 0 }}>{fmtDate(r.start_date)} — {fmtDate(r.end_date)}</p>
                </div>
                {r.points.length > 0 && (
                  <ul style={{ margin: "4px 0 0", paddingLeft: 16, fontSize: 11, lineHeight: 1.6, listStyleType: "disc" }}>
                    {r.points.map((p, j) => <li key={j} style={{ marginBottom: 2 }}>{p}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ))}
      </section>
    ) : null,
    projects: () => projects.length > 0 ? (
      <section key="projects" style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 15, fontWeight: 900, textTransform: "uppercase", margin: "0 0 6px", borderBottom: "3px solid #111", paddingBottom: 4 }}>Projects</h2>
        {projects.map((p, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <p style={{ fontSize: 12, fontWeight: 900, margin: 0 }}>{p.title}</p>
            <p style={{ fontSize: 11, margin: "2px 0 0", lineHeight: 1.6, color: "#374151" }}>{p.description}</p>
            {p.urls?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                {p.urls.map((u, j) => <UrlPill key={j} url={u} color="#111" />)}
              </div>
            )}
          </div>
        ))}
      </section>
    ) : null,
    education: () => education.length > 0 ? (
      <section key="education" style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 15, fontWeight: 900, textTransform: "uppercase", margin: "0 0 6px", borderBottom: "3px solid #111", paddingBottom: 4 }}>Education</h2>
        {education.map((e, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <p style={{ fontSize: 12, fontWeight: 900, margin: 0 }}>{e.institution}</p>
            <p style={{ fontSize: 11, margin: "2px 0 0", lineHeight: 1.5 }}>{e.degree} — {e.discipline} | {fmtDate(e.start_date)} — {fmtDate(e.end_date)}</p>
          </div>
        ))}
      </section>
    ) : null,
    skills: () => Object.keys(groupedSkills).length > 0 ? (
      <section key="skills" style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 15, fontWeight: 900, textTransform: "uppercase", margin: "0 0 6px", borderBottom: "3px solid #111", paddingBottom: 4 }}>Skills</h2>
        {Object.entries(groupedSkills).map(([cat, names]) => (
          <p key={cat} style={{ fontSize: 11, margin: "0 0 4px", lineHeight: 1.6 }}><strong>{cat}:</strong> {names.join(", ")}</p>
        ))}
      </section>
    ) : null,
  };

  const order = sectionOrder ?? DEFAULT_ORDER;

  return (
    <div className="resume-page bold-template" style={{ fontFamily: "Inter, system-ui, sans-serif", width: "210mm", minHeight: "297mm", margin: "0 auto", background: "#fff", color: "#000", padding: "15mm 20mm", wordSpacing: "0.05em" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
        {includePhoto && profilePictureUrl && (
          <img src={profilePictureUrl} alt="" style={{ width: 60, height: 60, borderRadius: 4, objectFit: "cover" }} />
        )}
        <h1 style={{ fontSize: 34, fontWeight: 900, margin: 0, textTransform: "uppercase", letterSpacing: 2 }}>{fullName}</h1>
      </div>
      <div style={{ background: "#111", color: "#fff", padding: "6px 14px", fontSize: 11, marginBottom: 20, borderRadius: 2, lineHeight: 1.5 }}>
        {[user.email, user.phone_number].filter(Boolean).join("  ·  ")}
      </div>
      {order.map(key => sections[key]?.())}
    </div>
  );
}
