import type { ResumeData } from "./types";

function fmtDate(d: string | null) {
  if (!d) return "Present";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function AcademicTemplate({ user, summary, workExperiences, education, skills, projects, profilePictureUrl, includePhoto }: ResumeData) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Your Name";

  const groupedSkills = skills.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s.name);
    return acc;
  }, {});

  return (
    <div className="resume-page academic-template" style={{ fontFamily: "'Times New Roman', serif", width: "8.5in", minHeight: "11in", margin: "0 auto", background: "#fff", color: "#000", padding: "0.75in 1in" }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{fullName}</h1>
        <p style={{ fontSize: 11, margin: "4px 0 0" }}>{[user.email, user.phone_number].filter(Boolean).join(" | ")}</p>
      </div>
      <hr style={{ border: "none", borderTop: "2px solid #000", margin: "0 0 16px" }} />

      {/* Education first for academic */}
      {education.length > 0 && (
        <section style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", margin: "0 0 6px" }}>Education</h2>
          <hr style={{ border: "none", borderTop: "1px solid #000", margin: "0 0 8px" }} />
          {education.map((e, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{e.institution}</p>
                <p style={{ fontSize: 10, color: "#555", margin: 0 }}>{fmtDate(e.start_date)} — {fmtDate(e.end_date)}</p>
              </div>
              <p style={{ fontSize: 11, margin: "2px 0 0", fontStyle: "italic" }}>{e.degree} in {e.discipline}</p>
            </div>
          ))}
        </section>
      )}

      {summary && (
        <section style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", margin: "0 0 6px" }}>Research Interests</h2>
          <hr style={{ border: "none", borderTop: "1px solid #000", margin: "0 0 8px" }} />
          <p style={{ fontSize: 11, lineHeight: 1.6, margin: 0 }}>{summary}</p>
        </section>
      )}

      {projects.length > 0 && (
        <section style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", margin: "0 0 6px" }}>Publications & Projects</h2>
          <hr style={{ border: "none", borderTop: "1px solid #000", margin: "0 0 8px" }} />
          {projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 11, margin: 0 }}><strong>{p.title}</strong> — {p.description}</p>
              {p.urls?.length > 0 && <p style={{ fontSize: 10, color: "#555", margin: "2px 0 0" }}>{p.urls.join(", ")}</p>}
            </div>
          ))}
        </section>
      )}

      {workExperiences.length > 0 && (
        <section style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", margin: "0 0 6px" }}>Professional Experience</h2>
          <hr style={{ border: "none", borderTop: "1px solid #000", margin: "0 0 8px" }} />
          {workExperiences.map((w, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{w.title}, {w.company}</p>
                <p style={{ fontSize: 10, color: "#555", margin: 0 }}>{fmtDate(w.start_date)} — {fmtDate(w.end_date)}</p>
              </div>
              {w.points.length > 0 && (
                <ul style={{ margin: "4px 0 0", paddingLeft: 18, fontSize: 11, lineHeight: 1.5 }}>
                  {w.points.map((p, j) => <li key={j}>{p}</li>)}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {Object.keys(groupedSkills).length > 0 && (
        <section style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", margin: "0 0 6px" }}>Technical Skills</h2>
          <hr style={{ border: "none", borderTop: "1px solid #000", margin: "0 0 8px" }} />
          {Object.entries(groupedSkills).map(([cat, names]) => (
            <p key={cat} style={{ fontSize: 11, margin: "0 0 4px" }}><strong>{cat}:</strong> {names.join(", ")}</p>
          ))}
        </section>
      )}
    </div>
  );
}
