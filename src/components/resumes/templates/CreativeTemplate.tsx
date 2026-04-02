import type { ResumeData } from "./types";
import { groupWorkByCompany } from "./groupWorkByCompany";
import { fmtDate } from "./fmtDate";

const DEFAULT_ORDER = ["summary", "work", "projects", "skills", "education"];

export default function CreativeTemplate({ user, summary, workExperiences, education, skills, projects, profilePictureUrl, includePhoto, sectionOrder }: ResumeData) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Your Name";
  const coral = "#F06449";
  const bg = "#FFFAF8";
  const grouped = groupWorkByCompany(workExperiences);

  const groupedSkills = skills.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s.name);
    return acc;
  }, {});

  const sections: Record<string, () => JSX.Element | null> = {
    summary: () => summary ? (
      <section key="summary" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: coral, margin: "0 0 6px" }}>About Me</h2>
        <p style={{ fontSize: 11, lineHeight: 1.7, margin: 0, color: "#374151" }}>{summary}</p>
      </section>
    ) : null,
    work: () => grouped.length > 0 ? (
      <section key="work" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: coral, margin: "0 0 10px" }}>Experience</h2>
        {grouped.map((g, gi) => (
          <div key={gi} style={{ marginBottom: 14, paddingLeft: 12, borderLeft: `3px solid ${coral}` }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: coral, margin: "0 0 4px" }}>{g.company}</p>
            {g.roles.map((r, ri) => (
              <div key={ri} style={{ marginBottom: 8 }}>
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
      <section key="projects" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: coral, margin: "0 0 10px" }}>Projects</h2>
        {projects.map((p, i) => (
          <div key={i} style={{ marginBottom: 10, padding: "8px 12px", background: "#fff", borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
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
      <section key="skills" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: coral, margin: "0 0 10px" }}>Skills</h2>
        {Object.entries(groupedSkills).map(([cat, names]) => (
          <div key={cat} style={{ marginBottom: 8 }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "#9CA3AF", margin: "0 0 4px" }}>{cat}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {names.map((n, i) => (
                <span key={i} style={{ fontSize: 10, background: coral, color: "#fff", borderRadius: 12, padding: "3px 10px" }}>{n}</span>
              ))}
            </div>
          </div>
        ))}
      </section>
    ) : null,
    education: () => education.length > 0 ? (
      <section key="education" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: coral, margin: "0 0 10px" }}>Education</h2>
        {education.map((e, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{e.institution}</p>
            <p style={{ fontSize: 11, margin: "2px 0 0", lineHeight: 1.5 }}>{e.degree} — {e.discipline}</p>
            <p style={{ fontSize: 10, color: "#9CA3AF", margin: "2px 0 0" }}>{fmtDate(e.start_date)} — {fmtDate(e.end_date)}</p>
          </div>
        ))}
      </section>
    ) : null,
  };

  const order = sectionOrder ?? DEFAULT_ORDER;

  return (
    <div className="resume-page creative-template" style={{ fontFamily: "Inter, system-ui, sans-serif", width: "210mm", minHeight: "297mm", margin: "0 auto", background: bg, color: "#1a1a1a", padding: "15mm 18mm", wordSpacing: "0.05em" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
        {includePhoto && profilePictureUrl && (
          <img src={profilePictureUrl} alt="" style={{ width: 80, height: 80, borderRadius: 16, objectFit: "cover", border: `3px solid ${coral}` }} />
        )}
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: coral }}>{fullName}</h1>
          <p style={{ fontSize: 11, margin: "4px 0 0", color: "#9CA3AF", lineHeight: 1.5 }}>
            {[user.email, user.phone_number].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>
      <div style={{ height: 3, background: `linear-gradient(90deg, ${coral}, #FBBF24, ${coral})`, borderRadius: 2, marginBottom: 20 }} />
      {order.map(key => sections[key]?.())}
    </div>
  );
}
