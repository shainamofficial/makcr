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

export default function TimelineTemplate({ user, summary, workExperiences, education, skills, projects, profilePictureUrl, includePhoto }: ResumeData) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Your Name";
  const accent = "#7C3AED";
  const grouped = groupWorkByCompany(workExperiences);

  const groupedSkills = skills.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s.name);
    return acc;
  }, {});

  const TimelineDot = () => (
    <div style={{ position: "absolute", left: -7, top: 4, width: 14, height: 14, borderRadius: "50%", background: `linear-gradient(135deg, ${accent}, #A78BFA)`, border: "2px solid #fff", boxShadow: `0 0 0 2px ${accent}` }} />
  );

  return (
    <div className="resume-page timeline-template" style={{ fontFamily: "Inter, system-ui, sans-serif", width: "8.5in", minHeight: "11in", margin: "0 auto", background: "#fff", color: "#1a1a1a", padding: "0.6in 0.8in", wordSpacing: "0.05em" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        {includePhoto && profilePictureUrl && (
          <img src={profilePictureUrl} alt="" style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover" }} />
        )}
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: accent }}>{fullName}</h1>
          <p style={{ fontSize: 10, color: "#6B7280", margin: "4px 0 0", lineHeight: 1.5 }}>{[user.email, user.phone_number].filter(Boolean).join("  ·  ")}</p>
        </div>
      </div>

      {summary && <p style={{ fontSize: 11, lineHeight: 1.7, margin: "0 0 18px", color: "#4B5563" }}>{summary}</p>}

      {grouped.length > 0 && (
        <section style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: accent, margin: "0 0 10px" }}>Experience</h2>
          <div style={{ borderLeft: `2px solid ${accent}`, marginLeft: 6, paddingLeft: 20 }}>
            {grouped.map((g, gi) => (
              <div key={gi} style={{ marginBottom: 14, position: "relative" }}>
                <TimelineDot />
                <p style={{ fontSize: 12, fontWeight: 700, color: accent, margin: "0 0 4px" }}>{g.company}</p>
                {g.roles.map((r, ri) => (
                  <div key={ri} style={{ marginBottom: 8, paddingLeft: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <p style={{ fontSize: 11, fontWeight: 600, margin: 0 }}>{r.title}</p>
                      <p style={{ fontSize: 9, color: "#9CA3AF", margin: 0 }}>{fmtDate(r.start_date)} — {fmtDate(r.end_date)}</p>
                    </div>
                    {r.points.length > 0 && (
                      <ul style={{ margin: "4px 0 0", paddingLeft: 16, fontSize: 10, lineHeight: 1.6, listStyleType: "disc" }}>
                        {r.points.map((p, j) => <li key={j} style={{ marginBottom: 2 }}>{p}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: accent, margin: "0 0 10px" }}>Projects</h2>
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
          <h2 style={{ fontSize: 13, fontWeight: 700, color: accent, margin: "0 0 10px" }}>Education</h2>
          <div style={{ borderLeft: `2px solid ${accent}`, marginLeft: 6, paddingLeft: 20 }}>
            {education.map((e, i) => (
              <div key={i} style={{ marginBottom: 10, position: "relative" }}>
                <TimelineDot />
                <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{e.institution}</p>
                <p style={{ fontSize: 11, margin: "2px 0 0", lineHeight: 1.5 }}>{e.degree} — {e.discipline}</p>
                <p style={{ fontSize: 9, color: "#9CA3AF", margin: "2px 0 0" }}>{fmtDate(e.start_date)} — {fmtDate(e.end_date)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {Object.keys(groupedSkills).length > 0 && (
        <section style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: accent, margin: "0 0 8px" }}>Skills</h2>
          {Object.entries(groupedSkills).map(([cat, names]) => (
            <p key={cat} style={{ fontSize: 11, margin: "0 0 4px", lineHeight: 1.6 }}><strong>{cat}:</strong> {names.join(", ")}</p>
          ))}
        </section>
      )}
    </div>
  );
}
