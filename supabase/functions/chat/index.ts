import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    // Fetch conversation history
    const { data: history } = await supabase
      .from("chat_message")
      .select("role, content")
      .eq("chat_session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(50);

    // Fetch user's career graph for context
    const [
      { data: userProfile },
      { data: workExps },
      { data: educations },
      { data: skills },
      { data: projects },
    ] = await Promise.all([
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
    ]);

    // Fetch current session for topic tracking
    const { data: currentSession } = await supabase
      .from("chat_session")
      .select("session_type, current_topic")
      .eq("id", sessionId)
      .single();

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

HANDLING CORRECTIONS:
- If the user corrects something, acknowledge it and issue an update (never create duplicates).

COMPLETING THE INTERVIEW:
- When all sections are done, mark the session as completed.
- Provide a closing summary and direct user to Profile Dashboard.

You MUST respond with valid JSON in this exact format:
{
  "user_message": "Your conversational response to the user",
  "extracted_data": null | [{"table": "table_name", "action": "create"|"update", "data": {...}, "requires_lookup": {...}}],
  "pending_confirmations": null | [{"type": "string", "message": "string", "options": ["option1", "option2"]}],
  "current_topic": "work_experience" | "work_experience_points" | "education" | "extra_curriculars" | "positions_of_responsibility" | "projects" | "skills" | "profile_photo" | "completed"
}

CURRENT USER'S CAREER GRAPH:
${careerGraphContext}

CURRENT SESSION TYPE: ${currentSession?.session_type ?? "initial_interview"}
CURRENT TOPIC: ${currentSession?.current_topic ?? "work_experience"}`;

    // Build Claude messages
    const claudeMessages = [
      ...(history ?? []).map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
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
      extracted_data: unknown[] | null;
      pending_confirmations: unknown[] | null;
      current_topic: string;
    };

    try {
      // Try to extract JSON from the response (Claude sometimes wraps it in markdown)
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawContent);
    } catch {
      // Fallback: treat the whole response as the message
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
    await supabase
      .from("chat_session")
      .update({ current_topic: parsed.current_topic })
      .eq("id", sessionId);

    // Process extracted_data — write confirmed data to DB
    if (parsed.extracted_data && Array.isArray(parsed.extracted_data)) {
      for (const entry of parsed.extracted_data as Array<{
        table: string;
        action: string;
        data: Record<string, unknown>;
        requires_lookup?: Record<string, string>;
      }>) {
        try {
          if (entry.action === "create") {
            switch (entry.table) {
              case "company":
                await supabase.from("company").insert(entry.data);
                break;
              case "work_experience":
                await supabase
                  .from("work_experience")
                  .insert({ ...entry.data, user_id: userId });
                break;
              case "work_experience_points":
                await supabase.from("work_experience_points").insert(entry.data);
                break;
              case "education":
                await supabase
                  .from("education")
                  .insert({ ...entry.data, user_id: userId });
                break;
              case "institution":
                await supabase.from("institution").insert(entry.data);
                break;
              case "degree":
                await supabase.from("degree").insert(entry.data);
                break;
              case "discipline":
                await supabase.from("discipline").insert(entry.data);
                break;
              case "skill":
                await supabase.from("skill").insert(entry.data);
                break;
              case "user_skill_mapping":
                await supabase
                  .from("user_skill_mapping")
                  .insert({ ...entry.data, user_id: userId });
                break;
              case "project":
                await supabase
                  .from("project")
                  .insert({ ...entry.data, user_id: userId });
                break;
              default:
                console.log(`Unknown table: ${entry.table}`);
            }
          }
          // TODO: handle "update" actions
        } catch (dbErr) {
          console.error(`Failed to write ${entry.table}:`, dbErr);
        }
      }
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
