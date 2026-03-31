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

export default function TwoColumnTemplate({ user, summary, workExperiences, education, skills, projects, profilePictureUrl, includePhoto }: ResumeData) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Your Name";
  const accent = "#6366F1";
  const grouped = groupWorkByCompany(workExperiences);

  const groupedSkills = skills.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s.name);
    return acc;
  }, {});

  return (
    <div className="resume-page twocolumn-template" style={{ fontFamily: "Inter, system-ui, sans-serif", width: "8.5in", minHeight: "11in", margin: "0 auto", background: "#fff", color: "#1a1a1a", wordSpacing: "0.05em" }}>
      <div style={{ padding: "0.5in 0.6in 0.3in", borderBottom: `2px solid ${accent}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {includePhoto && profilePictureUrl && (
            <img src={profilePictureUrl} alt="" style={{ width: 55, height: 55, borderRadius: "50%", objectFit: "cover" }} />
          )}
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{fullName}</h1>
            <p style={{ fontSize: 10, color: "#6B7280", margin: "4px 0 0", lineHeight: 1.5 }}>{[user.email, user.phone_number].filter(Boolean).join("  ·  ")}</p>
          </div>
        </div>
        {summary && <p style={{ fontSize: 10, lineHeight: 1.7, margin: "10px 0 0", color: "#4B5563" }}>{summary}</p>}
      </div>

      <div style={{ display: "flex", padding: "0.3in 0.6in 0.5in" }}>
        <div style={{ width: "58%", paddingRight: "0.3in" }}>
          {grouped.length > 0 && (
            <section style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: accent, margin: "0 0 8px", borderBottom: `1px solid #E5E7EB`, paddingBottom: 4 }}>Experience</h2>
              {grouped.map((g, gi) => (
                <div key={gi} style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, margin: "0 0 4px" }}>{g.company}</p>
                  {g.roles.map((r, ri) => (
                    <div key={ri} style={{ marginBottom: 6, paddingLeft: 6 }}>
                      <p style={{ fontSize: 10, fontWeight: 600, margin: 0 }}>{r.title}</p>
                      <p style={{ fontSize: 9, color: "#9CA3AF", margin: "1px 0 0" }}>{fmtDate(r.start_date)} — {fmtDate(r.end_date)}</p>
                      {r.points.length > 0 && (
                        <ul style={{ margin: "3px 0 0", paddingLeft: 14, fontSize: 10, lineHeight: 1.6, listStyleType: "disc" }}>
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
            <section>
              <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: accent, margin: "0 0 8px", borderBottom: `1px solid #E5E7EB`, paddingBottom: 4 }}>Projects</h2>
              {projects.map((p, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, margin: 0 }}>{p.title}</p>
                  <p style={{ fontSize: 10, margin: "2px 0 0", lineHeight: 1.6, color: "#374151" }}>{p.description}</p>
                  {p.urls?.length > 0 && (
                    <div style={{ marginTop: 3 }}>
                      {p.urls.map((u, j) => <UrlPill key={j} url={u} color={accent} />)}
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}
        </div>

        <div style={{ width: "42%", paddingLeft: "0.3in", borderLeft: `1px solid #E5E7EB` }}>
          {Object.keys(groupedSkills).length > 0 && (
            <section style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: accent, margin: "0 0 8px", borderBottom: `1px solid #E5E7EB`, paddingBottom: 4 }}>Skills</h2>
              {Object.entries(groupedSkills).map(([cat, names]) => (
                <div key={cat} style={{ marginBottom: 8 }}>
                  <p style={{ fontSize: 10, fontWeight: 600, margin: "0 0 3px", color: accent }}>{cat}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {names.map((n, i) => (
                      <span key={i} style={{ fontSize: 9, background: "#EEF2FF", color: accent, borderRadius: 10, padding: "2px 7px" }}>{n}</span>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}
          {education.length > 0 && (
            <section>
              <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: accent, margin: "0 0 8px", borderBottom: `1px solid #E5E7EB`, paddingBottom: 4 }}>Education</h2>
              {education.map((e, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, margin: 0, lineHeight: 1.5 }}>{e.institution}</p>
                  <p style={{ fontSize: 10, margin: "1px 0 0", lineHeight: 1.5 }}>{e.degree} — {e.discipline}</p>
                  <p style={{ fontSize: 9, color: "#9CA3AF", margin: "1px 0 0" }}>{fmtDate(e.start_date)} — {fmtDate(e.end_date)}</p>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
