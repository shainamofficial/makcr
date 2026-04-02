import type { ResumeData } from "./types";
import { groupWorkByCompany } from "./groupWorkByCompany";
import { fmtDate } from "./fmtDate";

const DEFAULT_ORDER = ["summary", "work", "projects", "education", "skills"];

export default function MinimalTemplate({ user, summary, workExperiences, education, skills, projects, profilePictureUrl, includePhoto, sectionOrder }: ResumeData) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Your Name";
  const muted = "#9CA3AF";
  const accent = "#6B7280";
  const grouped = groupWorkByCompany(workExperiences);

  const groupedSkills = skills.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s.name);
    return acc;
  }, {});

  const sections: Record<string, () => JSX.Element | null> = {
    summary: () => summary ? (
      <section key="summary" style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 8px" }}>Summary</h2>
        <p style={{ fontSize: 11, lineHeight: 1.7, margin: 0, color: "#4B5563" }}>{summary}</p>
      </section>
    ) : null,
    work: () => grouped.length > 0 ? (
      <section key="work" style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px" }}>Work Experience</h2>
        {grouped.map((g, gi) => (
          <div key={gi} style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, margin: "0 0 4px" }}>{g.company}</p>
            {g.roles.map((r, ri) => (
              <div key={ri} style={{ marginBottom: 10, paddingLeft: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <p style={{ fontSize: 11, fontWeight: 600, margin: 0 }}>{r.title}</p>
                  <p style={{ fontSize: 10, color: muted, margin: 0, whiteSpace: "nowrap" }}>{fmtDate(r.start_date)} — {fmtDate(r.end_date)}</p>
                </div>
                {r.points.length > 0 && (
                  <ul style={{ margin: "6px 0 0", paddingLeft: 16, fontSize: 11, lineHeight: 1.7, listStyleType: "disc" }}>
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
      <section key="projects" style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px" }}>Projects</h2>
        {projects.map((p, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{p.title}</p>
            <p style={{ fontSize: 11, margin: "2px 0 0", lineHeight: 1.7, color: "#4B5563" }}>{p.description}</p>
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
    education: () => education.length > 0 ? (
      <section key="education" style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px" }}>Education</h2>
        {education.map((e, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{e.institution}</p>
              <p style={{ fontSize: 10, color: muted, margin: 0, whiteSpace: "nowrap" }}>{fmtDate(e.start_date)} — {fmtDate(e.end_date)}</p>
            </div>
            <p style={{ fontSize: 11, margin: "2px 0 0" }}>{e.degree} — {e.discipline}</p>
          </div>
        ))}
      </section>
    ) : null,
    skills: () => Object.keys(groupedSkills).length > 0 ? (
      <section key="skills" style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 8px" }}>Skills</h2>
        {Object.entries(groupedSkills).map(([cat, names]) => (
          <p key={cat} style={{ fontSize: 11, margin: "0 0 4px", lineHeight: 1.7 }}>
            <strong>{cat}:</strong> {names.join(", ")}
          </p>
        ))}
      </section>
    ) : null,
  };

  const order = sectionOrder ?? DEFAULT_ORDER;

  return (
    <div className="resume-page minimal-template" style={{ fontFamily: "Inter, system-ui, sans-serif", width: "210mm", minHeight: "297mm", padding: "25mm", margin: "0 auto", background: "#fff", color: "#1a1a1a", wordSpacing: "0.05em" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        {includePhoto && profilePictureUrl && (
          <img src={profilePictureUrl} alt="" style={{ width: 50, height: 50, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
        )}
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 300, margin: 0, letterSpacing: 0.5 }}>{fullName}</h1>
          <p style={{ fontSize: 11, color: muted, margin: "6px 0 0", lineHeight: 1.5 }}>
            {[user.email, user.phone_number].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>
      <div style={{ height: 1, background: "#E5E7EB", marginBottom: 28 }} />
      {order.map(key => sections[key]?.())}
    </div>
  );
}
