import type { ResumeData } from "./types";
import { groupWorkByCompany } from "./groupWorkByCompany";
import { fmtDate } from "./fmtDate";

function DiamondIndicator({ level }: { level: string }) {
  const map: Record<string, number> = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 };
  const filled = map[level] ?? 2;
  return (
    <span style={{ display: "inline-flex", gap: 3 }}>
      {[1, 2, 3, 4].map((n) => (
        <span key={n} style={{ width: 8, height: 8, transform: "rotate(45deg)", backgroundColor: n <= filled ? "#0D9488" : "#E5E7EB", display: "inline-block" }} />
      ))}
    </span>
  );
}

function UrlPill({ url, color }: { url: string; color: string }) {
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 12, border: `1px dashed ${color}`, color, fontSize: 10, marginRight: 6, marginTop: 4 }}>
      {"🔗 "}{url.replace(/^https?:\/\//, "")}
    </span>
  );
}

export default function DiamondTemplate({ user, summary, workExperiences, education, skills, projects, profilePictureUrl, includePhoto }: ResumeData) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Your Name";
  const teal = "#0D9488";
  const grouped = groupWorkByCompany(workExperiences);

  const groupedSkills = skills.reduce<Record<string, typeof skills>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s);
    return acc;
  }, {});

  return (
    <div className="resume-page diamond-template" style={{ fontFamily: "Inter, system-ui, sans-serif", width: "8.5in", minHeight: "11in", margin: "0 auto", background: "#fff", color: "#1a1a1a", padding: "0.6in 0.8in", wordSpacing: "0.05em" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 6 }}>
        {includePhoto && profilePictureUrl && (
          <img src={profilePictureUrl} alt="" style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover", border: `2px solid ${teal}` }} />
        )}
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: teal }}>{fullName}</h1>
          <p style={{ fontSize: 10, color: "#6B7280", margin: "4px 0 0", lineHeight: 1.5 }}>{[user.email, user.phone_number].filter(Boolean).join("  ·  ")}</p>
        </div>
      </div>
      <div style={{ height: 2, background: `repeating-linear-gradient(90deg, ${teal} 0px, ${teal} 10px, transparent 10px, transparent 14px)`, marginBottom: 16 }} />

      {summary && (
        <section style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: teal, margin: "0 0 6px" }}>Summary</h2>
          <p style={{ fontSize: 11, lineHeight: 1.7, margin: 0, color: "#374151" }}>{summary}</p>
        </section>
      )}

      {grouped.length > 0 && (
        <section style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: teal, margin: "0 0 8px" }}>Experience</h2>
          {grouped.map((g, gi) => (
            <div key={gi} style={{ marginBottom: 12, paddingLeft: 12, borderLeft: `2px solid ${teal}` }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: teal, margin: "0 0 4px" }}>{g.company}</p>
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
      )}

      {projects.length > 0 && (
        <section style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: teal, margin: "0 0 8px" }}>Projects</h2>
          {projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 10, padding: "6px 10px", border: `1px dashed ${teal}`, borderRadius: 6 }}>
              <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{p.title}</p>
              <p style={{ fontSize: 11, margin: "2px 0 0", lineHeight: 1.6, color: "#374151" }}>{p.description}</p>
              {p.urls?.length > 0 && (
                <div style={{ marginTop: 4 }}>
                  {p.urls.map((u, j) => <UrlPill key={j} url={u} color={teal} />)}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {Object.keys(groupedSkills).length > 0 && (
        <section style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: teal, margin: "0 0 8px" }}>Skills</h2>
          {Object.entries(groupedSkills).map(([cat, items]) => (
            <div key={cat} style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: "#6B7280", margin: "0 0 4px" }}>{cat}</p>
              {items.map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                  <span style={{ fontSize: 10, lineHeight: 1.5 }}>{s.name}</span>
                  <DiamondIndicator level={s.proficiency} />
                </div>
              ))}
            </div>
          ))}
        </section>
      )}

      {education.length > 0 && (
        <section style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: teal, margin: "0 0 8px" }}>Education</h2>
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
      )}
    </div>
  );
}
