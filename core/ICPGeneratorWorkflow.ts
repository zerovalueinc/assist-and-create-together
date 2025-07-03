import { callClaude3 } from '../agents/claude';
import { BaseWorkflow, WorkflowState } from './BaseWorkflow';
import { z } from 'zod';

const GTMICPSchema = z.object({
  schemaVersion: z.string(),
  personas: z.array(z.object({
    title: z.string(),
    role: z.string(),
    painPoints: z.array(z.string()),
    responsibilities: z.array(z.string()).optional(),
  })),
  firmographics: z.object({
    industry: z.string(),
    companySize: z.string(),
    revenueRange: z.string(),
    region: z.string(),
  }),
  messagingAngles: z.array(z.string()),
  gtmRecommendations: z.string(),
  competitivePositioning: z.string(),
  objectionHandling: z.array(z.string()),
  campaignIdeas: z.array(z.string()),
  metricsToTrack: z.array(z.string()),
  filmReviews: z.string(),
  crossFunctionalAlignment: z.string(),
  demandGenFramework: z.string(),
  iterativeMeasurement: z.string(),
  trainingEnablement: z.string(),
  apolloSearchParams: z.object({
    employeeCount: z.string(),
    titles: z.array(z.string()),
    industries: z.array(z.string()),
    technologies: z.array(z.string()),
    locations: z.array(z.string()),
  }).optional(),
});

export class ICPGeneratorWorkflow extends BaseWorkflow {
  public name = 'ICPGenerator';

  async run(params: { url: string; comprehensive?: boolean; userId: number; userInput: string }): Promise<any> {
    this.state.status = 'running';
    try {
      const { url, userId, userInput } = params;
      if (!url) throw new Error('URL is required');

      // For now, we'll use a basic company analysis object
      // In the future, this should fetch from Supabase cache
      const companyAnalysis = {};

      // Advanced GTM SaaS playbook prompt
      const prompt = `You are an enterprise SaaS GTM strategist. Output a valid JSON object matching this exact schema (no markdown, no comments, no extra fields):

{
  "schemaVersion": "1.0.0",
  "personas": [{ "title": "string", "role": "string", "painPoints": ["string"], "responsibilities": ["string"] }],
  "firmographics": { "industry": "string", "companySize": "string", "revenueRange": "string", "region": "string" },
  "messagingAngles": ["string"],
  "gtmRecommendations": "string",
  "competitivePositioning": "string",
  "objectionHandling": ["string"],
  "campaignIdeas": ["string"],
  "metricsToTrack": ["string"],
  "filmReviews": "string",
  "crossFunctionalAlignment": "string",
  "demandGenFramework": "string",
  "iterativeMeasurement": "string",
  "trainingEnablement": "string",
  "apolloSearchParams": {
    "employeeCount": "string",
    "titles": ["string"],
    "industries": ["string"],
    "technologies": ["string"],
    "locations": ["string"]
  }
}

For each section, provide actionable steps, examples, and director-level recommendations. If any section is missing data, leave it as an empty string or empty array.

Company Analysis:
${JSON.stringify(companyAnalysis, null, 2)}

User GTM Input:
${userInput}`;
      
      const llmResponse = await callClaude3(prompt, 2);
      let result;
      try {
        result = JSON.parse(llmResponse);
        // Validate result against GTMICPSchema
        const parsed = GTMICPSchema.safeParse(result);
        if (!parsed.success) {
          console.error('LLM output failed schema validation:', parsed.error);
          throw new Error('LLM output does not match canonical schema.');
        }
        result = parsed.data;
      } catch (e) {
        // Fallback: wrap as summary if not JSON
        result = { summary: llmResponse };
      }
      
      // For now, we'll just return the result without saving to database
      // In the future, this should save to Supabase
      this.state.status = 'completed';
      this.state.result = result;
      return result;
    } catch (error: any) {
      this.state.status = 'failed';
      this.state.error = error.message || 'Unknown error';
      throw error;
    }
  }
} 