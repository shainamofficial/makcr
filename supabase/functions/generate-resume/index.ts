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

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

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
      { data: profilePic },
    ] = await Promise.all([
      supabase.from("user").select("*").eq("id", userId).single(),
      supabase.from("work_experience").select("*, company:company_id(name), work_experience_points(*)").eq("user_id", userId),
      supabase.from("education").select("*, institution:institution_id(institution_name), degree:degree_id(degree_name), discipline:discipline_id(discipline_name)").eq("user_id", userId),
      supabase.from("user_skill_mapping").select("proficiency, years_of_experience, skill:skill_id(skill_name, category)").eq("user_id", userId),
      supabase.from("project").select("*").eq("user_id", userId),
      supabase.from("profile_picture").select("link_to_storage").eq("user_id", userId).order("created_at", { ascending: false }).limit(1),
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
5. For work_experience dates, use the format "Mon YYYY" (e.g. "Jan 2020").
6. You MUST include ALL work experiences from the career graph. Do NOT skip or omit any company or role.
7. You MUST include ALL education entries from the career graph. Do NOT skip or omit any institution or degree.
8. You may reorder or adjust bullet points for relevance, but every position and degree must appear.

Respond with ONLY valid JSON (no markdown, no code fences):
{
  "title": "Resume title e.g. 'Software Engineer - Company Name'",
  "sections": {
    "summary": "Professional summary paragraph",
    "work_experience": [{"company": "Name", "title": "Role", "start_date": "Jan 2020", "end_date": "Present", "bullets": ["Achievement 1", "Achievement 2"]}],
    "education": [{"institution": "Name", "degree": "BS", "discipline": "CS", "start_date": "Aug 2013", "end_date": "May 2017"}],
    "skills": [{"name": "Python", "category": "Technical", "proficiency": "Expert"}, {"name": "Leadership", "category": "Soft Skills", "proficiency": "Advanced"}],
    "projects": [{"title": "Name", "description": "Description", "urls": []}]
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
        messages: [{ role: "user", content: "Generate the resume now. Respond with only the JSON." }],
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

    let resumeContent: Record<string, unknown>;
    let resumeTitle = "Untitled Resume";
    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      resumeContent = JSON.parse(jsonMatch ? jsonMatch[0] : rawContent);
      resumeTitle = (resumeContent.title as string) || resumeTitle;
    } catch {
      resumeContent = { raw: rawContent };
    }

    // Add user info and profile pic to the stored content
    const storedContent = {
      ...resumeContent,
      user: {
        first_name: userProfile?.first_name,
        last_name: userProfile?.last_name,
        email: userProfile?.email,
        phone_number: userProfile?.phone_number,
      },
      // Generate signed URL for profile picture (bucket is private)
      profilePictureUrl: null as string | null,
    };

    if (profilePic?.[0]?.link_to_storage) {
      const picPath = profilePic[0].link_to_storage;
      // If it's a storage path (not a full URL), create a signed URL
      if (!picPath.startsWith("http")) {
        const { data: signedData } = await supabaseAdmin.storage
          .from("profile-pictures")
          .createSignedUrl(picPath, 3600);
        storedContent.profilePictureUrl = signedData?.signedUrl ?? null;
      } else {
        storedContent.profilePictureUrl = picPath;
      }
    }

    // Store resume JSON in Supabase Storage using admin client (no RLS)
    const storagePath = `${userId}/${resumeId}.json`;
    const jsonBlob = new Blob([JSON.stringify(storedContent)], { type: "application/json" });

    const { error: uploadErr } = await supabaseAdmin.storage
      .from("resumes")
      .upload(storagePath, jsonBlob, { upsert: true, contentType: "application/json" });

    if (uploadErr) {
      console.error("Storage upload error:", uploadErr);
    }

    // Store the storage path (not a public URL) so the client can create signed URLs on demand
    // Update resume record
    await supabase
      .from("resume")
      .update({
        status: "completed",
        title: resumeTitle,
        generated_resume_link: storagePath,
      })
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
        resumeContent: storedContent,
        storagePath,
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
