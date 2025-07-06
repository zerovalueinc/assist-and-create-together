// import { callClaude3 } from '../agents/claude';
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
      
      // const llmResponse = await callClaude3(prompt, 2);
      let result = {};
      
      try {
        // result = JSON.parse(llmResponse);
      } catch (parseError) {
        console.error('Failed to parse LLM response:', parseError);
        throw new Error('Invalid response format from LLM');
      }

      // Use type guards or default values for result.gtmRecommendations and similar properties
      const gtmRecommendations = (result && typeof result === 'object' && 'gtmRecommendations' in result) ? (result as any).gtmRecommendations : null;

      // Save to company_analysis_reports with embedded ICP
      const reportData = {
        user_id: userId.toString(),
        company_name: url,
        company_url: url,
        company_profile: companyAnalysis,
        decision_makers: [],
        pain_points: [],
        technologies: [],
        location: '',
        market_trends: '',
        competitive_landscape: '',
        go_to_market_strategy: gtmRecommendations || '',
        research_summary: '',
        icp_profile: result,
        llm_output: JSON.stringify(result)
      };

      this.state.status = 'completed';
      this.state.result = {
        report: reportData,
        icp_profile: result
      };

      return this.state.result;
    } catch (error) {
      this.state.status = 'failed';
      this.state.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }
} 