// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

console.log("Hello from Functions!")

// --- ICP Generation Logic (stubbed for now) ---
async function generateICPFromWebsite(websiteUrl: string): Promise<any> {
  // TODO: Replace with real LLM call in production
  return {
    targetCompanySize: {
      employeeRange: "11-50",
      revenueRange: "$2M-$10M"
    },
    targetIndustries: ["B2B SaaS", "Technology"],
    buyerPersonas: [
      {
        title: "VP of Sales",
        role: "Sales leadership",
        seniority: "VP"
      }
    ],
    painPointsAndTriggers: [
      "Manual outbound takes too much time",
      "Struggling to personalize outreach at scale"
    ],
    messagingAngles: [
      "Automated workflows for lead personalization",
      "AI-powered outbound"
    ],
    caseStudiesOrProof: [
      "Used by leading RevOps teams"
    ],
    recommendedApolloSearchParams: {
      employeeCount: "11-50",
      titles: ["VP of Sales", "VP of Marketing"],
      seniorityLevels: ["VP", "Director"],
      industries: ["Software", "Technology"],
      technologies: ["HubSpot", "Salesforce"],
      locations: ["United States"]
    }
  };
}

// --- Helper to get user from JWT ---
function getUserIdFromJwt(req: Request): string | null {
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || null;
  } catch {
    return null;
  }
}

// --- HTTP handler with user association, caching, and DB save ---
Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // Parse user from JWT
  const userId = getUserIdFromJwt(req);
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized: missing or invalid JWT" }), { status: 401 });
  }

  // Parse input
  let websiteUrl: string;
  try {
    const body = await req.json();
    websiteUrl = body.websiteUrl;
    if (!websiteUrl) throw new Error("Missing websiteUrl");
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400 });
  }

  // Supabase client (Edge runtime)
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization")! } }
  });

  // Check for cached result
  const { data: cached, error: cacheError } = await supabase
    .from("icp_analyses")
    .select("icp_result, updated_at")
    .eq("user_id", userId)
    .eq("website_url", websiteUrl)
    .maybeSingle();

  if (cacheError) {
    return new Response(JSON.stringify({ error: "DB error (cache check)", details: cacheError.message }), { status: 500 });
  }
  if (cached) {
    return new Response(JSON.stringify({ ...cached.icp_result, cached: true, updated_at: cached.updated_at }), { headers: { "Content-Type": "application/json" } });
  }

  // Run ICP generation
  try {
    const icp = await generateICPFromWebsite(websiteUrl);
    // Save to DB
    const { error: insertError } = await supabase
      .from("icp_analyses")
      .insert({ user_id: userId, website_url: websiteUrl, icp_result: icp });
    if (insertError) {
      return new Response(JSON.stringify({ error: "DB error (insert)", details: insertError.message }), { status: 500 });
    }
    return new Response(JSON.stringify(icp), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500 });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/icp-generator' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
