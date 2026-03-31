import type { ResumeData } from "./types";
import { groupWorkByCompany } from "./groupWorkByCompany";
import { fmtDate } from "./fmtDate";

export default function CompactTemplate({ user, summary, workExperiences, education, skills, projects, profilePictureUrl, includePhoto }: ResumeData) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Your Name";
  const grouped = groupWorkByCompany(workExperiences);

  const groupedSkills = skills.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s.name);
    return acc;
  }, {});

  return (
    <div className="resume-page compact-template" style={{ fontFamily: "Arial, sans-serif", width: "8.5in", minHeight: "11in", margin: "0 auto", background: "#fff", color: "#000", padding: "0.4in 0.5in" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        {includePhoto && profilePictureUrl && (
          <img src={profilePictureUrl} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{fullName}</h1>
          <p style={{ fontSize: 9, margin: 0, color: "#555" }}>{[user.email, user.phone_number].filter(Boolean).join(" | ")}</p>
        </div>
      </div>
      <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "0 0 8px" }} />

      {summary && (
        <p style={{ fontSize: 9, lineHeight: 1.5, margin: "0 0 8px", color: "#333" }}>{summary}</p>
      )}

      {grouped.length > 0 && (
        <section style={{ marginBottom: 8 }}>
          <h2 style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", margin: "0 0 4px", color: "#333" }}>Experience</h2>
          {grouped.map((g, gi) => (
            <div key={gi} style={{ marginBottom: 6 }}>
              <p style={{ fontSize: 10, fontWeight: 700, margin: "0 0 2px" }}>{g.company}</p>
              {g.roles.map((r, ri) => (
                <div key={ri} style={{ marginBottom: 4, paddingLeft: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <p style={{ fontSize: 9, fontWeight: 600, margin: 0 }}>{r.title}</p>
                    <p style={{ fontSize: 8, color: "#888", margin: 0 }}>{fmtDate(r.start_date)} — {fmtDate(r.end_date)}</p>
                  </div>
                  {r.points.length > 0 && (
                    <ul style={{ margin: "2px 0 0", paddingLeft: 14, fontSize: 9, lineHeight: 1.4, listStyleType: "disc" }}>
                      {r.points.map((p, j) => <li key={j}>{p}</li>)}
                    </ul>
                  )}
                </div>
              ))}
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
