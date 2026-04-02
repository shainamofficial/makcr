import type { ResumeData } from "./types";
import { groupWorkByCompany } from "./groupWorkByCompany";
import { fmtDate } from "./fmtDate";

function ProficiencyDots({ level }: { level: string }) {
  const map: Record<string, number> = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 };
  const filled = map[level] ?? 2;
  return (
    <span style={{ display: "inline-flex", gap: 3 }}>
      {[1, 2, 3, 4].map((n) => (
        <span key={n} style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: n <= filled ? "#fff" : "rgba(255,255,255,0.2)", display: "inline-block" }} />
      ))}
    </span>
  );
}

export default function ModernTemplate({ user, summary, workExperiences, education, skills, projects, profilePictureUrl, includePhoto, sectionOrder }: ResumeData) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Your Name";
  const grouped = groupWorkByCompany(workExperiences);

  const groupedSkills = skills.reduce<Record<string, typeof skills>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s);
    return acc;
  }, {});

  const accent = "#3B82F6";
  const sidebar = "#1E293B";

  const mainSections: Record<string, () => JSX.Element | null> = {
    summary: () => summary ? <p key="summary" style={{ fontSize: 11, lineHeight: 1.7, color: "#6B7280", margin: "0 0 20px" }}>{summary}</p> : null,
    work: () => grouped.length > 0 ? (
      <section key="work" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: accent, margin: "0 0 10px", borderBottom: `2px solid ${accent}`, paddingBottom: 4 }}>Work Experience</h2>
        {grouped.map((g, gi) => (
          <div key={gi} style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: accent, margin: "0 0 4px" }}>{g.company}</p>
            {g.roles.map((r, ri) => (
              <div key={ri} style={{ marginBottom: 8, paddingLeft: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <p style={{ fontSize: 11, fontWeight: 600, margin: 0 }}>{r.title}</p>
                  <p style={{ fontSize: 10, color: "#9CA3AF", margin: 0, whiteSpace: "nowrap" }}>{fmtDate(r.start_date)} — {fmtDate(r.end_date)}</p>
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
        <h2 style={{ fontSize: 14, fontWeight: 700, color: accent, margin: "0 0 10px", borderBottom: `2px solid ${accent}`, paddingBottom: 4 }}>Projects</h2>
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
    education: () => education.length > 0 ? (
      <section key="education" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: accent, margin: "0 0 10px", borderBottom: `2px solid ${accent}`, paddingBottom: 4 }}>Education</h2>
        {education.map((e, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{e.institution}</p>
              <p style={{ fontSize: 10, color: "#9CA3AF", margin: 0, whiteSpace: "nowrap" }}>{fmtDate(e.start_date)} — {fmtDate(e.end_date)}</p>
            </div>
            <p style={{ fontSize: 11, margin: "2px 0 0" }}>{e.degree} — {e.discipline}</p>
          </div>
        ))}
      </section>
    ) : null,
  };

  const mainOrder = (sectionOrder ?? ["summary", "work", "projects", "education", "skills"]).filter(k => k in mainSections);

  return (
    <div className="resume-page modern-template" style={{ fontFamily: "Inter, system-ui, sans-serif", width: "210mm", minHeight: "297mm", margin: "0 auto", display: "flex", background: "#fff", color: "#1a1a1a", wordSpacing: "0.05em" }}>
      <div style={{ width: "30%", background: `linear-gradient(180deg, ${sidebar} 0%, #0F172A 100%)`, color: "#fff", padding: "15mm 10mm", flexShrink: 0 }}>
        {includePhoto && profilePictureUrl && (
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <img src={profilePictureUrl} alt="" style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(255,255,255,0.2)" }} />
          </div>
        )}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8, color: accent }}>Contact</h3>
          {user.email && <p style={{ fontSize: 10, margin: "0 0 4px", wordBreak: "break-all", lineHeight: 1.5 }}>{user.email}</p>}
          {user.phone_number && <p style={{ fontSize: 10, margin: 0, lineHeight: 1.5 }}>{user.phone_number}</p>}
        </div>
        {Object.keys(groupedSkills).length > 0 && (
          <div>
            <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8, color: accent }}>Skills</h3>
            {Object.entries(groupedSkills).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 10, fontWeight: 600, marginBottom: 4, opacity: 0.7 }}>{cat}</p>
                {items.map((s, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                    <span style={{ fontSize: 10, lineHeight: 1.5 }}>{s.name}</span>
                    <ProficiencyDots level={s.proficiency} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ width: "70%", padding: "15mm 12mm" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px", color: "#1a1a1a" }}>{fullName}</h1>
        <div style={{ height: 3, width: 50, background: accent, borderRadius: 2, marginBottom: 12 }} />
        {mainOrder.map(key => mainSections[key]?.())}
      </div>
    </div>
  );
}
