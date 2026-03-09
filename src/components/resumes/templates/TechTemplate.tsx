import type { ResumeData } from "./types";

function fmtDate(d: string | null) {
  if (!d) return "Present";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function TechTemplate({ user, summary, workExperiences, education, skills, projects, profilePictureUrl, includePhoto }: ResumeData) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Your Name";
  const green = "#00D26A";
  const dark = "#0D1117";

  const groupedSkills = skills.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s.name);
    return acc;
  }, {});

  return (
    <div className="resume-page tech-template" style={{ fontFamily: "'Fira Code', 'Courier New', monospace", width: "8.5in", minHeight: "11in", margin: "0 auto", background: "#fff", color: "#1a1a1a" }}>
      {/* Dark header */}
      <div style={{ background: dark, color: green, padding: "0.5in 0.7in", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: 10, margin: "0 0 4px", opacity: 0.6 }}>$ whoami</p>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: "#fff" }}>{fullName}</h1>
          <p style={{ fontSize: 10, margin: "6px 0 0" }}>
            <span style={{ color: green }}>→</span> {[user.email, user.phone_number].filter(Boolean).join(" | ")}
          </p>
        </div>
        {includePhoto && profilePictureUrl && (
          <img src={profilePictureUrl} alt="" style={{ width: 65, height: 65, borderRadius: 8, objectFit: "cover", border: `2px solid ${green}` }} />
        )}
      </div>

      <div style={{ padding: "0.5in 0.7in", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        {summary && (
          <section style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: dark, margin: "0 0 6px", fontFamily: "'Fira Code', monospace" }}><span style={{ color: green }}>#</span> summary</h2>
            <p style={{ fontSize: 11, lineHeight: 1.6, margin: 0 }}>{summary}</p>
          </section>
        )}

        {workExperiences.length > 0 && (
          <section style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: dark, margin: "0 0 8px", fontFamily: "'Fira Code', monospace" }}><span style={{ color: green }}>#</span> experience</h2>
            {workExperiences.map((w, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{w.title}</p>
                  <p style={{ fontSize: 10, color: "#888", margin: 0 }}>{fmtDate(w.start_date)} — {fmtDate(w.end_date)}</p>
                </div>
                <p style={{ fontSize: 11, color: green, margin: "2px 0 0", fontFamily: "'Fira Code', monospace", fontWeight: 600 }}>{w.company}</p>
                {w.points.length > 0 && (
                  <ul style={{ margin: "4px 0 0", paddingLeft: 16, fontSize: 11, lineHeight: 1.5 }}>
                    {w.points.map((p, j) => <li key={j}>{p}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {Object.keys(groupedSkills).length > 0 && (
          <section style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: dark, margin: "0 0 8px", fontFamily: "'Fira Code', monospace" }}><span style={{ color: green }}>#</span> skills</h2>
            {Object.entries(groupedSkills).map(([cat, names]) => (
              <div key={cat} style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#555" }}>{cat}: </span>
                {names.map((n, i) => (
                  <span key={i} style={{ fontSize: 10, background: dark, color: green, borderRadius: 4, padding: "2px 8px", marginRight: 4, display: "inline-block", marginBottom: 4, fontFamily: "'Fira Code', monospace" }}>{n}</span>
                ))}
              </div>
            ))}
          </section>
        )}

        {projects.length > 0 && (
          <section style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: dark, margin: "0 0 8px", fontFamily: "'Fira Code', monospace" }}><span style={{ color: green }}>#</span> projects</h2>
            {projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{p.title}</p>
                <p style={{ fontSize: 11, margin: "2px 0 0", lineHeight: 1.5 }}>{p.description}</p>
                {p.urls?.length > 0 && <p style={{ fontSize: 10, color: green, margin: "2px 0 0", fontFamily: "'Fira Code', monospace" }}>{p.urls.join(" · ")}</p>}
              </div>
            ))}
          </section>
        )}

        {education.length > 0 && (
          <section style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: dark, margin: "0 0 8px", fontFamily: "'Fira Code', monospace" }}><span style={{ color: green }}>#</span> education</h2>
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
      </div>
    </div>
  );
}
