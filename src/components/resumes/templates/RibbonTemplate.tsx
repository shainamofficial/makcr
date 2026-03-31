import type { ResumeData } from "./types";
import { groupWorkByCompany } from "./groupWorkByCompany";
import { fmtDate } from "./fmtDate";

function RibbonHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#92400E", color: "#fff", padding: "5px 16px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10, marginLeft: -16, marginRight: -16, position: "relative" }}>
      {children}
      <div style={{ position: "absolute", left: 0, bottom: -4, width: 0, height: 0, borderLeft: "8px solid #78350F", borderBottom: "4px solid transparent" }} />
    </div>
  );
}

export default function RibbonTemplate({ user, summary, workExperiences, education, skills, projects, profilePictureUrl, includePhoto }: ResumeData) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Your Name";
  const warm = "#92400E";
  const grouped = groupWorkByCompany(workExperiences);

  const groupedSkills = skills.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s.name);
    return acc;
  }, {});

  return (
    <div className="resume-page ribbon-template" style={{ fontFamily: "Georgia, serif", width: "8.5in", minHeight: "11in", margin: "0 auto", background: "#FFFBF5", color: "#1a1a1a", padding: "0.6in 0.8in" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        {includePhoto && profilePictureUrl && (
          <img src={profilePictureUrl} alt="" style={{ width: 65, height: 65, borderRadius: "50%", objectFit: "cover", border: `2px solid ${warm}` }} />
        )}
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: warm }}>{fullName}</h1>
          <p style={{ fontSize: 11, color: "#78716C", margin: "4px 0 0" }}>{[user.email, user.phone_number].filter(Boolean).join(" | ")}</p>
        </div>
      </div>

      {summary && (
        <section style={{ marginBottom: 18, paddingLeft: 16, paddingRight: 16 }}>
          <RibbonHeader>Summary</RibbonHeader>
          <p style={{ fontSize: 11, lineHeight: 1.6, margin: 0 }}>{summary}</p>
        </section>
      )}

      {grouped.length > 0 && (
        <section style={{ marginBottom: 18, paddingLeft: 16, paddingRight: 16 }}>
          <RibbonHeader>Experience</RibbonHeader>
          {grouped.map((g, gi) => (
            <div key={gi} style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: warm, margin: "0 0 4px" }}>{g.company}</p>
              {g.roles.map((r, ri) => (
                <div key={ri} style={{ marginBottom: 8, paddingLeft: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <p style={{ fontSize: 11, fontWeight: 600, margin: 0 }}>{r.title}</p>
                    <p style={{ fontSize: 10, color: "#A8A29E", margin: 0 }}>{fmtDate(r.start_date)} — {fmtDate(r.end_date)}</p>
                  </div>
                  {r.points.length > 0 && (
                    <ul style={{ margin: "4px 0 0", paddingLeft: 18, fontSize: 11, lineHeight: 1.5, listStyleType: "disc" }}>
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
        <section style={{ marginBottom: 18, paddingLeft: 16, paddingRight: 16 }}>
          <RibbonHeader>Education</RibbonHeader>
          {education.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{e.institution}</p>
                <p style={{ fontSize: 10, color: "#A8A29E", margin: 0 }}>{fmtDate(e.start_date)} — {fmtDate(e.end_date)}</p>
              </div>
              <p style={{ fontSize: 11, margin: "2px 0 0" }}>{e.degree} — {e.discipline}</p>
            </div>
          ))}
        </section>
      )}

      {Object.keys(groupedSkills).length > 0 && (
        <section style={{ marginBottom: 18, paddingLeft: 16, paddingRight: 16 }}>
          <RibbonHeader>Skills</RibbonHeader>
          {Object.entries(groupedSkills).map(([cat, names]) => (
            <p key={cat} style={{ fontSize: 11, margin: "0 0 4px" }}><strong>{cat}:</strong> {names.join(", ")}</p>
          ))}
        </section>
      )}

      {projects.length > 0 && (
        <section style={{ marginBottom: 18, paddingLeft: 16, paddingRight: 16 }}>
          <RibbonHeader>Projects</RibbonHeader>
          {projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{p.title}</p>
              <p style={{ fontSize: 11, margin: "2px 0 0", lineHeight: 1.5 }}>{p.description}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
