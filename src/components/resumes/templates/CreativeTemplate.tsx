import type { ResumeData } from "./types";

function fmtDate(d: string | null) {
  if (!d) return "Present";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function CreativeTemplate({ user, summary, workExperiences, education, skills, projects, profilePictureUrl, includePhoto }: ResumeData) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Your Name";
  const coral = "#E8634A";
  const bg = "#FFF8F6";

  const groupedSkills = skills.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s.name);
    return acc;
  }, {});

  return (
    <div className="resume-page creative-template" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", width: "8.5in", minHeight: "11in", margin: "0 auto", background: bg, color: "#333", padding: "0.6in 0.7in" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
        {includePhoto && profilePictureUrl && (
          <img src={profilePictureUrl} alt="" style={{ width: 80, height: 80, borderRadius: 16, objectFit: "cover", border: `3px solid ${coral}` }} />
        )}
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: coral }}>{fullName}</h1>
          <p style={{ fontSize: 11, margin: "4px 0 0", color: "#777" }}>
            {[user.email, user.phone_number].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${coral}, #F9A825, ${coral})`, borderRadius: 2, marginBottom: 20 }} />

      {summary && (
        <section style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: coral, margin: "0 0 6px" }}>About Me</h2>
          <p style={{ fontSize: 11, lineHeight: 1.7, margin: 0 }}>{summary}</p>
        </section>
      )}

      {workExperiences.length > 0 && (
        <section style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: coral, margin: "0 0 10px" }}>Experience</h2>
          {workExperiences.map((w, i) => (
            <div key={i} style={{ marginBottom: 14, paddingLeft: 12, borderLeft: `3px solid ${coral}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{w.title}</p>
                <p style={{ fontSize: 10, color: "#999", margin: 0 }}>{fmtDate(w.start_date)} — {fmtDate(w.end_date)}</p>
              </div>
              <p style={{ fontSize: 11, color: coral, margin: "2px 0 0" }}>{w.company}</p>
              {w.points.length > 0 && (
                <ul style={{ margin: "4px 0 0", paddingLeft: 16, fontSize: 11, lineHeight: 1.5 }}>
                  {w.points.map((p, j) => <li key={j}>{p}</li>)}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Skills as badges */}
      {Object.keys(groupedSkills).length > 0 && (
        <section style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: coral, margin: "0 0 10px" }}>Skills</h2>
          {Object.entries(groupedSkills).map(([cat, names]) => (
            <div key={cat} style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: "#777", margin: "0 0 4px" }}>{cat}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {names.map((n, i) => (
                  <span key={i} style={{ fontSize: 10, background: coral, color: "#fff", borderRadius: 12, padding: "3px 10px" }}>{n}</span>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {education.length > 0 && (
        <section style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: coral, margin: "0 0 10px" }}>Education</h2>
          {education.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{e.institution}</p>
              <p style={{ fontSize: 11, margin: "2px 0 0" }}>{e.degree} — {e.discipline}</p>
              <p style={{ fontSize: 10, color: "#999", margin: "2px 0 0" }}>{fmtDate(e.start_date)} — {fmtDate(e.end_date)}</p>
            </div>
          ))}
        </section>
      )}

      {projects.length > 0 && (
        <section style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: coral, margin: "0 0 10px" }}>Projects</h2>
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
