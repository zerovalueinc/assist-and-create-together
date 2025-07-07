import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function ingestHubspotData({ user_id, access_token }: { user_id: string, access_token: string }) {
  // Helper to upsert many rows
  async function upsertMany(table: string, rows: any[]) {
    if (!rows.length) return;
    // Upsert in batches of 100
    for (let i = 0; i < rows.length; i += 100) {
      const batch = rows.slice(i, i + 100);
      const { error } = await supabase.from(table).upsert(batch, { onConflict: 'provider,crm_id,user_id' });
      if (error) throw error;
    }
  }

  // 1. Fetch contacts
  let contacts: any[] = [];
  try {
    let after: string | undefined = undefined;
    do {
      const url: string = `https://api.hubapi.com/crm/v3/objects/contacts?limit=100${after ? `&after=${after}` : ''}`;
      const res: any = await axios.get(url, { headers: { Authorization: `Bearer ${access_token}` } });
      contacts = contacts.concat(res.data.results || []);
      after = res.data.paging?.next?.after;
    } while (after);
  } catch (err) { console.error('HubSpot contacts fetch error:', err); }
  await upsertMany('crm_contacts', contacts.map(c => ({
    user_id, provider: 'hubspot', crm_id: c.id, data: c, synced_at: new Date().toISOString()
  })));

  // 2. Fetch deals
  let deals: any[] = [];
  try {
    let after: string | undefined = undefined;
    do {
      const url: string = `https://api.hubapi.com/crm/v3/objects/deals?limit=100${after ? `&after=${after}` : ''}`;
      const res: any = await axios.get(url, { headers: { Authorization: `Bearer ${access_token}` } });
      deals = deals.concat(res.data.results || []);
      after = res.data.paging?.next?.after;
    } while (after);
  } catch (err) { console.error('HubSpot deals fetch error:', err); }
  await upsertMany('crm_deals', deals.map(d => ({
    user_id, provider: 'hubspot', crm_id: d.id, data: d, synced_at: new Date().toISOString()
  })));

  // 3. Fetch activities (engagements)
  let activities: any[] = [];
  try {
    let after: string | undefined = undefined;
    do {
      const url: string = `https://api.hubapi.com/crm/v3/objects/notes?limit=100${after ? `&after=${after}` : ''}`;
      const res: any = await axios.get(url, { headers: { Authorization: `Bearer ${access_token}` } });
      activities = activities.concat(res.data.results || []);
      after = res.data.paging?.next?.after;
    } while (after);
  } catch (err) { console.error('HubSpot activities fetch error:', err); }
  await upsertMany('crm_activities', activities.map(a => ({
    user_id, provider: 'hubspot', crm_id: a.id, data: a, synced_at: new Date().toISOString()
  })));

  return { contacts: contacts.length, deals: deals.length, activities: activities.length };
} 