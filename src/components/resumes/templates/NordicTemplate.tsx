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

export default function NordicTemplate({ user, summary, workExperiences, education, skills, projects, profilePictureUrl, includePhoto, sectionOrder }: ResumeData) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Your Name";
  const blue = "#60A5FA";
  const darkBlue = "#1E40AF";
  const grouped = groupWorkByCompany(workExperiences);

  const groupedSkills = skills.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s.name);
    return acc;
  }, {});

  const sections: Record<string, () => JSX.Element | null> = {
    summary: () => summary ? (
      <section key="summary" style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, lineHeight: 1.8, margin: 0, color: "#64748B" }}>{summary}</p>
      </section>
    ) : null,
    work: () => grouped.length > 0 ? (
      <section key="work" style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 3, color: darkBlue, margin: "0 0 14px" }}>Experience</h2>
        {grouped.map((g, gi) => (
          <div key={gi} style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#64748B", margin: "0 0 4px" }}>{g.company}</p>
            {g.roles.map((r, ri) => (
              <div key={ri} style={{ marginBottom: 10, paddingLeft: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <p style={{ fontSize: 11, fontWeight: 600, margin: 0 }}>{r.title}</p>
                  <p style={{ fontSize: 10, color: "#94A3B8", margin: 0 }}>{fmtDate(r.start_date)} — {fmtDate(r.end_date)}</p>
                </div>
                {r.points.length > 0 && (
                  <ul style={{ margin: "6px 0 0", paddingLeft: 16, fontSize: 11, lineHeight: 1.7, color: "#475569", listStyleType: "disc" }}>
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
        <h2 style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 3, color: darkBlue, margin: "0 0 14px" }}>Projects</h2>
        {projects.map((p, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>{p.title}</p>
            <p style={{ fontSize: 11, color: "#64748B", margin: "3px 0 0", lineHeight: 1.7 }}>{p.description}</p>
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
        <h2 style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 3, color: darkBlue, margin: "0 0 14px" }}>Education</h2>
        {education.map((e, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>{e.institution}</p>
            <p style={{ fontSize: 11, color: "#64748B", margin: "3px 0 0", lineHeight: 1.5 }}>{e.degree} — {e.discipline} | {fmtDate(e.start_date)} — {fmtDate(e.end_date)}</p>
          </div>
        ))}
      </section>
    ) : null,
    skills: () => Object.keys(groupedSkills).length > 0 ? (
      <section key="skills" style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 3, color: darkBlue, margin: "0 0 14px" }}>Skills</h2>
        {Object.entries(groupedSkills).map(([cat, names]) => (
          <p key={cat} style={{ fontSize: 11, margin: "0 0 6px", color: "#475569", lineHeight: 1.6 }}><span style={{ fontWeight: 600 }}>{cat}:</span> {names.join(", ")}</p>
        ))}
      </section>
    ) : null,
  };

  const order = sectionOrder ?? DEFAULT_ORDER;

  return (
    <div className="resume-page nordic-template" style={{ fontFamily: "Inter, system-ui, sans-serif", width: "210mm", minHeight: "297mm", margin: "0 auto", background: "#FAFBFF", color: "#1E293B", padding: "25mm 28mm", wordSpacing: "0.05em" }}>
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {includePhoto && profilePictureUrl && (
            <img src={profilePictureUrl} alt="" style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover" }} />
          )}
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 300, margin: 0, letterSpacing: 1 }}>{fullName}</h1>
            <p style={{ fontSize: 11, color: "#94A3B8", margin: "6px 0 0", lineHeight: 1.5 }}>
              {[user.email, user.phone_number].filter(Boolean).join("  ·  ")}
            </p>
          </div>
        </div>
        <div style={{ width: 40, height: 3, background: blue, borderRadius: 2, marginTop: 16 }} />
      </div>
      {order.map(key => sections[key]?.())}
    </div>
  );
}
