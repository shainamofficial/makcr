import type { ResumeData } from "./types";
import { groupWorkByCompany } from "./groupWorkByCompany";
import { fmtDate } from "./fmtDate";

function UrlPill({ url, color }: { url: string; color: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" data-pdf-url={url}
       style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 8px", borderRadius: 9999, border: `1px solid ${color}`, color, fontSize: 9, lineHeight: "18px", verticalAlign: "middle", textDecoration: "none" }}>
      {"↗ "}{url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
    </a>
  );
}

export default function ProfessionalTemplate({ user, summary, workExperiences, education, skills, projects, profilePictureUrl, includePhoto, sectionOrder }: ResumeData) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Your Name";
  const accent = "#2563EB";
  const grouped = groupWorkByCompany(workExperiences);

  const groupedSkills = skills.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s.name);
    return acc;
  }, {});

  const mainSections: Record<string, () => JSX.Element | null> = {
    summary: () => summary ? <p key="summary" style={{ fontSize: 11, lineHeight: 1.7, color: "#6B7280", margin: "8px 0 20px" }}>{summary}</p> : null,
    work: () => grouped.length > 0 ? (
      <section key="work" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: accent, margin: "0 0 8px", borderBottom: `2px solid ${accent}`, paddingBottom: 4 }}>Experience</h2>
        {grouped.map((g, gi) => (
          <div key={gi} style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: accent, margin: "0 0 4px" }}>{g.company}</p>
            {g.roles.map((r, ri) => (
              <div key={ri} style={{ marginBottom: 8, paddingLeft: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <p style={{ fontSize: 11, fontWeight: 600, margin: 0 }}>{r.title}</p>
                  <p style={{ fontSize: 10, color: "#9CA3AF", margin: 0 }}>{fmtDate(r.start_date)} — {fmtDate(r.end_date)}</p>
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
      <section key="projects" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: accent, margin: "0 0 8px", borderBottom: `2px solid ${accent}`, paddingBottom: 4 }}>Projects</h2>
        {projects.map((p, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{p.title}</p>
            <p style={{ fontSize: 11, margin: "2px 0 0", lineHeight: 1.6, color: "#374151" }}>{p.description}</p>
            {p.urls?.length > 0 && (
                <div style={{ marginTop: 3 }}>
                  {p.urls.map((u, j) => (
                    <span key={j}>
                      {j > 0 && " · "}
                      <a href={u} target="_blank" rel="noopener noreferrer" data-pdf-url={u}
                         style={{ color: "inherit", fontSize: 10, textDecoration: "underline", textUnderlineOffset: 2 }}>
                        {u.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </a>
                    </span>
                  ))}
                </div>
              )}
          </div>
        ))}
      </section>
    ) : null,
  };

  const mainOrder = (sectionOrder ?? ["summary", "work", "projects", "education", "skills"]).filter(k => k in mainSections);

  return (
    <div className="resume-page professional-template" style={{ fontFamily: "Inter, system-ui, sans-serif", width: "210mm", minHeight: "297mm", margin: "0 auto", background: "#fff", color: "#1a1a1a", display: "flex", wordSpacing: "0.05em" }}>
      <div style={{ width: "32%", background: "#F8FAFC", borderLeft: `3px solid ${accent}`, padding: "15mm 9mm", flexShrink: 0 }}>
        {includePhoto && profilePictureUrl && (
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <img src={profilePictureUrl} alt="" style={{ width: 85, height: 85, borderRadius: "50%", objectFit: "cover", border: `3px solid ${accent}` }} />
          </div>
        )}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: accent, marginBottom: 8 }}>Contact</h3>
          {user.email && <p style={{ fontSize: 10, margin: "0 0 4px", wordBreak: "break-all", lineHeight: 1.5 }}>{user.email}</p>}
          {user.phone_number && <p style={{ fontSize: 10, margin: 0, lineHeight: 1.5 }}>{user.phone_number}</p>}
        </div>
        {Object.keys(groupedSkills).length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: accent, marginBottom: 8 }}>Skills</h3>
            {Object.entries(groupedSkills).map(([cat, names]) => (
              <div key={cat} style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 10, fontWeight: 600, marginBottom: 4, color: accent }}>{cat}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {names.map((n, i) => (
                    <span key={i} style={{ fontSize: 9, background: "#EFF6FF", color: accent, borderRadius: 10, padding: "2px 8px" }}>{n}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {education.length > 0 && (
          <div>
            <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: accent, marginBottom: 8 }}>Education</h3>
            {education.map((e, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 10, fontWeight: 700, margin: 0, lineHeight: 1.5 }}>{e.institution}</p>
                <p style={{ fontSize: 10, margin: "2px 0 0", lineHeight: 1.5 }}>{e.degree} — {e.discipline}</p>
                <p style={{ fontSize: 9, color: "#9CA3AF", margin: "2px 0 0" }}>{fmtDate(e.start_date)} — {fmtDate(e.end_date)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ width: "68%", padding: "15mm 12mm" }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 4px", color: accent }}>{fullName}</h1>
        {mainOrder.map(key => mainSections[key]?.())}
      </div>
    </div>
  );
}
