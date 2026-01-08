import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!content || typeof content !== 'string') {
      throw new Error("Content is required");
    }

    const systemPrompt = `You are an expert at parsing unstructured content about projects, achievements, and work experiences into structured JSON format.

Your task is to extract project/work entries from the provided text and format them according to this schema:

{
  "projects": [
    {
      "title": "Project name (concise, professional)",
      "category": "MUST be exactly one of: Academic & Scholarly Achievements | Technology, Coding & Innovation | Leadership, Volunteering & Environmental Action | Model United Nations (MUN) & Public Speaking | Arts, Athletics & Personal Passions | Recognition & Awards",
      "description": "2-3 sentence professional summary focusing on outcomes and capabilities demonstrated. This is the SHORT description shown on cards.",
      "writeup": "Detailed description including context, approach, methodology, and impact. This is the FULL writeup with 4-8 sentences providing comprehensive information.",
      "tags": ["relevant", "technical", "tags", "skills"],
      "impact": "Quantified impact statement if available (e.g., '23% reduction', '500+ users', 'Top 10 nationally')",
      "start_date": "YYYY-MM-DD format (use 01 for day if unknown)",
      "end_date": "YYYY-MM-DD format or null if ongoing/one-time"
    }
  ]
}

CRITICAL GUIDELINES:
1. Category MUST be exactly one of the 6 options listed above - no variations
2. "description" should be SHORT (2-3 sentences) - this appears on project cards
3. "writeup" should be DETAILED (4-8 sentences) - this is the full case study text
4. Frame all content professionally - focus on skills demonstrated, not student identity
5. Translate achievements into professional signals (e.g., "Olympiad winner" → "Competitive problem-solving, analytical rigor")
6. Use precise, confident language without exaggeration
7. Extract dates as accurately as possible; use the 1st of the month if only month/year given
8. Tags should be specific technologies, skills, or domains (e.g., "Python", "Machine Learning", "Product Design")
9. Impact should be a concise metric or achievement statement
10. If multiple projects are described, extract each as a separate entry
11. Omit any project that lacks sufficient detail to create a meaningful entry

Return ONLY valid JSON, no additional text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Parse the following content into structured project entries:\n\n${content}` }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("AI processing failed");
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    let parsed;
    try {
      // Remove any markdown code blocks if present
      const cleanedContent = aiContent.replace(/```json\n?|\n?```/g, '').trim();
      parsed = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent);
      throw new Error("Failed to parse AI response as JSON");
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("process-content error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});