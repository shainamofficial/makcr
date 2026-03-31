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

export default function ManhattanTemplate({ user, summary, workExperiences, education, skills, projects, profilePictureUrl, includePhoto }: ResumeData) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Your Name";
  const dark = "#0F172A";
  const accent = "#F43F5E";
  const grouped = groupWorkByCompany(workExperiences);

  const groupedSkills = skills.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s.name);
    return acc;
  }, {});

  return (
    <div className="resume-page manhattan-template" style={{ fontFamily: "Inter, system-ui, sans-serif", width: "8.5in", minHeight: "11in", margin: "0 auto", background: "#fff", color: "#1a1a1a", display: "flex", wordSpacing: "0.05em" }}>
      <div style={{ width: "32%", background: dark, color: "#fff", padding: "0.6in 0.4in", flexShrink: 0 }}>
        {includePhoto && profilePictureUrl && (
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <img src={profilePictureUrl} alt="" style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover", border: `3px solid ${accent}` }} />
          </div>
        )}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: accent, marginBottom: 8 }}>Contact</h3>
          {user.email && <p style={{ fontSize: 10, margin: "0 0 4px", wordBreak: "break-all", opacity: 0.9, lineHeight: 1.5 }}>{user.email}</p>}
          {user.phone_number && <p style={{ fontSize: 10, margin: 0, opacity: 0.9, lineHeight: 1.5 }}>{user.phone_number}</p>}
        </div>
        {Object.keys(groupedSkills).length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: accent, marginBottom: 8 }}>Skills</h3>
            {Object.entries(groupedSkills).map(([cat, names]) => (
              <div key={cat} style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 9, fontWeight: 600, marginBottom: 3, opacity: 0.6 }}>{cat}</p>
                <p style={{ fontSize: 10, margin: 0, lineHeight: 1.7, opacity: 0.9 }}>{names.join(", ")}</p>
              </div>
            ))}
          </div>
        )}
        {education.length > 0 && (
          <div>
            <h3 style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: accent, marginBottom: 8 }}>Education</h3>
            {education.map((e, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 10, fontWeight: 700, margin: 0, lineHeight: 1.5 }}>{e.institution}</p>
                <p style={{ fontSize: 9, margin: "2px 0 0", opacity: 0.8, lineHeight: 1.5 }}>{e.degree} — {e.discipline}</p>
                <p style={{ fontSize: 9, margin: "2px 0 0", opacity: 0.5 }}>{fmtDate(e.start_date)} — {fmtDate(e.end_date)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ width: "68%", padding: "0.6in 0.5in" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px" }}>{fullName}</h1>
        <div style={{ height: 3, width: 40, background: accent, borderRadius: 2, marginBottom: 12 }} />
        {summary && <p style={{ fontSize: 11, lineHeight: 1.7, color: "#4B5563", margin: "0 0 20px" }}>{summary}</p>}

        {grouped.length > 0 && (
          <section style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: accent, margin: "0 0 10px", borderBottom: `2px solid ${accent}`, paddingBottom: 4 }}>Experience</h2>
            {grouped.map((g, gi) => (
              <div key={gi} style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: accent, margin: "0 0 4px" }}>{g.company}</p>
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
        )}

        {projects.length > 0 && (
          <section>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: accent, margin: "0 0 10px", borderBottom: `2px solid ${accent}`, paddingBottom: 4 }}>Projects</h2>
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
      </div>
    </div>
  );
}
