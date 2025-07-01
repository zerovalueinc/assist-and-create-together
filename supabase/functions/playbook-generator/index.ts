// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// deno-lint-ignore-file no-explicit-any
// @ts-ignore: Deno global and remote imports are valid in Supabase Edge Functions
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

console.log("Hello from Functions!")

// --- Playbook Generation Logic (stubbed for now) ---
async function generatePlaybook(websiteUrl: string, icp: any, gtmForm: any): Promise<any> {
  // TODO: Replace with real LLM call in production
  // The prompt would use both ICP and GTM form data
  return {
    playbookTitle: `GTM Playbook for ${websiteUrl}`,
    summary: `This playbook is generated using the following ICP and GTM form data.\n\nICP: ${JSON.stringify(icp, null, 2)}\n\nGTM Form: ${JSON.stringify(gtmForm, null, 2)}`,
    steps: [
      "Define target personas and pain points (from ICP)",
      "Incorporate GTM strategies (from GTM form)",
      "Craft outbound messaging",
      "Build lead lists using Apollo",
      "Launch multi-channel campaigns",
      "Measure and iterate"
    ],
    icpUsed: icp,
    gtmFormUsed: gtmForm
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
  let websiteUrl: string, icp: any, gtmForm: any;
  try {
    const body = await req.json();
    websiteUrl = body.websiteUrl;
    icp = body.icp;
    gtmForm = body.gtmForm;
    if (!websiteUrl || !icp || !gtmForm) throw new Error("Missing websiteUrl, icp, or gtmForm");
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400 });
  }

  // Supabase client (Edge runtime)
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization")! } }
  });

  // Check for cached result (compare icp and gtmForm as JSON string for uniqueness)
  const { data: cached, error: cacheError } = await supabase
    .from("playbook_analyses")
    .select("playbook_result, updated_at")
    .eq("user_id", userId)
    .eq("website_url", websiteUrl)
    .eq("icp", icp)
    .eq("gtm_form", gtmForm)
    .maybeSingle();

  if (cacheError) {
    return new Response(JSON.stringify({ error: "DB error (cache check)", details: cacheError.message }), { status: 500 });
  }
  if (cached) {
    return new Response(JSON.stringify({ ...cached.playbook_result, cached: true, updated_at: cached.updated_at }), { headers: { "Content-Type": "application/json" } });
  }

  // Run playbook generation
  try {
    const playbook = await generatePlaybook(websiteUrl, icp, gtmForm);
    // Save to DB
    const { error: insertError } = await supabase
      .from("playbook_analyses")
      .insert({ user_id: userId, website_url: websiteUrl, icp, gtm_form: gtmForm, playbook_result: playbook });
    if (insertError) {
      return new Response(JSON.stringify({ error: "DB error (insert)", details: insertError.message }), { status: 500 });
    }
    return new Response(JSON.stringify(playbook), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500 });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/playbook-generator' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
