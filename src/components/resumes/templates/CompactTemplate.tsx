import type { ResumeData } from "./types";
import { groupWorkByCompany } from "./groupWorkByCompany";
import { fmtDate } from "./fmtDate";

function UrlPill({ url, color }: { url: string; color: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" data-pdf-url={url}
       style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 8px", borderRadius: 9999, border: `1px solid ${color}`, color, fontSize: 8, lineHeight: "16px", verticalAlign: "middle", textDecoration: "none" }}>
      {"↗ "}{url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
    </a>
  );
}

const DEFAULT_ORDER = ["summary", "work", "projects", "education", "skills"];

export default function CompactTemplate({ user, summary, workExperiences, education, skills, projects, profilePictureUrl, includePhoto, sectionOrder }: ResumeData) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Your Name";
  const accent = "#4F46E5";
  const grouped = groupWorkByCompany(workExperiences);

  const groupedSkills = skills.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s.name);
    return acc;
  }, {});

  const sections: Record<string, () => JSX.Element | null> = {
    summary: () => summary ? <p key="summary" style={{ fontSize: 9, lineHeight: 1.6, margin: "0 0 8px", color: "#374151" }}>{summary}</p> : null,
    work: () => grouped.length > 0 ? (
      <section key="work" style={{ marginBottom: 8 }}>
        <h2 style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", margin: "0 0 4px", color: accent }}>Experience</h2>
        {grouped.map((g, gi) => (
          <div key={gi} style={{ marginBottom: 6 }}>
            <p style={{ fontSize: 10, fontWeight: 700, margin: "0 0 2px" }}>{g.company}</p>
            {g.roles.map((r, ri) => (
              <div key={ri} style={{ marginBottom: 4, paddingLeft: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <p style={{ fontSize: 9, fontWeight: 600, margin: 0 }}>{r.title}</p>
                  <p style={{ fontSize: 8, color: "#9CA3AF", margin: 0 }}>{fmtDate(r.start_date)} — {fmtDate(r.end_date)}</p>
                </div>
                {r.points.length > 0 && (
                  <ul style={{ margin: "2px 0 0", paddingLeft: 14, fontSize: 9, lineHeight: 1.5, listStyleType: "disc" }}>
                    {r.points.map((p, j) => <li key={j} style={{ marginBottom: 1 }}>{p}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ))}
      </section>
    ) : null,
    projects: () => projects.length > 0 ? (
      <section key="projects" style={{ marginBottom: 8 }}>
        <h2 style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", margin: "0 0 4px", color: accent }}>Projects</h2>
        {projects.map((p, i) => (
          <div key={i} style={{ marginBottom: 5 }}>
            <p style={{ fontSize: 9, margin: 0, lineHeight: 1.5 }}><strong>{p.title}</strong> — {p.description}</p>
            {p.urls?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 2 }}>
                {p.urls.map((u, j) => <UrlPill key={j} url={u} color={accent} />)}
              </div>
            )}
          </div>
        ))}
      </section>
    ) : null,
    education: () => education.length > 0 ? (
      <section key="education" style={{ marginBottom: 8 }}>
        <h2 style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", margin: "0 0 4px", color: accent }}>Education</h2>
        {education.map((e, i) => (
          <p key={i} style={{ fontSize: 9, margin: "0 0 3px", lineHeight: 1.5 }}>
            <strong>{e.institution}</strong> — {e.degree}, {e.discipline} ({fmtDate(e.start_date)} — {fmtDate(e.end_date)})
          </p>
        ))}
      </section>
    ) : null,
    skills: () => Object.keys(groupedSkills).length > 0 ? (
      <section key="skills" style={{ marginBottom: 8 }}>
        <h2 style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", margin: "0 0 4px", color: accent }}>Skills</h2>
        {Object.entries(groupedSkills).map(([cat, names]) => (
          <div key={cat} style={{ marginBottom: 4 }}>
            <span style={{ fontSize: 9, fontWeight: 600 }}>{cat}: </span>
            {names.map((n, i) => (
              <span key={i} style={{ fontSize: 8, background: "#EEF2FF", color: accent, borderRadius: 8, padding: "1px 6px", marginRight: 3, display: "inline-block", marginBottom: 2 }}>{n}</span>
            ))}
          </div>
        ))}
      </section>
    ) : null,
  };

  const order = sectionOrder ?? DEFAULT_ORDER;

  return (
    <div className="resume-page compact-template" style={{ fontFamily: "Inter, system-ui, sans-serif", width: "210mm", minHeight: "297mm", margin: "0 auto", background: "#fff", color: "#000", padding: "10mm 12mm", wordSpacing: "0.05em" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        {includePhoto && profilePictureUrl && (
          <img src={profilePictureUrl} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{fullName}</h1>
          <p style={{ fontSize: 9, margin: 0, color: "#6B7280", lineHeight: 1.5 }}>{[user.email, user.phone_number].filter(Boolean).join(" | ")}</p>
        </div>
      </div>
      <div style={{ height: 2, background: accent, borderRadius: 1, margin: "0 0 8px" }} />
      {order.map(key => sections[key]?.())}
    </div>
  );
}
