import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function backfillIcpId() {
  console.log('Starting ICP ID backfill for company_analyzer_outputs...');

  // Fetch all Intel Reports
  const { data: intelReports, error: intelError } = await supabase
    .from('company_analyzer_outputs')
    .select('*');

  if (intelError) {
    console.error('Error fetching Intel Reports:', intelError);
    process.exit(1);
  }

  let updated = 0;
  for (const report of intelReports) {
    if (report.icp_id) continue; // Already linked
    // Try to find a matching ICP by user_id and companyName or website
    const { data: icp, error: icpError } = await supabase
      .from('icps')
      .select('id, companyName, website')
      .eq('user_id', report.user_id)
      .or(`companyName.eq.${report.companyName},website.eq.${report.website}`)
      .limit(1)
      .single();
    if (icpError || !icp) {
      console.log(`No matching ICP found for Intel Report ${report.id} (${report.companyName || report.website})`);
      continue;
    }
    // Update the Intel Report with the found icp_id
    const { error: updateError } = await supabase
      .from('company_analyzer_outputs')
      .update({ icp_id: icp.id })
      .eq('id', report.id);
    if (updateError) {
      console.error(`Failed to update Intel Report ${report.id}:`, updateError);
    } else {
      console.log(`Linked Intel Report ${report.id} to ICP ${icp.id}`);
      updated++;
    }
  }
  console.log(`Backfill complete. ${updated} Intel Reports linked to ICPs.`);
}

backfillIcpId().catch((err) => {
  console.error('Backfill script failed:', err);
  process.exit(1);
}); 