import type { ResumeData } from "./types";
import { groupWorkByCompany } from "./groupWorkByCompany";
import { fmtDate } from "./fmtDate";

function UrlPill({ url, color }: { url: string; color: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 8px", borderRadius: 9999, border: `1px solid ${color}`, color, fontSize: 9, lineHeight: "18px", verticalAlign: "middle" }}>
      {"↗ "}{url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
    </span>
  );
}

const DEFAULT_ORDER = ["education", "summary", "projects", "work", "skills"];

export default function AcademicTemplate({ user, summary, workExperiences, education, skills, projects, profilePictureUrl, includePhoto, sectionOrder }: ResumeData) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Your Name";
  const accent = "#1E40AF";
  const grouped = groupWorkByCompany(workExperiences);

  const groupedSkills = skills.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s.name);
    return acc;
  }, {});

  const sections: Record<string, () => JSX.Element | null> = {
    education: () => education.length > 0 ? (
      <section key="education" style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", margin: "0 0 6px", color: accent }}>Education</h2>
        <div style={{ height: 1, background: accent, opacity: 0.3, marginBottom: 8 }} />
        {education.map((e, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{e.institution}</p>
              <p style={{ fontSize: 10, color: "#6B7280", margin: 0 }}>{fmtDate(e.start_date)} — {fmtDate(e.end_date)}</p>
            </div>
            <p style={{ fontSize: 11, margin: "2px 0 0", fontStyle: "italic", lineHeight: 1.5 }}>{e.degree} in {e.discipline}</p>
          </div>
        ))}
      </section>
    ) : null,
    summary: () => summary ? (
      <section key="summary" style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", margin: "0 0 6px", color: accent }}>Research Interests</h2>
        <div style={{ height: 1, background: accent, opacity: 0.3, marginBottom: 8 }} />
        <p style={{ fontSize: 11, lineHeight: 1.7, margin: 0, color: "#374151" }}>{summary}</p>
      </section>
    ) : null,
    projects: () => projects.length > 0 ? (
      <section key="projects" style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", margin: "0 0 6px", color: accent }}>Publications & Projects</h2>
        <div style={{ height: 1, background: accent, opacity: 0.3, marginBottom: 8 }} />
        {projects.map((p, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <p style={{ fontSize: 11, margin: 0, lineHeight: 1.6 }}><strong>{p.title}</strong> — {p.description}</p>
            {p.urls?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                {p.urls.map((u, j) => <UrlPill key={j} url={u} color={accent} />)}
              </div>
            )}
          </div>
        ))}
      </section>
    ) : null,
    work: () => grouped.length > 0 ? (
      <section key="work" style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", margin: "0 0 6px", color: accent }}>Professional Experience</h2>
        <div style={{ height: 1, background: accent, opacity: 0.3, marginBottom: 8 }} />
        {grouped.map((g, gi) => (
          <div key={gi} style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 700, margin: "0 0 4px" }}>{g.company}</p>
            {g.roles.map((r, ri) => (
              <div key={ri} style={{ marginBottom: 8, paddingLeft: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <p style={{ fontSize: 11, fontWeight: 600, margin: 0 }}>{r.title}</p>
                  <p style={{ fontSize: 10, color: "#6B7280", margin: 0 }}>{fmtDate(r.start_date)} — {fmtDate(r.end_date)}</p>
                </div>
                {r.points.length > 0 && (
                  <ul style={{ margin: "4px 0 0", paddingLeft: 18, fontSize: 11, lineHeight: 1.6, listStyleType: "disc" }}>
                    {r.points.map((p, j) => <li key={j} style={{ marginBottom: 2 }}>{p}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ))}
      </section>
    ) : null,
    skills: () => Object.keys(groupedSkills).length > 0 ? (
      <section key="skills" style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", margin: "0 0 6px", color: accent }}>Technical Skills</h2>
        <div style={{ height: 1, background: accent, opacity: 0.3, marginBottom: 8 }} />
        {Object.entries(groupedSkills).map(([cat, names]) => (
          <p key={cat} style={{ fontSize: 11, margin: "0 0 4px", lineHeight: 1.6 }}><strong>{cat}:</strong> {names.join(", ")}</p>
        ))}
      </section>
    ) : null,
  };

  const order = sectionOrder ?? DEFAULT_ORDER;

  return (
    <div className="resume-page academic-template" style={{ fontFamily: "Georgia, 'Palatino Linotype', serif", width: "8.5in", minHeight: "11in", margin: "0 auto", background: "#fff", color: "#000", padding: "0.75in 1in", wordSpacing: "0.05em" }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        {includePhoto && profilePictureUrl && (
          <img src={profilePictureUrl} alt="" style={{ width: 55, height: 55, borderRadius: "50%", objectFit: "cover", margin: "0 auto 8px" }} />
        )}
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{fullName}</h1>
        <p style={{ fontSize: 11, margin: "4px 0 0", lineHeight: 1.5, color: "#4B5563" }}>{[user.email, user.phone_number].filter(Boolean).join("  ·  ")}</p>
      </div>
      <div style={{ height: 2, background: accent, margin: "0 0 16px" }} />
      {order.map(key => sections[key]?.())}
    </div>
  );
}
