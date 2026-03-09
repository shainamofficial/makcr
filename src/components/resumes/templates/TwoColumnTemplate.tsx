import type { ResumeData } from "./types";

function fmtDate(d: string | null) {
  if (!d) return "Present";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function TwoColumnTemplate({ user, summary, workExperiences, education, skills, projects, profilePictureUrl, includePhoto }: ResumeData) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Your Name";
  const accent = "#4A5568";

  const groupedSkills = skills.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s.name);
    return acc;
  }, {});

  return (
    <div className="resume-page twocolumn-template" style={{ fontFamily: "'Segoe UI', sans-serif", width: "8.5in", minHeight: "11in", margin: "0 auto", background: "#fff", color: "#1a1a1a" }}>
      {/* Header */}
      <div style={{ padding: "0.5in 0.6in 0.3in", borderBottom: `2px solid ${accent}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {includePhoto && profilePictureUrl && (
            <img src={profilePictureUrl} alt="" style={{ width: 55, height: 55, borderRadius: "50%", objectFit: "cover" }} />
          )}
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{fullName}</h1>
            <p style={{ fontSize: 10, color: "#666", margin: "4px 0 0" }}>{[user.email, user.phone_number].filter(Boolean).join(" | ")}</p>
          </div>
        </div>
        {summary && <p style={{ fontSize: 10, lineHeight: 1.6, margin: "10px 0 0", color: "#555" }}>{summary}</p>}
      </div>

      {/* Two columns */}
      <div style={{ display: "flex", padding: "0.3in 0.6in 0.5in" }}>
        {/* Left: Experience + Projects */}
        <div style={{ width: "58%", paddingRight: "0.3in" }}>
          {workExperiences.length > 0 && (
            <section style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: accent, margin: "0 0 8px", borderBottom: `1px solid #ddd`, paddingBottom: 4 }}>Experience</h2>
              {workExperiences.map((w, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, margin: 0 }}>{w.title}</p>
                  <p style={{ fontSize: 10, color: accent, margin: "1px 0 0" }}>{w.company} | {fmtDate(w.start_date)} — {fmtDate(w.end_date)}</p>
                  {w.points.length > 0 && (
                    <ul style={{ margin: "3px 0 0", paddingLeft: 14, fontSize: 10, lineHeight: 1.5 }}>
                      {w.points.map((p, j) => <li key={j}>{p}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}
          {projects.length > 0 && (
            <section>
              <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: accent, margin: "0 0 8px", borderBottom: `1px solid #ddd`, paddingBottom: 4 }}>Projects</h2>
              {projects.map((p, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, margin: 0 }}>{p.title}</p>
                  <p style={{ fontSize: 10, margin: "2px 0 0", lineHeight: 1.5 }}>{p.description}</p>
                </div>
              ))}
            </section>
          )}
        </div>

        {/* Right: Skills + Education */}
        <div style={{ width: "42%", paddingLeft: "0.3in", borderLeft: `1px solid #ddd` }}>
          {Object.keys(groupedSkills).length > 0 && (
            <section style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: accent, margin: "0 0 8px", borderBottom: `1px solid #ddd`, paddingBottom: 4 }}>Skills</h2>
              {Object.entries(groupedSkills).map(([cat, names]) => (
                <div key={cat} style={{ marginBottom: 8 }}>
                  <p style={{ fontSize: 10, fontWeight: 600, margin: "0 0 2px", color: accent }}>{cat}</p>
                  <p style={{ fontSize: 10, margin: 0, lineHeight: 1.5 }}>{names.join(", ")}</p>
                </div>
              ))}
            </section>
          )}
          {education.length > 0 && (
            <section>
              <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: accent, margin: "0 0 8px", borderBottom: `1px solid #ddd`, paddingBottom: 4 }}>Education</h2>
              {education.map((e, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, margin: 0 }}>{e.institution}</p>
                  <p style={{ fontSize: 10, margin: "1px 0 0" }}>{e.degree} — {e.discipline}</p>
                  <p style={{ fontSize: 9, color: "#888", margin: "1px 0 0" }}>{fmtDate(e.start_date)} — {fmtDate(e.end_date)}</p>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
