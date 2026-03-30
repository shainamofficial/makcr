import type { ResumeData } from "./types";
import { groupWorkByCompany } from "./groupWorkByCompany";

function fmtDate(d: string | null) {
  if (!d) return "Present";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function ElegantTemplate({ user, summary, workExperiences, education, skills, projects, profilePictureUrl, includePhoto }: ResumeData) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Your Name";
  const tan = "#A0855B";
  const grouped = groupWorkByCompany(workExperiences);

  const groupedSkills = skills.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s.name);
    return acc;
  }, {});

  return (
    <div className="resume-page elegant-template" style={{ fontFamily: "Garamond, Georgia, serif", width: "8.5in", minHeight: "11in", margin: "0 auto", background: "#fff", color: "#2a2a2a", padding: "1in", border: `1px solid #e0d5c5` }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        {includePhoto && profilePictureUrl && (
          <img src={profilePictureUrl} alt="" style={{ width: 70, height: 70, borderRadius: "50%", objectFit: "cover", marginBottom: 10, border: `2px solid ${tan}` }} />
        )}
        <h1 style={{ fontSize: 28, fontWeight: 400, margin: 0, letterSpacing: 3, textTransform: "uppercase" }}>{fullName}</h1>
        <p style={{ fontSize: 11, color: tan, margin: "6px 0 0", letterSpacing: 1 }}>
          {[user.email, user.phone_number].filter(Boolean).join("  ·  ")}
        </p>
        <div style={{ width: 60, height: 1, background: tan, margin: "14px auto 0" }} />
      </div>

      {summary && (
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 12, fontWeight: 400, textTransform: "uppercase", letterSpacing: 3, color: tan, margin: "0 0 8px", textAlign: "center" }}>Summary</h2>
          <p style={{ fontSize: 11, lineHeight: 1.8, margin: 0, textAlign: "center" }}>{summary}</p>
        </section>
      )}

      {grouped.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 12, fontWeight: 400, textTransform: "uppercase", letterSpacing: 3, color: tan, margin: "0 0 10px", textAlign: "center" }}>Experience</h2>
          {grouped.map((g, gi) => (
            <div key={gi} style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 400, fontStyle: "italic", margin: "0 0 4px", textAlign: "center" }}>{g.company}</p>
              {g.roles.map((r, ri) => (
                <div key={ri} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, margin: 0 }}>{r.title}</p>
                    <p style={{ fontSize: 10, color: "#888", margin: 0 }}>{fmtDate(r.start_date)} — {fmtDate(r.end_date)}</p>
                  </div>
                  {r.points.length > 0 && (
                    <ul style={{ margin: "4px 0 0", paddingLeft: 18, fontSize: 11, lineHeight: 1.6 }}>
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
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 12, fontWeight: 400, textTransform: "uppercase", letterSpacing: 3, color: tan, margin: "0 0 10px", textAlign: "center" }}>Education</h2>
          {education.map((e, i) => (
            <div key={i} style={{ marginBottom: 8, textAlign: "center" }}>
              <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{e.institution}</p>
              <p style={{ fontSize: 11, margin: "2px 0 0" }}>{e.degree} — {e.discipline} | {fmtDate(e.start_date)} — {fmtDate(e.end_date)}</p>
            </div>
          ))}
        </section>
      )}

      {Object.keys(groupedSkills).length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 12, fontWeight: 400, textTransform: "uppercase", letterSpacing: 3, color: tan, margin: "0 0 8px", textAlign: "center" }}>Skills</h2>
          {Object.entries(groupedSkills).map(([cat, names]) => (
            <p key={cat} style={{ fontSize: 11, margin: "0 0 4px", textAlign: "center" }}><strong>{cat}:</strong> {names.join(", ")}</p>
          ))}
        </section>
      )}

      {projects.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 12, fontWeight: 400, textTransform: "uppercase", letterSpacing: 3, color: tan, margin: "0 0 10px", textAlign: "center" }}>Projects</h2>
          {projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 8, textAlign: "center" }}>
              <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{p.title}</p>
              <p style={{ fontSize: 11, margin: "2px 0 0", lineHeight: 1.6 }}>{p.description}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
