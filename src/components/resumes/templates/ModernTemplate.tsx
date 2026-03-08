import type { ResumeData } from "./types";

function fmtDate(d: string | null) {
  if (!d) return "Present";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function ProficiencyDots({ level }: { level: string }) {
  const map: Record<string, number> = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 };
  const filled = map[level] ?? 2;
  return (
    <span style={{ display: "inline-flex", gap: 3 }}>
      {[1, 2, 3, 4].map((n) => (
        <span
          key={n}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: n <= filled ? "#fff" : "rgba(255,255,255,0.25)",
            display: "inline-block",
          }}
        />
      ))}
    </span>
  );
}

export default function ModernTemplate({ user, summary, workExperiences, education, skills, projects, profilePictureUrl, includePhoto }: ResumeData) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Your Name";

  const groupedSkills = skills.reduce<Record<string, typeof skills>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s);
    return acc;
  }, {});

  const accent = "#2563EB";
  const sidebar = "#1E3A5F";

  return (
    <div className="resume-page modern-template" style={{ fontFamily: "Inter, system-ui, sans-serif", width: "8.5in", minHeight: "11in", margin: "0 auto", display: "flex", background: "#fff", color: "#1a1a1a" }}>
      {/* Sidebar */}
      <div style={{ width: "30%", backgroundColor: sidebar, color: "#fff", padding: "0.6in 0.4in", flexShrink: 0 }}>
        {includePhoto && profilePictureUrl && (
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <img src={profilePictureUrl} alt="" style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(255,255,255,0.3)" }} />
          </div>
        )}

        {/* Contact */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8, opacity: 0.7 }}>Contact</h3>
          {user.email && <p style={{ fontSize: 10, margin: "0 0 4px", wordBreak: "break-all" }}>{user.email}</p>}
          {user.phone_number && <p style={{ fontSize: 10, margin: 0 }}>{user.phone_number}</p>}
        </div>

        {/* Skills */}
        {Object.keys(groupedSkills).length > 0 && (
          <div>
            <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8, opacity: 0.7 }}>Skills</h3>
            {Object.entries(groupedSkills).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 10, fontWeight: 600, marginBottom: 4 }}>{cat}</p>
                {items.map((s, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                    <span style={{ fontSize: 10 }}>{s.name}</span>
                    <ProficiencyDots level={s.proficiency} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main */}
      <div style={{ width: "70%", padding: "0.6in 0.5in" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px", color: "#1a1a1a" }}>{fullName}</h1>
        {summary && <p style={{ fontSize: 11, lineHeight: 1.6, color: "#555", margin: "8px 0 20px" }}>{summary}</p>}

        {/* Work */}
        {workExperiences.length > 0 && (
          <section style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: accent, margin: "0 0 10px", borderBottom: `2px solid ${accent}`, paddingBottom: 4 }}>Work Experience</h2>
            {workExperiences.map((w, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{w.title}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <p style={{ fontSize: 11, color: accent, margin: "2px 0 0", fontWeight: 600 }}>{w.company}</p>
                  <p style={{ fontSize: 10, color: "#888", margin: 0, whiteSpace: "nowrap" }}>{fmtDate(w.start_date)} — {fmtDate(w.end_date)}</p>
                </div>
                {w.points.length > 0 && (
                  <ul style={{ margin: "4px 0 0", paddingLeft: 16, fontSize: 11, lineHeight: 1.5 }}>
                    {w.points.map((p, j) => <li key={j}>{p}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: accent, margin: "0 0 10px", borderBottom: `2px solid ${accent}`, paddingBottom: 4 }}>Projects</h2>
            {projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{p.title}</p>
                <p style={{ fontSize: 11, margin: "2px 0 0", lineHeight: 1.5 }}>{p.description}</p>
                {p.urls?.length > 0 && (
                  <p style={{ fontSize: 10, margin: "2px 0 0" }}>
                    {p.urls.map((u, j) => (
                      <a key={j} href={u} style={{ color: accent, marginRight: 8 }}>{u}</a>
                    ))}
                  </p>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: accent, margin: "0 0 10px", borderBottom: `2px solid ${accent}`, paddingBottom: 4 }}>Education</h2>
            {education.map((e, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{e.institution}</p>
                  <p style={{ fontSize: 10, color: "#888", margin: 0, whiteSpace: "nowrap" }}>{fmtDate(e.start_date)} — {fmtDate(e.end_date)}</p>
                </div>
                <p style={{ fontSize: 11, margin: "2px 0 0" }}>{e.degree} — {e.discipline}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
