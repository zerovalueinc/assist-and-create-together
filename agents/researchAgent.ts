// agents/researchAgent.ts
// Research Agent: Full Instantly v2 API integration for lead management

import fs from 'fs';

const INSTANTLY_API_KEY = process.env.INSTANTLY_API_KEY || 'YOUR_API_KEY_HERE';
const INSTANTLY_API_URL = 'https://api.instantly.ai/api/v2';

// Loads ICP config (for reference, not used for search)
export function loadICP(icpPath = './icp.json') {
  return JSON.parse(fs.readFileSync(icpPath, 'utf-8'));
}

// 1. Fetch/filter existing leads
export async function fetchLeads(params: Record<string, any> = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${INSTANTLY_API_URL}/leads?${query}`, {
    headers: {
      'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Instantly API error (fetch leads):', errorText);
    throw new Error('Instantly fetch leads failed');
  }
  return await response.json();
}

// 2. Bulk import new leads (with custom fields)
export async function importLeadsBulk(leads: any[], listName?: string, listId?: string) {
  let createdListId = listId;
  if (listName && !listId) {
    // Create a new lead list with the given name
    const createListResponse = await fetch(`${INSTANTLY_API_URL}/lead-lists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: listName }),
    });
    if (!createListResponse.ok) {
      const errorText = await createListResponse.text();
      console.error('Instantly API error (create list):', errorText);
      throw new Error('Instantly lead list creation failed');
    }
    const list = await createListResponse.json();
    createdListId = list.id || list.data?.id;
  }
  const response = await fetch(`${INSTANTLY_API_URL}/leads/list`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createdListId ? { leads, list_id: createdListId } : { leads }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Instantly API error (import leads):', errorText);
    throw new Error('Instantly import leads failed');
  }
  return await response.json();
}

// 3. Update/enrich a lead (PATCH by id)
export async function updateLead(leadId: string, customFields: Record<string, any>) {
  const response = await fetch(`${INSTANTLY_API_URL}/leads/${leadId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ customFields }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Instantly API error (update lead):', errorText);
    throw new Error('Instantly update lead failed');
  }
  return await response.json();
}

// 4. Assign leads to a campaign (on creation or via update)
export async function assignLeadsToCampaign(leadIds: string[], campaignId: string) {
  // This is a placeholder; check Instantly docs for the exact endpoint if needed
  // You may be able to PATCH leads with campaign_id or use a campaign move endpoint
  return Promise.all(
    leadIds.map(leadId =>
      updateLead(leadId, { campaign_id: campaignId })
    )
  );
}

// Move leads to another Instantly lead list
export async function moveLeadsToList(leadIds: string[], listId: string) {
  // Instantly API: PATCH /leads/{id} with new list_id
  return Promise.all(
    leadIds.map(leadId =>
      updateLead(leadId, { list_id: listId })
    )
  );
}

// Fetch all Instantly lead lists
export async function fetchLeadLists() {
  const response = await fetch(`${INSTANTLY_API_URL}/lead-lists`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Instantly API error (fetch lead lists):', errorText);
    throw new Error('Instantly fetch lead lists failed');
  }
  return await response.json();
}

// Fetch all Instantly campaigns
export async function fetchCampaigns() {
  const response = await fetch(`${INSTANTLY_API_URL}/campaigns`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Instantly API error (fetch campaigns):', errorText);
    throw new Error('Instantly fetch campaigns failed');
  }
  return await response.json();
}

// Fetch leads from a specific Instantly campaign (correct API v2 taxonomy)
export async function fetchCampaignLeads(campaignId: string, limit = 15) {
  const response = await fetch(`${INSTANTLY_API_URL}/leads/list`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ campaign_id: campaignId, limit }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Instantly API error (fetch campaign leads):', errorText);
    throw new Error('Instantly fetch campaign leads failed');
  }
  return await response.json();
} 