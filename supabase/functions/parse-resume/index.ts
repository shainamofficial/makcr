import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

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

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: "Only PDF and DOCX files are supported" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "File size must be under 10MB" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fileBytes = new Uint8Array(await file.arrayBuffer());

    // Upload to storage for reference
    const fileName = `${userId}/${Date.now()}-${file.name}`;
    const { error: storageError } = await supabase.storage.from("resumes").upload(fileName, fileBytes, {
      contentType: file.type,
    });
    if (storageError) {
      console.warn("Storage upload failed (non-blocking):", storageError.message);
    }

    // Extract text based on file type
    let extractedText = "";

    if (file.type === "application/pdf") {
      // Use Anthropic to extract text from PDF via base64
      const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
      if (!anthropicKey) {
        return new Response(
          JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Convert to base64 using Deno std library (safe for large files)
      const base64 = encodeBase64(fileBytes);
      console.log("Calling Claude for PDF extraction, base64 length:", base64.length);

      const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-20250514",
          max_tokens: 4096,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "document",
                  source: {
                    type: "base64",
                    media_type: "application/pdf",
                    data: base64,
                  },
                },
                {
                  type: "text",
                  text: "Extract ALL text content from this resume document. Return ONLY the raw text content, preserving the structure (sections, bullet points, dates). Do not add any commentary.",
                },
              ],
            },
          ],
        }),
      });
      console.log("Claude response status:", claudeResponse.status);

      if (!claudeResponse.ok) {
        const errText = await claudeResponse.text();
        console.error("Claude PDF extraction error:", errText);
        return new Response(
          JSON.stringify({ error: "Failed to extract text from PDF" }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const claudeData = await claudeResponse.json();
      extractedText = claudeData.content?.[0]?.text ?? "";
    } else {
      // DOCX: extract raw text by finding XML content
      // DOCX is a zip file; we'll do a simple text extraction from the raw bytes
      const textDecoder = new TextDecoder();
      const rawText = textDecoder.decode(fileBytes);
      // Extract text between XML tags (rough but effective for DOCX)
      extractedText = rawText.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

      // If extraction is too short, fall back to Claude
      if (extractedText.length < 50) {
        const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
        if (anthropicKey) {
          const base64 = encodeBase64(fileBytes);
          const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": anthropicKey,
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
              model: "claude-haiku-4-20250514",
              max_tokens: 4096,
              messages: [
                {
                  role: "user",
                  content: `Extract ALL text from this DOCX file content (base64 encoded): ${base64.substring(0, 50000)}. Return ONLY the raw text.`,
                },
              ],
            }),
          });
          if (claudeResponse.ok) {
            const data = await claudeResponse.json();
            extractedText = data.content?.[0]?.text ?? extractedText;
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        text: extractedText,
        fileName: file.name,
        storagePath: fileName,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Parse resume error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to process resume. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
