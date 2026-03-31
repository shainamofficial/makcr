import type { ResumeData } from "./types";
import { groupWorkByCompany } from "./groupWorkByCompany";
import { fmtDate } from "./fmtDate";

function UrlPill({ url, color }: { url: string; color: string }) {
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 12, border: `1px solid ${color}`, color, fontSize: 10, marginRight: 6, marginTop: 4 }}>
      {"🔗 "}{url.replace(/^https?:\/\//, "")}
    </span>
  );
}

export default function ClassicTemplate({ user, summary, workExperiences, education, skills, projects, profilePictureUrl, includePhoto }: ResumeData) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Your Name";
  const contact = [user.email, user.phone_number].filter(Boolean).join("  ·  ");
  const grouped = groupWorkByCompany(workExperiences);
  const accent = "#2563EB";

  const groupedSkills = skills.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s.name);
    return acc;
  }, {});

  return (
    <div className="resume-page classic-template" style={{ fontFamily: "Inter, system-ui, sans-serif", width: "8.5in", minHeight: "11in", padding: "0.75in 1in", margin: "0 auto", background: "#fff", color: "#1a1a1a", wordSpacing: "0.05em" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 8 }}>
        {includePhoto && profilePictureUrl && (
          <img src={profilePictureUrl} alt="" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
        )}
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: 0.5 }}>{fullName}</h1>
          {contact && <p style={{ fontSize: 11, margin: "4px 0 0", color: "#6B7280" }}>{contact}</p>}
        </div>
      </div>
      <div style={{ height: 2, background: accent, borderRadius: 1, margin: "8px 0 16px" }} />

      {summary && (
        <section style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 6px", color: accent }}>Summary</h2>
          <p style={{ fontSize: 11, lineHeight: 1.6, margin: 0, color: "#374151" }}>{summary}</p>
        </section>
      )}

      {grouped.length > 0 && (
        <section style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 6px", color: accent }}>Work Experience</h2>
          {grouped.map((g, gi) => (
            <div key={gi} style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 700, margin: "0 0 4px" }}>{g.company}</p>
              {g.roles.map((r, ri) => (
                <div key={ri} style={{ marginBottom: 8, paddingLeft: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <p style={{ fontSize: 11, fontWeight: 600, margin: 0 }}>{r.title}</p>
                    <p style={{ fontSize: 10, color: "#9CA3AF", margin: 0, whiteSpace: "nowrap" }}>{fmtDate(r.start_date)} — {fmtDate(r.end_date)}</p>
                  </div>
                  {r.points.length > 0 && (
                    <ul style={{ margin: "4px 0 0", paddingLeft: 18, fontSize: 11, lineHeight: 1.6, listStyleType: "disc" }}>
                      {r.points.map((p, j) => <li key={j} style={{ marginBottom: 2 }}>{p}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ))}
        </section>
      )}

      {projects.length > 0 && (
        <section style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 6px", color: accent }}>Projects</h2>
          {projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{p.title}</p>
              <p style={{ fontSize: 11, margin: "2px 0 0", lineHeight: 1.6, color: "#374151" }}>{p.description}</p>
              {p.urls?.length > 0 && (
                <div style={{ marginTop: 4 }}>
                  {p.urls.map((u, j) => <UrlPill key={j} url={u} color={accent} />)}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {education.length > 0 && (
        <section style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 6px", color: accent }}>Education</h2>
          {education.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{e.institution}</p>
                <p style={{ fontSize: 10, color: "#9CA3AF", margin: 0, whiteSpace: "nowrap" }}>{fmtDate(e.start_date)} — {fmtDate(e.end_date)}</p>
              </div>
              <p style={{ fontSize: 11, margin: "2px 0 0" }}>{e.degree} — {e.discipline}</p>
            </div>
          ))}
        </section>
      )}

      {Object.keys(groupedSkills).length > 0 && (
        <section style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 6px", color: accent }}>Skills</h2>
          {Object.entries(groupedSkills).map(([cat, names]) => (
            <p key={cat} style={{ fontSize: 11, margin: "0 0 4px", lineHeight: 1.6 }}>
              <strong>{cat}:</strong> {names.join(", ")}
            </p>
          ))}
        </section>
      )}
    </div>
  );
}
