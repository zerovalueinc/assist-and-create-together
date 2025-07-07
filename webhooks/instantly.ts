// webhooks/instantly.ts
// Entry point for Instantly webhook integration
import { processExecutiveLead, LeadInput } from '../core/processLead';

// Example handler (to be adapted for your framework, e.g., Express, Next.js API route, etc.)
export async function handleInstantlyWebhook(req: any, res: any) {
  const lead: LeadInput = req.body;
  await processExecutiveLead(lead);
  res.status(200).json({ success: true });
} 