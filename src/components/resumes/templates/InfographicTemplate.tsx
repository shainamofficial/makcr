import type { ResumeData } from "./types";
import { groupWorkByCompany } from "./groupWorkByCompany";

function fmtDate(d: string | null) {
  if (!d) return "Present";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function SkillBar({ name, level }: { name: string; level: string }) {
  const map: Record<string, number> = { Beginner: 25, Intermediate: 50, Advanced: 75, Expert: 100 };
  const pct = map[level] ?? 50;
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }}>
        <span>{name}</span>
        <span style={{ color: "#999" }}>{level}</span>
      </div>
      <div style={{ height: 6, background: "#E5E7EB", borderRadius: 3 }}>
        <div style={{ height: 6, width: `${pct}%`, background: "#3B82F6", borderRadius: 3 }} />
      </div>
    </div>
  );
}

export default function InfographicTemplate({ user, summary, workExperiences, education, skills, projects, profilePictureUrl, includePhoto }: ResumeData) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Your Name";
  const accent = "#3B82F6";
  const grouped = groupWorkByCompany(workExperiences);

  const groupedSkills = skills.reduce<Record<string, typeof skills>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s);
    return acc;
  }, {});

  return (
    <div className="resume-page infographic-template" style={{ fontFamily: "'Segoe UI', sans-serif", width: "8.5in", minHeight: "11in", margin: "0 auto", background: "#fff", color: "#1a1a1a", display: "flex" }}>
      <div style={{ width: "35%", background: "#F8FAFC", padding: "0.6in 0.4in", flexShrink: 0 }}>
        {includePhoto && profilePictureUrl && (
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <img src={profilePictureUrl} alt="" style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover", border: `3px solid ${accent}` }} />
          </div>
        )}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: accent, marginBottom: 8 }}>📧 Contact</h3>
          {user.email && <p style={{ fontSize: 10, margin: "0 0 3px", wordBreak: "break-all" }}>{user.email}</p>}
          {user.phone_number && <p style={{ fontSize: 10, margin: 0 }}>{user.phone_number}</p>}
        </div>
        {Object.keys(groupedSkills).length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, color: accent, marginBottom: 8 }}>🎯 Skills</h3>
            {Object.entries(groupedSkills).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 10, fontWeight: 600, margin: "0 0 4px", color: "#555" }}>{cat}</p>
                {items.map((s, i) => <SkillBar key={i} name={s.name} level={s.proficiency} />)}
              </div>
            ))}
          </div>
        )}
        {education.length > 0 && (
          <div>
            <h3 style={{ fontSize: 11, fontWeight: 700, color: accent, marginBottom: 8 }}>🎓 Education</h3>
            {education.map((e, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <p style={{ fontSize: 10, fontWeight: 700, margin: 0 }}>{e.institution}</p>
                <p style={{ fontSize: 9, margin: "1px 0 0" }}>{e.degree} — {e.discipline}</p>
                <p style={{ fontSize: 9, color: "#888", margin: "1px 0 0" }}>{fmtDate(e.start_date)} — {fmtDate(e.end_date)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ width: "65%", padding: "0.6in 0.5in" }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 4px", color: accent }}>{fullName}</h1>
        {summary && <p style={{ fontSize: 11, lineHeight: 1.6, color: "#555", margin: "8px 0 20px" }}>{summary}</p>}

        {grouped.length > 0 && (
          <section style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: accent, margin: "0 0 10px" }}>💼 Experience</h2>
            {grouped.map((g, gi) => (
              <div key={gi} style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: accent, margin: "0 0 4px" }}>{g.company}</p>
                {g.roles.map((r, ri) => (
                  <div key={ri} style={{ marginBottom: 8, paddingLeft: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <p style={{ fontSize: 11, fontWeight: 600, margin: 0 }}>{r.title}</p>
                      <p style={{ fontSize: 9, color: "#888", margin: 0 }}>{fmtDate(r.start_date)} — {fmtDate(r.end_date)}</p>
                    </div>
                    {r.points.length > 0 && (
                      <ul style={{ margin: "4px 0 0", paddingLeft: 16, fontSize: 10, lineHeight: 1.5 }}>
                        {r.points.map((p, j) => <li key={j}>{p}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: accent, margin: "0 0 10px" }}>🚀 Projects</h2>
            {projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{p.title}</p>
                <p style={{ fontSize: 11, margin: "2px 0 0", lineHeight: 1.5 }}>{p.description}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
