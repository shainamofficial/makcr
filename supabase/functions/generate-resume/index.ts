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

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    const { resumeId } = await req.json();
    if (!resumeId) {
      return new Response(JSON.stringify({ error: "resumeId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch resume record
    const { data: resume, error: resumeErr } = await supabase
      .from("resume")
      .select("*, resume_template:resume_template_id(name, template_config)")
      .eq("id", resumeId)
      .eq("user_id", userId)
      .single();

    if (resumeErr || !resume) {
      return new Response(JSON.stringify({ error: "Resume not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch full career graph
    const [
      { data: userProfile },
      { data: workExps },
      { data: educations },
      { data: skills },
      { data: projects },
    ] = await Promise.all([
      supabase.from("user").select("*").eq("id", userId).single(),
      supabase.from("work_experience").select("*, company:company_id(name), work_experience_points(*)").eq("user_id", userId),
      supabase.from("education").select("*, institution:institution_id(institution_name), degree:degree_id(degree_name), discipline:discipline_id(discipline_name)").eq("user_id", userId),
      supabase.from("user_skill_mapping").select("proficiency, years_of_experience, skill:skill_id(skill_name, category)").eq("user_id", userId),
      supabase.from("project").select("*").eq("user_id", userId),
    ]);

    // Fetch gap analysis chat if exists
    let gapChatContext = "";
    if (resume.chat_session_id) {
      const { data: chatMsgs } = await supabase
        .from("chat_message")
        .select("role, content")
        .eq("chat_session_id", resume.chat_session_id)
        .order("created_at", { ascending: true })
        .limit(50);
      if (chatMsgs?.length) {
        gapChatContext = `\n\nGAP ANALYSIS CONVERSATION:\n${chatMsgs.map((m: { role: string; content: string }) => `${m.role}: ${m.content}`).join("\n")}`;
      }
    }

    const careerGraph = JSON.stringify({
      profile: userProfile,
      work_experience: workExps ?? [],
      education: educations ?? [],
      skills: skills ?? [],
      projects: projects ?? [],
    });

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a professional resume writer. Generate a tailored resume based on the career graph and job description.

CAREER GRAPH:
${careerGraph}

JOB DESCRIPTION:
${resume.job_description}
${gapChatContext}

INSTRUCTIONS:
1. Tailor the resume content to match the job description keywords and requirements.
2. Highlight relevant experience, skills, and achievements.
3. Use strong action verbs and quantified results.
4. Keep it concise and professional.

Respond with valid JSON:
{
  "title": "Generated resume title (e.g. 'Software Engineer - Company Name')",
  "sections": {
    "summary": "Professional summary paragraph",
    "work_experience": [{"company": "...", "title": "...", "dates": "...", "bullets": ["..."]}],
    "education": [{"institution": "...", "degree": "...", "dates": "..."}],
    "skills": ["skill1", "skill2"],
    "projects": [{"title": "...", "description": "..."}]
  }
}`;

    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: "Generate the resume now." }],
      }),
    });

    if (!claudeResponse.ok) {
      const errText = await claudeResponse.text();
      console.error("Claude API error:", errText);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const claudeData = await claudeResponse.json();
    const rawContent = claudeData.content?.[0]?.text ?? "";

    let resumeContent;
    let resumeTitle = "Untitled Resume";
    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      resumeContent = JSON.parse(jsonMatch ? jsonMatch[0] : rawContent);
      resumeTitle = resumeContent.title || resumeTitle;
    } catch {
      resumeContent = { raw: rawContent };
    }

    // Update resume record
    await supabase
      .from("resume")
      .update({ status: "completed", title: resumeTitle })
      .eq("id", resumeId);

    // Update chat session status
    if (resume.chat_session_id) {
      await supabase
        .from("chat_session")
        .update({ status: "completed" })
        .eq("id", resume.chat_session_id);
    }

    return new Response(
      JSON.stringify({
        title: resumeTitle,
        resumeContent,
        downloadUrl: null, // PDF generation would be a separate step
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Generate resume error:", err);
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
