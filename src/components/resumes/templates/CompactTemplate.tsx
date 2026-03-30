import type { ResumeData } from "./types";

function fmtDate(d: string | null) {
  if (!d) return "Present";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function CompactTemplate({ user, summary, workExperiences, education, skills, projects, profilePictureUrl, includePhoto }: ResumeData) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Your Name";

  const groupedSkills = skills.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s.name);
    return acc;
  }, {});

  return (
    <div className="resume-page compact-template" style={{ fontFamily: "Arial, sans-serif", width: "8.5in", minHeight: "11in", margin: "0 auto", background: "#fff", color: "#000", padding: "0.4in 0.5in" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{fullName}</h1>
        <p style={{ fontSize: 9, margin: 0, color: "#555" }}>{[user.email, user.phone_number].filter(Boolean).join(" | ")}</p>
      </div>
      <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "0 0 8px" }} />

      {summary && (
        <p style={{ fontSize: 9, lineHeight: 1.5, margin: "0 0 8px", color: "#333" }}>{summary}</p>
      )}

      {workExperiences.length > 0 && (
        <section style={{ marginBottom: 8 }}>
          <h2 style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", margin: "0 0 4px", color: "#333" }}>Experience</h2>
          {workExperiences.map((w, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <p style={{ fontSize: 10, fontWeight: 700, margin: 0 }}>{w.title} — {w.company}</p>
                <p style={{ fontSize: 8, color: "#888", margin: 0 }}>{fmtDate(w.start_date)} — {fmtDate(w.end_date)}</p>
              </div>
              {w.points.length > 0 && (
                <ul style={{ margin: "2px 0 0", paddingLeft: 14, fontSize: 9, lineHeight: 1.4 }}>
                  {w.points.map((p, j) => <li key={j}>{p}</li>)}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {education.length > 0 && (
        <section style={{ marginBottom: 8 }}>
          <h2 style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", margin: "0 0 4px", color: "#333" }}>Education</h2>
          {education.map((e, i) => (
            <p key={i} style={{ fontSize: 9, margin: "0 0 3px" }}>
              <strong>{e.institution}</strong> — {e.degree}, {e.discipline} ({fmtDate(e.start_date)} — {fmtDate(e.end_date)})
            </p>
          ))}
        </section>
      )}

      {Object.keys(groupedSkills).length > 0 && (
        <section style={{ marginBottom: 8 }}>
          <h2 style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", margin: "0 0 4px", color: "#333" }}>Skills</h2>
          {Object.entries(groupedSkills).map(([cat, names]) => (
            <p key={cat} style={{ fontSize: 9, margin: "0 0 2px" }}><strong>{cat}:</strong> {names.join(", ")}</p>
          ))}
        </section>
      )}

      {projects.length > 0 && (
        <section style={{ marginBottom: 8 }}>
          <h2 style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", margin: "0 0 4px", color: "#333" }}>Projects</h2>
          {projects.map((p, i) => (
            <p key={i} style={{ fontSize: 9, margin: "0 0 3px" }}><strong>{p.title}</strong> — {p.description}</p>
          ))}
        </section>
      )}
    </div>
  );
}
