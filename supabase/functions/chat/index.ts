import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Entity resolution helpers ───────────────────────────────────────────────

async function findOrCreateCompany(supabase: any, name: string): Promise<string> {
  const { data } = await supabase
    .from("company")
    .select("id")
    .ilike("name", name)
    .limit(1)
    .maybeSingle();
  if (data) return data.id;
  const { data: created, error } = await supabase
    .from("company")
    .insert({ name })
    .select("id")
    .single();
  if (error) throw error;
  return created.id;
}

async function findOrCreateInstitution(supabase: any, name: string, type = "university"): Promise<string> {
  const { data } = await supabase
    .from("institution")
    .select("id")
    .ilike("institution_name", name)
    .limit(1)
    .maybeSingle();
  if (data) return data.id;
  const { data: created, error } = await supabase
    .from("institution")
    .insert({ institution_name: name, institution_type: type })
    .select("id")
    .single();
  if (error) throw error;
  return created.id;
}

async function findOrCreateDegree(supabase: any, name: string): Promise<string> {
  const { data } = await supabase
    .from("degree")
    .select("id")
    .ilike("degree_name", name)
    .limit(1)
    .maybeSingle();
  if (data) return data.id;
  const { data: created, error } = await supabase
    .from("degree")
    .insert({ degree_name: name })
    .select("id")
    .single();
  if (error) throw error;
  return created.id;
}

async function findOrCreateDiscipline(supabase: any, name: string): Promise<string> {
  const { data } = await supabase
    .from("discipline")
    .select("id")
    .ilike("discipline_name", name)
    .limit(1)
    .maybeSingle();
  if (data) return data.id;
  const { data: created, error } = await supabase
    .from("discipline")
    .insert({ discipline_name: name })
    .select("id")
    .single();
  if (error) throw error;
  return created.id;
}

async function findOrCreateSkill(supabase: any, name: string, category = "general"): Promise<string> {
  const { data } = await supabase
    .from("skill")
    .select("id")
    .ilike("skill_name", name)
    .limit(1)
    .maybeSingle();
  if (data) return data.id;
  const { data: created, error } = await supabase
    .from("skill")
    .insert({ skill_name: name, category })
    .select("id")
    .single();
  if (error) throw error;
  return created.id;
}

// ─── Extracted data processing pipeline ──────────────────────────────────────

async function processExtractedData(
  supabase: any,
  userId: string,
  entries: Array<{ table: string; action: string; data: Record<string, any> }>
) {
  for (const entry of entries) {
    try {
      const d = entry.data;
      switch (entry.table) {
        case "work_experience": {
          if (!d.company_name || !d.title) break;
          const companyId = await findOrCreateCompany(supabase, d.company_name);
          // Duplicate check
          const { data: existing } = await supabase
            .from("work_experience")
            .select("id")
            .eq("user_id", userId)
            .eq("company_id", companyId)
            .ilike("title", d.title)
            .limit(1)
            .maybeSingle();
          if (existing) {
            // Update if action says so
            if (entry.action === "update") {
              await supabase.from("work_experience").update({
                description: d.description ?? null,
                start_date: d.start_date ?? null,
                end_date: d.end_date ?? null,
              }).eq("id", existing.id);
            }
            break;
          }
          await supabase.from("work_experience").insert({
            user_id: userId,
            company_id: companyId,
            title: d.title,
            description: d.description ?? null,
            start_date: d.start_date ?? null,
            end_date: d.end_date ?? null,
          });
          break;
        }
        case "work_experience_points": {
          if (!d.details) break;
          // Find the parent work experience
          let weId = d.work_experience_id;
          if (!weId && d.company_name && d.work_experience_title) {
            const companyId = await findOrCreateCompany(supabase, d.company_name);
            const { data: we } = await supabase
              .from("work_experience")
              .select("id")
              .eq("user_id", userId)
              .eq("company_id", companyId)
              .ilike("title", d.work_experience_title)
              .limit(1)
              .maybeSingle();
            weId = we?.id;
          }
          if (!weId) {
            console.log("Could not resolve work_experience for points:", d);
            break;
          }
          await supabase.from("work_experience_points").insert({
            work_experience_id: weId,
            details: d.details,
            impact: d.impact ?? null,
          });
          break;
        }
        case "education": {
          if (!d.institution_name || !d.degree_name || !d.discipline_name) break;
          const [institutionId, degreeId, disciplineId] = await Promise.all([
            findOrCreateInstitution(supabase, d.institution_name, d.institution_type ?? "university"),
            findOrCreateDegree(supabase, d.degree_name),
            findOrCreateDiscipline(supabase, d.discipline_name),
          ]);
          // Duplicate check
          const { data: existing } = await supabase
            .from("education")
            .select("id")
            .eq("user_id", userId)
            .eq("institution_id", institutionId)
            .eq("degree_id", degreeId)
            .limit(1)
            .maybeSingle();
          if (existing) {
            if (entry.action === "update") {
              await supabase.from("education").update({
                start_date: d.start_date ?? null,
                end_date: d.end_date ?? null,
              }).eq("id", existing.id);
            }
            break;
          }
          await supabase.from("education").insert({
            user_id: userId,
            institution_id: institutionId,
            degree_id: degreeId,
            discipline_id: disciplineId,
            start_date: d.start_date ?? null,
            end_date: d.end_date ?? null,
          });
          break;
        }
        case "user_skill_mapping": {
          if (!d.skill_name) break;
          const skillId = await findOrCreateSkill(supabase, d.skill_name, d.category ?? "general");
          // Duplicate check
          const { data: existing } = await supabase
            .from("user_skill_mapping")
            .select("id")
            .eq("user_id", userId)
            .eq("skill_id", skillId)
            .limit(1)
            .maybeSingle();
          if (existing) {
            if (entry.action === "update") {
              await supabase.from("user_skill_mapping").update({
                proficiency: d.proficiency ?? "intermediate",
                years_of_experience: d.years_of_experience ?? null,
              }).eq("id", existing.id);
            }
            break;
          }
          await supabase.from("user_skill_mapping").insert({
            user_id: userId,
            skill_id: skillId,
            proficiency: d.proficiency ?? "intermediate",
            years_of_experience: d.years_of_experience ?? null,
          });
          break;
        }
        case "project": {
          if (!d.title) break;
          // Duplicate check
          const { data: existing } = await supabase
            .from("project")
            .select("id")
            .eq("user_id", userId)
            .ilike("title", d.title)
            .limit(1)
            .maybeSingle();
          if (existing) break;
          await supabase.from("project").insert({
            user_id: userId,
            title: d.title,
            description: d.description ?? null,
            project_urls: d.project_urls ?? null,
            start_date: d.start_date ?? null,
            end_date: d.end_date ?? null,
          });
          break;
        }
        case "user": {
          // Update user profile fields
          const updates: Record<string, any> = {};
          if (d.first_name) updates.first_name = d.first_name;
          if (d.last_name) updates.last_name = d.last_name;
          if (d.profile_summary) updates.profile_summary = d.profile_summary;
          if (d.phone_number) updates.phone_number = d.phone_number;
          if (d.years_of_experience) updates.years_of_experience = d.years_of_experience;
          if (Object.keys(updates).length > 0) {
            await supabase.from("user").update(updates).eq("id", userId);
          }
          break;
        }
        default:
          console.log(`Unknown table: ${entry.table}`);
      }
    } catch (dbErr) {
      console.error(`Failed to process ${entry.table}:`, dbErr);
    }
  }
}

