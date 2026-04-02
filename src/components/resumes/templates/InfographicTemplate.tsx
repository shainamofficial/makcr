import type { ResumeData } from "./types";
import { groupWorkByCompany } from "./groupWorkByCompany";
import { fmtDate } from "./fmtDate";

function SkillBar({ name, level }: { name: string; level: string }) {
  const map: Record<string, number> = { Beginner: 25, Intermediate: 50, Advanced: 75, Expert: 100 };
  const pct = map[level] ?? 50;
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2, lineHeight: 1.5 }}>
        <span>{name}</span>
        <span style={{ color: "#9CA3AF" }}>{level}</span>
      </div>
      <div style={{ height: 5, background: "#E5E7EB", borderRadius: 3 }}>
        <div style={{ height: 5, width: `${pct}%`, background: "linear-gradient(90deg, #3B82F6, #60A5FA)", borderRadius: 3 }} />
      </div>
    </div>
  );
}

export default function InfographicTemplate({ user, summary, workExperiences, education, skills, projects, profilePictureUrl, includePhoto, sectionOrder }: ResumeData) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Your Name";
  const accent = "#3B82F6";
  const grouped = groupWorkByCompany(workExperiences);

  const groupedSkills = skills.reduce<Record<string, typeof skills>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s);
    return acc;
  }, {});

  const mainSections: Record<string, () => JSX.Element | null> = {
    summary: () => summary ? <p key="summary" style={{ fontSize: 11, lineHeight: 1.7, color: "#4B5563", margin: "0 0 20px" }}>{summary}</p> : null,
    work: () => grouped.length > 0 ? (
      <section key="work" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: accent, margin: "0 0 10px" }}>Experience</h2>
        {grouped.map((g, gi) => (
          <div key={gi} style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: accent, margin: "0 0 4px" }}>{g.company}</p>
            {g.roles.map((r, ri) => (
              <div key={ri} style={{ marginBottom: 8, paddingLeft: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <p style={{ fontSize: 11, fontWeight: 600, margin: 0 }}>{r.title}</p>
                  <p style={{ fontSize: 9, color: "#9CA3AF", margin: 0 }}>{fmtDate(r.start_date)} — {fmtDate(r.end_date)}</p>
                </div>
                {r.points.length > 0 && (
                  <ul style={{ margin: "4px 0 0", paddingLeft: 16, fontSize: 10, lineHeight: 1.6, listStyleType: "disc" }}>
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
      <section key="projects">
        <h2 style={{ fontSize: 13, fontWeight: 700, color: accent, margin: "0 0 10px" }}>Projects</h2>
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
    <div className="resume-page infographic-template" style={{ fontFamily: "Inter, system-ui, sans-serif", width: "210mm", minHeight: "297mm", margin: "0 auto", background: "#fff", color: "#1a1a1a", display: "flex", wordSpacing: "0.05em" }}>
      <div style={{ width: "35%", background: "#F8FAFC", padding: "15mm 10mm", flexShrink: 0, borderRight: `1px solid #E5E7EB` }}>
        {includePhoto && profilePictureUrl && (
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <img src={profilePictureUrl} alt="" style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover", border: `3px solid ${accent}` }} />
          </div>
        )}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: accent, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Contact</h3>
          {user.email && <p style={{ fontSize: 10, margin: "0 0 3px", wordBreak: "break-all", lineHeight: 1.5 }}>{user.email}</p>}
          {user.phone_number && <p style={{ fontSize: 10, margin: 0, lineHeight: 1.5 }}>{user.phone_number}</p>}
        </div>
        {Object.keys(groupedSkills).length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, color: accent, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Skills</h3>
            {Object.entries(groupedSkills).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 10, fontWeight: 600, margin: "0 0 4px", color: "#6B7280" }}>{cat}</p>
                {items.map((s, i) => <SkillBar key={i} name={s.name} level={s.proficiency} />)}
              </div>
            ))}
          </div>
        )}
        {education.length > 0 && (
          <div>
            <h3 style={{ fontSize: 11, fontWeight: 700, color: accent, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Education</h3>
            {education.map((e, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <p style={{ fontSize: 10, fontWeight: 700, margin: 0, lineHeight: 1.5 }}>{e.institution}</p>
                <p style={{ fontSize: 9, margin: "1px 0 0", lineHeight: 1.5 }}>{e.degree} — {e.discipline}</p>
                <p style={{ fontSize: 9, color: "#9CA3AF", margin: "1px 0 0" }}>{fmtDate(e.start_date)} — {fmtDate(e.end_date)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ width: "65%", padding: "15mm 12mm" }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 4px", color: accent }}>{fullName}</h1>
        <div style={{ height: 3, width: 40, background: accent, borderRadius: 2, marginBottom: 12 }} />
        {mainOrder.map(key => mainSections[key]?.())}
      </div>
    </div>
  );
}
