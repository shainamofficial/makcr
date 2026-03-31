import type { ResumeData } from "./types";
import { groupWorkByCompany } from "./groupWorkByCompany";
import { fmtDate } from "./fmtDate";

export default function NordicTemplate({ user, summary, workExperiences, education, skills, projects, profilePictureUrl, includePhoto }: ResumeData) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Your Name";
  const blue = "#93C5FD";
  const darkBlue = "#1E40AF";
  const grouped = groupWorkByCompany(workExperiences);

  const groupedSkills = skills.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s.name);
    return acc;
  }, {});

  return (
    <div className="resume-page nordic-template" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", width: "8.5in", minHeight: "11in", margin: "0 auto", background: "#FAFBFF", color: "#1E293B", padding: "1in 1.1in" }}>
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {includePhoto && profilePictureUrl && (
            <img src={profilePictureUrl} alt="" style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover" }} />
          )}
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 300, margin: 0, letterSpacing: 1 }}>{fullName}</h1>
            <p style={{ fontSize: 11, color: "#94A3B8", margin: "6px 0 0" }}>
              {[user.email, user.phone_number].filter(Boolean).join("  ·  ")}
            </p>
          </div>
        </div>
        <div style={{ width: 40, height: 3, background: blue, borderRadius: 2, marginTop: 16 }} />
      </div>

      {summary && (
        <section style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, lineHeight: 1.8, margin: 0, color: "#64748B" }}>{summary}</p>
        </section>
      )}

      {grouped.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 3, color: darkBlue, margin: "0 0 14px" }}>Experience</h2>
          {grouped.map((g, gi) => (
            <div key={gi} style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#64748B", margin: "0 0 4px" }}>{g.company}</p>
              {g.roles.map((r, ri) => (
                <div key={ri} style={{ marginBottom: 10, paddingLeft: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <p style={{ fontSize: 11, fontWeight: 600, margin: 0 }}>{r.title}</p>
                    <p style={{ fontSize: 10, color: "#94A3B8", margin: 0 }}>{fmtDate(r.start_date)} — {fmtDate(r.end_date)}</p>
                  </div>
                  {r.points.length > 0 && (
                    <ul style={{ margin: "6px 0 0", paddingLeft: 16, fontSize: 11, lineHeight: 1.7, color: "#475569" }}>
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
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 3, color: darkBlue, margin: "0 0 14px" }}>Education</h2>
          {education.map((e, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>{e.institution}</p>
              <p style={{ fontSize: 11, color: "#64748B", margin: "3px 0 0" }}>{e.degree} — {e.discipline} | {fmtDate(e.start_date)} — {fmtDate(e.end_date)}</p>
            </div>
          ))}
        </section>
      )}

      {Object.keys(groupedSkills).length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 3, color: darkBlue, margin: "0 0 14px" }}>Skills</h2>
          {Object.entries(groupedSkills).map(([cat, names]) => (
            <p key={cat} style={{ fontSize: 11, margin: "0 0 6px", color: "#475569" }}><span style={{ fontWeight: 600 }}>{cat}:</span> {names.join(", ")}</p>
          ))}
        </section>
      )}

      {projects.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 3, color: darkBlue, margin: "0 0 14px" }}>Projects</h2>
          {projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>{p.title}</p>
              <p style={{ fontSize: 11, color: "#64748B", margin: "3px 0 0", lineHeight: 1.7 }}>{p.description}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
