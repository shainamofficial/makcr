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

export default function ExecutiveTemplate({ user, summary, workExperiences, education, skills, projects, profilePictureUrl, includePhoto }: ResumeData) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Your Name";
  const amber = "#D97706";
  const navy = "#1E293B";
  const grouped = groupWorkByCompany(workExperiences);

  const groupedSkills = skills.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s.name);
    return acc;
  }, {});

  return (
    <div className="resume-page executive-template" style={{ fontFamily: "Inter, system-ui, sans-serif", width: "8.5in", minHeight: "11in", margin: "0 auto", background: "#fff", color: "#1a1a1a", wordSpacing: "0.05em" }}>
      <div style={{ background: `linear-gradient(135deg, ${navy} 0%, #334155 100%)`, color: "#fff", padding: "0.6in 0.8in", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 700, margin: 0, letterSpacing: 1 }}>{fullName}</h1>
          <p style={{ fontSize: 11, margin: "6px 0 0", color: amber, letterSpacing: 0.5 }}>
            {[user.email, user.phone_number].filter(Boolean).join("  ·  ")}
          </p>
        </div>
        {includePhoto && profilePictureUrl && (
          <img src={profilePictureUrl} alt="" style={{ width: 70, height: 70, borderRadius: "50%", objectFit: "cover", border: `2px solid ${amber}` }} />
        )}
      </div>

      <div style={{ padding: "0.5in 0.8in" }}>
        {summary && (
          <section style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: amber, margin: "0 0 6px", borderBottom: `1px solid ${amber}`, paddingBottom: 4 }}>Executive Summary</h2>
            <p style={{ fontSize: 11, lineHeight: 1.7, margin: 0, color: "#374151" }}>{summary}</p>
          </section>
        )}

        {grouped.length > 0 && (
          <section style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: amber, margin: "0 0 6px", borderBottom: `1px solid ${amber}`, paddingBottom: 4 }}>Professional Experience</h2>
            {grouped.map((g, gi) => (
              <div key={gi} style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: navy, margin: "0 0 4px" }}>{g.company}</p>
                {g.roles.map((r, ri) => (
                  <div key={ri} style={{ marginBottom: 8, paddingLeft: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <p style={{ fontSize: 11, fontWeight: 600, margin: 0 }}>{r.title}</p>
                      <p style={{ fontSize: 10, color: "#9CA3AF", margin: 0 }}>{fmtDate(r.start_date)} — {fmtDate(r.end_date)}</p>
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
          <section style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: amber, margin: "0 0 6px", borderBottom: `1px solid ${amber}`, paddingBottom: 4 }}>Key Projects</h2>
            {projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{p.title}</p>
                <p style={{ fontSize: 11, margin: "2px 0 0", lineHeight: 1.6, color: "#374151" }}>{p.description}</p>
                {p.urls?.length > 0 && (
                  <div style={{ marginTop: 4 }}>
                    {p.urls.map((u, j) => <UrlPill key={j} url={u} color={amber} />)}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {education.length > 0 && (
          <section style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: amber, margin: "0 0 6px", borderBottom: `1px solid ${amber}`, paddingBottom: 4 }}>Education</h2>
            {education.map((e, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{e.institution}</p>
                  <p style={{ fontSize: 10, color: "#9CA3AF", margin: 0 }}>{fmtDate(e.start_date)} — {fmtDate(e.end_date)}</p>
                </div>
                <p style={{ fontSize: 11, margin: "2px 0 0" }}>{e.degree} — {e.discipline}</p>
              </div>
            ))}
          </section>
        )}

        {Object.keys(groupedSkills).length > 0 && (
          <section style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: amber, margin: "0 0 6px", borderBottom: `1px solid ${amber}`, paddingBottom: 4 }}>Core Competencies</h2>
            {Object.entries(groupedSkills).map(([cat, names]) => (
              <p key={cat} style={{ fontSize: 11, margin: "0 0 4px", lineHeight: 1.6 }}><strong>{cat}:</strong> {names.join(", ")}</p>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
