import type { ResumeData } from "./types";

function fmtDate(d: string | null) {
  if (!d) return "Present";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function BoldTemplate({ user, summary, workExperiences, education, skills, projects, profilePictureUrl, includePhoto }: ResumeData) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Your Name";

  const groupedSkills = skills.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s.name);
    return acc;
  }, {});

  return (
    <div className="resume-page bold-template" style={{ fontFamily: "Arial, sans-serif", width: "8.5in", minHeight: "11in", margin: "0 auto", background: "#fff", color: "#000", padding: "0.6in 0.8in" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
        {includePhoto && profilePictureUrl && (
          <img src={profilePictureUrl} alt="" style={{ width: 60, height: 60, borderRadius: 4, objectFit: "cover" }} />
        )}
        <h1 style={{ fontSize: 36, fontWeight: 900, margin: 0, textTransform: "uppercase", letterSpacing: 2 }}>{fullName}</h1>
      </div>
      <div style={{ background: "#000", color: "#fff", padding: "6px 12px", fontSize: 11, marginBottom: 20 }}>
        {[user.email, user.phone_number].filter(Boolean).join(" | ")}
      </div>

      {summary && (
        <section style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 16, fontWeight: 900, textTransform: "uppercase", margin: "0 0 6px", borderBottom: "3px solid #000", paddingBottom: 4 }}>Summary</h2>
          <p style={{ fontSize: 11, lineHeight: 1.6, margin: 0 }}>{summary}</p>
        </section>
      )}

      {workExperiences.length > 0 && (
        <section style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 16, fontWeight: 900, textTransform: "uppercase", margin: "0 0 6px", borderBottom: "3px solid #000", paddingBottom: 4 }}>Experience</h2>
          {workExperiences.map((w, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <p style={{ fontSize: 13, fontWeight: 900, margin: 0 }}>{w.title}</p>
                <p style={{ fontSize: 10, color: "#666", margin: 0 }}>{fmtDate(w.start_date)} — {fmtDate(w.end_date)}</p>
              </div>
              <p style={{ fontSize: 11, margin: "2px 0 0", fontWeight: 600 }}>{w.company}</p>
              {w.points.length > 0 && (
                <ul style={{ margin: "4px 0 0", paddingLeft: 16, fontSize: 11, lineHeight: 1.5 }}>
                  {w.points.map((p, j) => <li key={j}>{p}</li>)}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {education.length > 0 && (
        <section style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 16, fontWeight: 900, textTransform: "uppercase", margin: "0 0 6px", borderBottom: "3px solid #000", paddingBottom: 4 }}>Education</h2>
          {education.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 900, margin: 0 }}>{e.institution}</p>
              <p style={{ fontSize: 11, margin: "2px 0 0" }}>{e.degree} — {e.discipline} | {fmtDate(e.start_date)} — {fmtDate(e.end_date)}</p>
            </div>
          ))}
        </section>
      )}

      {Object.keys(groupedSkills).length > 0 && (
        <section style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 16, fontWeight: 900, textTransform: "uppercase", margin: "0 0 6px", borderBottom: "3px solid #000", paddingBottom: 4 }}>Skills</h2>
          {Object.entries(groupedSkills).map(([cat, names]) => (
            <p key={cat} style={{ fontSize: 11, margin: "0 0 4px" }}><strong>{cat}:</strong> {names.join(", ")}</p>
          ))}
        </section>
      )}

      {projects.length > 0 && (
        <section style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 16, fontWeight: 900, textTransform: "uppercase", margin: "0 0 6px", borderBottom: "3px solid #000", paddingBottom: 4 }}>Projects</h2>
          {projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 900, margin: 0 }}>{p.title}</p>
              <p style={{ fontSize: 11, margin: "2px 0 0", lineHeight: 1.5 }}>{p.description}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
