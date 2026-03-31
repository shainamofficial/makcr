import type { ResumeData } from "./types";
import { groupWorkByCompany } from "./groupWorkByCompany";
import { fmtDate } from "./fmtDate";

function UrlPill({ url, color }: { url: string; color: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" data-pdf-url={url}
       style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 8px", borderRadius: 9999, border: `1px solid ${color}`, color, fontSize: 9, lineHeight: "18px", verticalAlign: "middle", textDecoration: "none" }}>
      {"↗ "}{url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
    </a>
  );
}

const DEFAULT_ORDER = ["summary", "work", "projects", "education", "skills"];

export default function ElegantTemplate({ user, summary, workExperiences, education, skills, projects, profilePictureUrl, includePhoto, sectionOrder }: ResumeData) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Your Name";
  const gold = "#B08D57";
  const grouped = groupWorkByCompany(workExperiences);

  const groupedSkills = skills.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s.name);
    return acc;
  }, {});

  const sections: Record<string, () => JSX.Element | null> = {
    summary: () => summary ? (
      <section key="summary" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 12, fontWeight: 400, textTransform: "uppercase", letterSpacing: 3, color: gold, margin: "0 0 8px", textAlign: "center" }}>Summary</h2>
        <p style={{ fontSize: 11, lineHeight: 1.8, margin: 0, textAlign: "center", color: "#4B5563" }}>{summary}</p>
      </section>
    ) : null,
    work: () => grouped.length > 0 ? (
      <section key="work" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 12, fontWeight: 400, textTransform: "uppercase", letterSpacing: 3, color: gold, margin: "0 0 10px", textAlign: "center" }}>Experience</h2>
        {grouped.map((g, gi) => (
          <div key={gi} style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 12, fontWeight: 400, fontStyle: "italic", margin: "0 0 4px", textAlign: "center", color: gold }}>{g.company}</p>
            {g.roles.map((r, ri) => (
              <div key={ri} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, margin: 0 }}>{r.title}</p>
                  <p style={{ fontSize: 10, color: "#9CA3AF", margin: 0 }}>{fmtDate(r.start_date)} — {fmtDate(r.end_date)}</p>
                </div>
                {r.points.length > 0 && (
                  <ul style={{ margin: "4px 0 0", paddingLeft: 18, fontSize: 11, lineHeight: 1.7, listStyleType: "disc" }}>
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
      <section key="projects" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 12, fontWeight: 400, textTransform: "uppercase", letterSpacing: 3, color: gold, margin: "0 0 10px", textAlign: "center" }}>Projects</h2>
        {projects.map((p, i) => (
          <div key={i} style={{ marginBottom: 10, textAlign: "center" }}>
            <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{p.title}</p>
            <p style={{ fontSize: 11, margin: "2px 0 0", lineHeight: 1.7, color: "#4B5563" }}>{p.description}</p>
            {p.urls?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4, justifyContent: "center" }}>
                {p.urls.map((u, j) => <UrlPill key={j} url={u} color={gold} />)}
              </div>
            )}
          </div>
        ))}
      </section>
    ) : null,
    education: () => education.length > 0 ? (
      <section key="education" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 12, fontWeight: 400, textTransform: "uppercase", letterSpacing: 3, color: gold, margin: "0 0 10px", textAlign: "center" }}>Education</h2>
        {education.map((e, i) => (
          <div key={i} style={{ marginBottom: 8, textAlign: "center" }}>
            <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{e.institution}</p>
            <p style={{ fontSize: 11, margin: "2px 0 0", lineHeight: 1.5 }}>{e.degree} — {e.discipline} | {fmtDate(e.start_date)} — {fmtDate(e.end_date)}</p>
          </div>
        ))}
      </section>
    ) : null,
    skills: () => Object.keys(groupedSkills).length > 0 ? (
      <section key="skills" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 12, fontWeight: 400, textTransform: "uppercase", letterSpacing: 3, color: gold, margin: "0 0 8px", textAlign: "center" }}>Skills</h2>
        {Object.entries(groupedSkills).map(([cat, names]) => (
          <p key={cat} style={{ fontSize: 11, margin: "0 0 4px", textAlign: "center", lineHeight: 1.6 }}><strong>{cat}:</strong> {names.join(", ")}</p>
        ))}
      </section>
    ) : null,
  };

  const order = sectionOrder ?? DEFAULT_ORDER;

  return (
    <div className="resume-page elegant-template" style={{ fontFamily: "Georgia, 'Palatino Linotype', serif", width: "210mm", minHeight: "297mm", margin: "0 auto", background: "#fff", color: "#2a2a2a", padding: "25mm", wordSpacing: "0.05em" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        {includePhoto && profilePictureUrl && (
          <img src={profilePictureUrl} alt="" style={{ width: 70, height: 70, borderRadius: "50%", objectFit: "cover", marginBottom: 10, border: `2px solid ${gold}` }} />
        )}
        <h1 style={{ fontSize: 28, fontWeight: 400, margin: 0, letterSpacing: 3, textTransform: "uppercase" }}>{fullName}</h1>
        <p style={{ fontSize: 11, color: gold, margin: "6px 0 0", letterSpacing: 1, lineHeight: 1.5 }}>
          {[user.email, user.phone_number].filter(Boolean).join("  ·  ")}
        </p>
        <div style={{ width: 60, height: 1, background: gold, margin: "14px auto 0" }} />
      </div>
      {order.map(key => sections[key]?.())}
    </div>
  );
}
