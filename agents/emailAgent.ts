// agents/emailAgent.ts
// Email Agent: Fetches leads from Instantly, generates syntax fields using Openrouter LLM, and updates Instantly list

import fs from 'fs';

const INSTANTLY_API_KEY = process.env.INSTANTLY_API_KEY || 'YOUR_API_KEY_HERE';
const INSTANTLY_API_URL = 'https://api.instantly.ai/v1';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || 'YOUR_OPENROUTER_KEY_HERE';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

function getIcpContext(icpPath = './icp.json') {
  return JSON.parse(fs.readFileSync(icpPath, 'utf-8'));
}

export async function enrichLeadsWithSyntax(listId: string, icpPath = './icp.json') {
  const icp = getIcpContext(icpPath);
  // 1. Fetch leads from Instantly list
  const leadsResponse = await fetch(`${INSTANTLY_API_URL}/lists/${listId}/leads`, {
    headers: {
      'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  if (!leadsResponse.ok) throw new Error('Failed to fetch leads from Instantly');
  const leads = await leadsResponse.json();

  // 2. For each lead, generate syntax fields using Openrouter LLM
  const enrichedLeads = await Promise.all(
    (leads.data || leads).map(async (lead: any) => {
      const prompt = `You are a B2B lead enrichment agent for Midbound.ai.\n\nHere is the ICP and context for the product and campaign:\n${JSON.stringify(icp, null, 2)}\n\nHere is the lead data:\n${JSON.stringify(lead, null, 2)}\n\nGenerate all required Instantly syntax fields for this lead, using the ICP and context above. Respond in JSON format with the following fields:\n${Object.keys(icp.instantlySyntax.prospectFields).join(', ')}\n${Object.keys(icp.instantlySyntax.personalizationFields).join(', ')}\n${Object.keys(icp.instantlySyntax.performanceDataFields).join(', ')}\n${Object.keys(icp.instantlySyntax.senderFields).join(', ')}\n`;
      const llmResponse = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4', // or your preferred model
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!llmResponse.ok) throw new Error('Openrouter LLM failed');
      const llmData = await llmResponse.json();
      let syntaxFields = {};
      try {
        syntaxFields = JSON.parse(llmData.choices[0].message.content);
      } catch (e) {
        syntaxFields = { error: 'Failed to parse LLM response' };
      }
      return { ...lead, ...syntaxFields };
    })
  );

  // 3. Update Instantly list with enriched leads (if API supports bulk update)
  // If not, you may need to create a new list or update leads one by one
  // Placeholder for update logic:
  // await fetch(`${INSTANTLY_API_URL}/lists/${listId}/leads`, { ... })

  return enrichedLeads;
}

// Upload campaign to Instantly
export async function uploadToInstantly(campaignData: {
  name: string;
  subject: string;
  body: string;
  lead: {
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    title: string;
  };
  sequenceSteps?: number;
}): Promise<any> {
  const { name, subject, body, lead, sequenceSteps = 1 } = campaignData;
  
  if (!process.env.INSTANTLY_API_KEY) {
    throw new Error('Instantly API key not configured');
  }

  try {
    // Prepare the campaign data for Instantly
    const instantlyPayload = {
      name: name,
      subject: subject,
      body: body,
      leads: [{
        email: lead.email,
        firstName: lead.firstName,
        lastName: lead.lastName,
        company: lead.company,
        title: lead.title
      }],
      sequenceSteps: sequenceSteps
    };

    // Make API call to Instantly
    const response = await fetch('https://api.instantly.ai/api/v1/campaigns', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.INSTANTLY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(instantlyPayload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Instantly API error: ${response.status} - ${errorData}`);
    }

    const result = await response.json();
    console.log(`✅ Campaign "${name}" uploaded to Instantly successfully`);
    
    return {
      success: true,
      campaignId: result.id,
      campaignName: name,
      leadsCount: 1,
      uploadedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error uploading to Instantly:', error);
    throw new Error(`Failed to upload campaign to Instantly: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 