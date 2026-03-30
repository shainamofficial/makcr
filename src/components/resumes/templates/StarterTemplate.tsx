import type { ResumeData } from "./types";
import { groupWorkByCompany } from "./groupWorkByCompany";

function fmtDate(d: string | null) {
  if (!d) return "Present";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function StarterTemplate({ user, summary, workExperiences, education, skills, projects, profilePictureUrl, includePhoto }: ResumeData) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Your Name";
  const accent = "#059669";
  const grouped = groupWorkByCompany(workExperiences);

  const groupedSkills = skills.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s.name);
    return acc;
  }, {});

  return (
    <div className="resume-page starter-template" style={{ fontFamily: "Arial, sans-serif", width: "8.5in", minHeight: "11in", margin: "0 auto", background: "#fff", color: "#1a1a1a", padding: "0.6in 0.8in" }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        {includePhoto && profilePictureUrl && (
          <img src={profilePictureUrl} alt="" style={{ width: 55, height: 55, borderRadius: "50%", objectFit: "cover", margin: "0 auto 8px" }} />
        )}
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: accent }}>{fullName}</h1>
        <p style={{ fontSize: 11, color: "#666", margin: "4px 0 0" }}>{[user.email, user.phone_number].filter(Boolean).join(" | ")}</p>
      </div>

      {summary && (
        <section style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: accent, margin: "0 0 6px", borderBottom: `2px solid ${accent}`, paddingBottom: 4 }}>Objective</h2>
          <p style={{ fontSize: 11, lineHeight: 1.6, margin: 0 }}>{summary}</p>
        </section>
      )}

      {education.length > 0 && (
        <section style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: accent, margin: "0 0 6px", borderBottom: `2px solid ${accent}`, paddingBottom: 4 }}>Education</h2>
          {education.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{e.institution}</p>
                <p style={{ fontSize: 10, color: "#888", margin: 0 }}>{fmtDate(e.start_date)} — {fmtDate(e.end_date)}</p>
              </div>
              <p style={{ fontSize: 11, margin: "2px 0 0" }}>{e.degree} — {e.discipline}</p>
            </div>
          ))}
        </section>
      )}

      {projects.length > 0 && (
        <section style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: accent, margin: "0 0 6px", borderBottom: `2px solid ${accent}`, paddingBottom: 4 }}>Projects</h2>
          {projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{p.title}</p>
              <p style={{ fontSize: 11, margin: "2px 0 0", lineHeight: 1.5 }}>{p.description}</p>
              {p.urls?.length > 0 && <p style={{ fontSize: 10, color: accent, margin: "2px 0 0" }}>{p.urls.join(" · ")}</p>}
            </div>
          ))}
        </section>
      )}

      {Object.keys(groupedSkills).length > 0 && (
        <section style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: accent, margin: "0 0 6px", borderBottom: `2px solid ${accent}`, paddingBottom: 4 }}>Skills</h2>
          {Object.entries(groupedSkills).map(([cat, names]) => (
            <p key={cat} style={{ fontSize: 11, margin: "0 0 4px" }}><strong>{cat}:</strong> {names.join(", ")}</p>
          ))}
        </section>
      )}

      {grouped.length > 0 && (
        <section style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: accent, margin: "0 0 6px", borderBottom: `2px solid ${accent}`, paddingBottom: 4 }}>Experience</h2>
          {grouped.map((g, gi) => (
            <div key={gi} style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: accent, margin: "0 0 4px" }}>{g.company}</p>
              {g.roles.map((r, ri) => (
                <div key={ri} style={{ marginBottom: 8, paddingLeft: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <p style={{ fontSize: 11, fontWeight: 600, margin: 0 }}>{r.title}</p>
                    <p style={{ fontSize: 10, color: "#888", margin: 0 }}>{fmtDate(r.start_date)} — {fmtDate(r.end_date)}</p>
                  </div>
                  {r.points.length > 0 && (
                    <ul style={{ margin: "4px 0 0", paddingLeft: 16, fontSize: 11, lineHeight: 1.5 }}>
                      {r.points.map((p, j) => <li key={j}>{p}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