// ─── Main handler ────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = user.id;

    // Parse body
    const { message, sessionId } = await req.json();
    if (!message || !sessionId) {
      return new Response(
        JSON.stringify({ error: "message and sessionId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch conversation history + career graph + session in parallel
    const [
      { data: history },
      { data: userProfile },
      { data: workExps },
      { data: educations },
      { data: skills },
      { data: projects },
      { data: currentSession },
    ] = await Promise.all([
      supabase
        .from("chat_message")
        .select("role, content")
        .eq("chat_session_id", sessionId)
        .order("created_at", { ascending: true })
        .limit(50),
      supabase.from("user").select("*").eq("id", userId).single(),
      supabase
        .from("work_experience")
        .select("*, company:company_id(name), work_experience_points(*)")
        .eq("user_id", userId),
      supabase
        .from("education")
        .select("*, institution:institution_id(institution_name), degree:degree_id(degree_name), discipline:discipline_id(discipline_name)")
        .eq("user_id", userId),
      supabase
        .from("user_skill_mapping")
        .select("proficiency, years_of_experience, skill:skill_id(skill_name, category)")
        .eq("user_id", userId),
      supabase.from("project").select("*").eq("user_id", userId),
      supabase
        .from("chat_session")
        .select("session_type, current_topic")
        .eq("id", sessionId)
        .single(),
    ]);

    const careerGraphContext = JSON.stringify({
      profile: userProfile,
      work_experience: workExps ?? [],
      education: educations ?? [],
      skills: skills ?? [],
      projects: projects ?? [],
    });

    const systemPrompt = `You are Makcr's AI career interviewer. Your job is to build a comprehensive career graph for the user through conversational questions.

RULES:
1. Ask ONE question at a time.
2. Always provide examples to help the user answer.
3. Ask follow-up questions when answers are vague.
4. Encourage quantified achievements (metrics, impact, numbers).
5. Extract structured data from responses.

CONVERSATION FLOW ORDER (for new users):
1. Work Experience (most recent first) — company, title, dates, description, work experience points (achievements with impact)
2. Education (most recent first) — institution, degree, discipline, dates, extra-curriculars, positions of responsibility
3. Projects — title, description, type, dates, URLs
4. Skills — review skills identified during conversation, confirm proficiency and years of experience, ask for additional skills
5. Profile Photo — ask user to upload a professional photo

Within each section, fully complete one entry before moving to the next.
After completing each section, briefly summarize what was captured and ask the user to confirm before moving on.

HANDLING RESUME UPLOADS:
- When a user message starts with "[RESUME_UPLOAD]", it contains extracted text from their uploaded resume.
- Parse the resume content and map it to career graph sections.
- Present what you extracted and ask the user to confirm.
- Ask about missing details: dates, metrics, achievements.
- After processing the resume, continue with the normal flow for uncovered sections.

HANDLING CORRECTIONS:
- If the user corrects something, acknowledge it and issue an update (never create duplicates).

COMPLETING THE INTERVIEW:
- When all sections are done, mark the session as completed.
- Provide a closing summary and direct user to Profile Dashboard.

You MUST respond with valid JSON in this exact format:
{
  "user_message": "Your conversational response to the user",
  "extracted_data": null | [array of extraction objects],
  "pending_confirmations": null | [{"type": "string", "message": "string", "options": ["option1", "option2"]}],
  "current_topic": "work_experience" | "work_experience_points" | "education" | "extra_curriculars" | "positions_of_responsibility" | "projects" | "skills" | "profile_photo" | "completed"
}

CRITICAL: For extracted_data, each object must have "table", "action" ("create" or "update"), and "data" with these EXACT field structures:
- table "work_experience": data = { "company_name": string, "title": string, "start_date": "YYYY-MM-DD" | null, "end_date": "YYYY-MM-DD" | null, "description": string | null }
- table "work_experience_points": data = { "work_experience_title": string, "company_name": string, "details": string, "impact": string | null }
- table "education": data = { "institution_name": string, "institution_type": "university" | "college" | "school" | "bootcamp" | "other", "degree_name": string, "discipline_name": string, "start_date": "YYYY-MM-DD" | null, "end_date": "YYYY-MM-DD" | null }
- table "user_skill_mapping": data = { "skill_name": string, "category": "technical" | "soft" | "language" | "tool" | "other", "proficiency": "beginner" | "intermediate" | "advanced" | "expert", "years_of_experience": number | null }
- table "project": data = { "title": string, "description": string | null, "project_urls": ["url1"] | null, "start_date": "YYYY-MM-DD" | null, "end_date": "YYYY-MM-DD" | null }
- table "user": data = { "first_name": string, "last_name": string, "profile_summary": string, "phone_number": string | null, "years_of_experience": number | null }

IMPORTANT: Use ONLY the table names and field names listed above. Do NOT use "company", "institution", "skill", "skills", or any other table name. Use "work_experience" not "company" for work entries. Use "user_skill_mapping" not "skills" for skill entries.

Dates must be in "YYYY-MM-DD" format or null. For dates where only month/year is known, use the 1st of the month (e.g., "2023-06-01").

CURRENT USER'S CAREER GRAPH:
${careerGraphContext}

CURRENT SESSION TYPE: ${currentSession?.session_type ?? "initial_interview"}
CURRENT TOPIC: ${currentSession?.current_topic ?? "work_experience"}`;

    // Build Claude messages — truncate resume uploads to avoid context bloat
    const claudeMessages = [
      ...(history ?? []).map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content.startsWith("[RESUME_UPLOAD]")
          ? m.content.substring(0, 3000) + "\n\n[... resume text truncated for context window ...]"
          : m.content,
      })),
      { role: "user", content: message },
    ];

    // Call Claude
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: systemPrompt,
        messages: claudeMessages,
      }),
    });

    if (!claudeResponse.ok) {
      const errText = await claudeResponse.text();
      console.error("Claude API error:", errText);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const claudeData = await claudeResponse.json();
    const rawContent = claudeData.content?.[0]?.text ?? "";

    // Parse Claude's JSON response
    let parsed: {
      user_message: string;
      extracted_data: Array<{ table: string; action: string; data: Record<string, any> }> | null;
      pending_confirmations: unknown[] | null;
      current_topic: string;
    };

    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawContent);
    } catch {
      parsed = {
        user_message: rawContent,
        extracted_data: null,
        pending_confirmations: null,
        current_topic: currentSession?.current_topic ?? "work_experience",
      };
    }

    // Save AI message to chat_message
    await supabase.from("chat_message").insert({
      chat_session_id: sessionId,
      role: "assistant",
      content: parsed.user_message,
      structured_data_extracted: parsed.extracted_data
        ? JSON.stringify(parsed.extracted_data)
        : null,
    });

    // Update session's current_topic
    const sessionUpdate: Record<string, any> = { current_topic: parsed.current_topic };
    if (parsed.current_topic === "completed") {
      sessionUpdate.status = "completed";
    }
    await supabase
      .from("chat_session")
      .update(sessionUpdate)
      .eq("id", sessionId);

    // Process extracted_data through the entity resolution pipeline
    if (parsed.extracted_data && Array.isArray(parsed.extracted_data)) {
      console.log("Processing extracted_data:", JSON.stringify(parsed.extracted_data));
      await processExtractedData(supabase, userId, parsed.extracted_data);
    }

    return new Response(
      JSON.stringify({
        message: parsed.user_message,
        currentTopic: parsed.current_topic,
        extractedData: parsed.extracted_data,
        pendingConfirmations: parsed.pending_confirmations,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
