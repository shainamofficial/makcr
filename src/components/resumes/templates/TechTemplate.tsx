import type { ResumeData } from "./types";
import { groupWorkByCompany } from "./groupWorkByCompany";
import { fmtDate } from "./fmtDate";

function UrlPill({ url, color }: { url: string; color: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" data-pdf-url={url}
       style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 8px", borderRadius: 9999, border: `1px solid ${color}`, color, fontSize: 9, lineHeight: "18px", verticalAlign: "middle", textDecoration: "none", fontFamily: "'Fira Code', 'Courier New', monospace" }}>
      {"↗ "}{url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
    </a>
  );
}

const DEFAULT_ORDER = ["summary", "work", "projects", "skills", "education"];

export default function TechTemplate({ user, summary, workExperiences, education, skills, projects, profilePictureUrl, includePhoto, sectionOrder }: ResumeData) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Your Name";
  const green = "#10B981";
  const dark = "#0F172A";
  const grouped = groupWorkByCompany(workExperiences);

  const groupedSkills = skills.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s.name);
    return acc;
  }, {});

  const sections: Record<string, () => JSX.Element | null> = {
    summary: () => summary ? (
      <section key="summary" style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: dark, margin: "0 0 6px", fontFamily: "'Fira Code', monospace" }}><span style={{ color: green }}>#</span> summary</h2>
        <p style={{ fontSize: 11, lineHeight: 1.7, margin: 0, color: "#374151" }}>{summary}</p>
      </section>
    ) : null,
    work: () => grouped.length > 0 ? (
      <section key="work" style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: dark, margin: "0 0 8px", fontFamily: "'Fira Code', monospace" }}><span style={{ color: green }}>#</span> experience</h2>
        {grouped.map((g, gi) => (
          <div key={gi} style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: green, margin: "0 0 4px", fontFamily: "'Fira Code', monospace" }}>{g.company}</p>
            {g.roles.map((r, ri) => (
              <div key={ri} style={{ marginBottom: 8, paddingLeft: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <p style={{ fontSize: 11, fontWeight: 600, margin: 0 }}>{r.title}</p>
                  <p style={{ fontSize: 10, color: "#9CA3AF", margin: 0 }}>{fmtDate(r.start_date)} — {fmtDate(r.end_date)}</p>
                </div>
                {r.points.length > 0 && (
                  <ul style={{ margin: "4px 0 0", paddingLeft: 16, fontSize: 11, lineHeight: 1.6, listStyleType: "disc" }}>
                    {r.points.map((p, j) => <li key={j} style={{ marginBottom: 2 }}>{p}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ))}
      </section>
    ) : null,
    projects: () => projects.length > 0 ? (
      <section key="projects" style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: dark, margin: "0 0 8px", fontFamily: "'Fira Code', monospace" }}><span style={{ color: green }}>#</span> projects</h2>
        {projects.map((p, i) => (
          <div key={i} style={{ marginBottom: 10, padding: "8px 12px", background: "#F8FAFC", borderRadius: 6, border: "1px solid #E2E8F0" }}>
            <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{p.title}</p>
            <p style={{ fontSize: 11, margin: "3px 0 0", lineHeight: 1.6, color: "#374151" }}>{p.description}</p>
            {p.urls?.length > 0 && (
                <div style={{ marginTop: 3 }}>
                  {p.urls.map((u, j) => (
                    <span key={j}>
                      {j > 0 && " · "}
                      <a href={u} target="_blank" rel="noopener noreferrer" data-pdf-url={u}
                         style={{ color: "inherit", fontSize: 10, textDecoration: "underline", textUnderlineOffset: 2 }}>
                        {u.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </a>
                    </span>
                  ))}
                </div>
              )}
          </div>
        ))}
      </section>
    ) : null,
    skills: () => Object.keys(groupedSkills).length > 0 ? (
      <section key="skills" style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: dark, margin: "0 0 8px", fontFamily: "'Fira Code', monospace" }}><span style={{ color: green }}>#</span> skills</h2>
        {Object.entries(groupedSkills).map(([cat, names]) => (
          <div key={cat} style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: "#6B7280" }}>{cat}: </span>
            {names.map((n, i) => (
              <span key={i} style={{ fontSize: 10, background: dark, color: green, borderRadius: 4, padding: "2px 8px", marginRight: 4, display: "inline-block", marginBottom: 4, fontFamily: "'Fira Code', monospace" }}>{n}</span>
            ))}
          </div>
        ))}
      </section>
    ) : null,
    education: () => education.length > 0 ? (
      <section key="education" style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: dark, margin: "0 0 8px", fontFamily: "'Fira Code', monospace" }}><span style={{ color: green }}>#</span> education</h2>
        {education.map((e, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{e.institution}</p>
              <p style={{ fontSize: 10, color: "#9CA3AF", margin: 0 }}>{fmtDate(e.start_date)} — {fmtDate(e.end_date)}</p>
            </div>
            <p style={{ fontSize: 11, margin: "2px 0 0", lineHeight: 1.5 }}>{e.degree} — {e.discipline}</p>
          </div>
        ))}
      </section>
    ) : null,
  };

  const order = sectionOrder ?? DEFAULT_ORDER;

  return (
    <div className="resume-page tech-template" style={{ fontFamily: "Inter, system-ui, sans-serif", width: "210mm", minHeight: "297mm", margin: "0 auto", background: "#fff", color: "#1a1a1a", wordSpacing: "0.05em" }}>
      <div style={{ background: `linear-gradient(135deg, ${dark} 0%, #1E293B 100%)`, color: green, padding: "12mm 18mm", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: 10, margin: "0 0 4px", opacity: 0.5, fontFamily: "'Fira Code', monospace", lineHeight: 1.5 }}>$ whoami</p>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: "#fff" }}>{fullName}</h1>
          <p style={{ fontSize: 10, margin: "6px 0 0", lineHeight: 1.5 }}>
            <span style={{ color: green }}>→</span> {[user.email, user.phone_number].filter(Boolean).join(" | ")}
          </p>
        </div>
        {includePhoto && profilePictureUrl && (
          <img src={profilePictureUrl} alt="" style={{ width: 65, height: 65, borderRadius: 8, objectFit: "cover", border: `2px solid ${green}` }} />
        )}
      </div>
      <div style={{ padding: "12mm 18mm" }}>
        {order.map(key => sections[key]?.())}
      </div>
    </div>
  );
}
