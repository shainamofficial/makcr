import type { ResumeData } from "./types";

function fmtDate(d: string | null) {
  if (!d) return "Present";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function TimelineTemplate({ user, summary, workExperiences, education, skills, projects, profilePictureUrl, includePhoto }: ResumeData) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Your Name";
  const accent = "#6366F1";

  const groupedSkills = skills.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s.name);
    return acc;
  }, {});

  const TimelineDot = () => (
    <div style={{ position: "absolute", left: -6, top: 4, width: 12, height: 12, borderRadius: "50%", background: accent, border: "2px solid #fff", boxShadow: "0 0 0 2px " + accent }} />
  );

  return (
    <div className="resume-page timeline-template" style={{ fontFamily: "'Segoe UI', sans-serif", width: "8.5in", minHeight: "11in", margin: "0 auto", background: "#fff", color: "#1a1a1a", padding: "0.6in 0.8in" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        {includePhoto && profilePictureUrl && (
          <img src={profilePictureUrl} alt="" style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover" }} />
        )}
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: accent }}>{fullName}</h1>
          <p style={{ fontSize: 10, color: "#666", margin: "4px 0 0" }}>{[user.email, user.phone_number].filter(Boolean).join(" | ")}</p>
        </div>
      </div>

      {summary && <p style={{ fontSize: 11, lineHeight: 1.6, margin: "0 0 18px", color: "#555" }}>{summary}</p>}

      {workExperiences.length > 0 && (
        <section style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: accent, margin: "0 0 10px" }}>Experience</h2>
          <div style={{ borderLeft: `2px solid ${accent}`, marginLeft: 5, paddingLeft: 20 }}>
            {workExperiences.map((w, i) => (
              <div key={i} style={{ marginBottom: 14, position: "relative" }}>
                <TimelineDot />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{w.title}</p>
                  <p style={{ fontSize: 9, color: "#888", margin: 0 }}>{fmtDate(w.start_date)} — {fmtDate(w.end_date)}</p>
                </div>
                <p style={{ fontSize: 11, color: accent, margin: "2px 0 0" }}>{w.company}</p>
                {w.points.length > 0 && (
                  <ul style={{ margin: "4px 0 0", paddingLeft: 16, fontSize: 10, lineHeight: 1.5 }}>
                    {w.points.map((p, j) => <li key={j}>{p}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {education.length > 0 && (
        <section style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: accent, margin: "0 0 10px" }}>Education</h2>
          <div style={{ borderLeft: `2px solid ${accent}`, marginLeft: 5, paddingLeft: 20 }}>
            {education.map((e, i) => (
              <div key={i} style={{ marginBottom: 10, position: "relative" }}>
                <TimelineDot />
                <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{e.institution}</p>
                <p style={{ fontSize: 11, margin: "2px 0 0" }}>{e.degree} — {e.discipline}</p>
                <p style={{ fontSize: 9, color: "#888", margin: "2px 0 0" }}>{fmtDate(e.start_date)} — {fmtDate(e.end_date)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {Object.keys(groupedSkills).length > 0 && (
        <section style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: accent, margin: "0 0 8px" }}>Skills</h2>
          {Object.entries(groupedSkills).map(([cat, names]) => (
            <p key={cat} style={{ fontSize: 11, margin: "0 0 4px" }}><strong>{cat}:</strong> {names.join(", ")}</p>
          ))}
        </section>
      )}

      {projects.length > 0 && (
        <section style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: accent, margin: "0 0 10px" }}>Projects</h2>
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
