"use strict";
// agents/analysisAgent.ts
// High-quality analysis and intelligence processing using the best LLM models
// Processes raw web crawling data into actionable intelligence reports
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeWithBestModel = analyzeWithBestModel;
exports.batchAnalyze = batchAnalyze;
exports.quickAnalyze = quickAnalyze;
// Main analysis function - uses the BEST model for processing
function analyzeWithBestModel(task) {
    return __awaiter(this, void 0, void 0, function* () {
        const startTime = Date.now();
        try {
            console.log(`🧠 Starting high-quality analysis with best model for: ${task.type}`);
            let result;
            let modelUsed;
            switch (task.type) {
                case 'icp_generation':
                    result = yield generateICPWithBestModel(task.data);
                    modelUsed = 'claude-3.5-sonnet';
                    break;
                case 'ibp_analysis':
                    result = yield generateIBPWithBestModel(task.data);
                    modelUsed = 'claude-3.5-sonnet';
                    break;
                case 'sales_intelligence':
                    result = yield generateSalesIntelligenceWithBestModel(task.data);
                    modelUsed = 'claude-3.5-sonnet';
                    break;
                case 'market_analysis':
                    result = yield analyzeMarketWithBestModel(task.data);
                    modelUsed = 'claude-3.5-sonnet';
                    break;
                case 'competitive_intelligence':
                    result = yield analyzeCompetitionWithBestModel(task.data);
                    modelUsed = 'claude-3.5-sonnet';
                    break;
                default:
                    throw new Error(`Unknown analysis task type: ${task.type}`);
            }
            const processingTime = Date.now() - startTime;
            const costEstimate = estimateCost(modelUsed, task.type);
            console.log(`✅ High-quality analysis completed in ${processingTime}ms using ${modelUsed}`);
            return {
                success: true,
                data: result,
                model_used: modelUsed,
                cost_estimate: costEstimate,
                processing_time: processingTime
            };
        }
        catch (error) {
            console.error('Error in high-quality analysis:', error);
            return {
                success: false,
                data: null,
                model_used: 'error',
                cost_estimate: '$0.00',
                processing_time: Date.now() - startTime
            };
        }
    });
}
// ICP Generation with best model
function generateICPWithBestModel(websiteData) {
    return __awaiter(this, void 0, void 0, function* () {
        const systemPrompt = `You are a world-class ICP (Ideal Customer Profile) analyst specializing in B2B SaaS and technology companies.

Your expertise includes:
- Deep market understanding
- Customer segmentation analysis
- Pain point identification
- Technology stack analysis
- Buyer persona development

Analyze the provided website and company data to create a comprehensive, actionable ICP that sales teams can use for targeted outreach.`;
        const userPrompt = `Analyze this company data and create a comprehensive ICP:

**Company Data:**
${JSON.stringify(websiteData, null, 2)}

Create a detailed ICP with:
1. Target company size and characteristics
2. Buyer personas with specific titles and roles
3. Pain points and triggers
4. Technology stack and integrations
5. Messaging angles and value propositions
6. Recommended Apollo search parameters

Return as structured JSON with actionable insights.`;
        return yield callBestModel(userPrompt, systemPrompt);
    });
}
// IBP Analysis with best model
function generateIBPWithBestModel(companyData) {
    return __awaiter(this, void 0, void 0, function* () {
        const systemPrompt = `You are a senior Sales Intelligence Research Analyst with expertise in:
- Quantitative market analysis
- Competitive intelligence
- Customer segmentation
- Sales intelligence
- Revenue optimization strategies

Create comprehensive Ideal Business Persona (IBP) reports that drive sales success.`;
        const userPrompt = `Create a comprehensive IBP analysis from this company data:

**Company Research Data:**
${JSON.stringify(companyData, null, 2)}

Generate a detailed IBP including:
1. Quantitative market analysis (size, growth, trends)
2. Enhanced buyer personas (decision makers, influencers, economic buyers)
3. Sales intelligence (buying triggers, timelines, risk factors)
4. Competitive intelligence (direct/indirect competitors, positioning)
5. Revenue optimization (pricing, sales cycle, expansion opportunities)

Return as structured JSON with detailed, actionable insights.`;
        return yield callBestModel(userPrompt, systemPrompt);
    });
}
// Sales Intelligence with best model
function generateSalesIntelligenceWithBestModel(companyData) {
    return __awaiter(this, void 0, void 0, function* () {
        const systemPrompt = `You are a Sales Intelligence Expert specializing in:
- Market opportunity analysis
- Buyer behavior patterns
- Sales process optimization
- Competitive positioning
- Revenue growth strategies

Create actionable sales intelligence reports that help sales teams identify and convert high-intent prospects.`;
        const userPrompt = `Generate comprehensive sales intelligence from this data:

**Company Intelligence Data:**
${JSON.stringify(companyData, null, 2)}

Create detailed sales intelligence including:
1. Company overview and market position
2. Market intelligence and opportunity sizing
3. Financial performance and funding analysis
4. Technology stack and product offerings
5. Sales and marketing strategy insights
6. IBP capability maturity assessment
7. Sales opportunity insights and buying signals

Focus on actionable insights for sales teams targeting high-intent buyers.`;
        return yield callBestModel(userPrompt, systemPrompt);
    });
}
// Market Analysis with best model
function analyzeMarketWithBestModel(marketData) {
    return __awaiter(this, void 0, void 0, function* () {
        const systemPrompt = `You are a Market Intelligence Analyst with expertise in:
- Market sizing and segmentation
- Industry trends and dynamics
- Competitive landscape analysis
- Growth opportunity identification
- Market maturity assessment

Provide deep market insights for strategic decision-making.`;
        const userPrompt = `Analyze this market data for strategic insights:

**Market Research Data:**
${JSON.stringify(marketData, null, 2)}

Provide comprehensive market analysis including:
1. Total addressable market (TAM) and serviceable market
2. Market growth trends and drivers
3. Competitive landscape and positioning
4. Market maturity and consolidation trends
5. Key success factors and barriers
6. Strategic recommendations

Return detailed market intelligence for business strategy.`;
        return yield callBestModel(userPrompt, systemPrompt);
    });
}
// Competitive Intelligence with best model
function analyzeCompetitionWithBestModel(competitorData) {
    return __awaiter(this, void 0, void 0, function* () {
        const systemPrompt = `You are a Competitive Intelligence Specialist with expertise in:
- Competitor analysis and benchmarking
- Market positioning strategies
- Competitive advantage identification
- Threat assessment and response
- Strategic positioning recommendations

Provide actionable competitive intelligence for strategic advantage.`;
        const userPrompt = `Analyze this competitive data for strategic insights:

**Competitive Research Data:**
${JSON.stringify(competitorData, null, 2)}

Generate comprehensive competitive intelligence including:
1. Direct and indirect competitor analysis
2. Competitive positioning and differentiation
3. Strengths, weaknesses, and opportunities
4. Market share and competitive dynamics
5. Strategic recommendations and positioning
6. Competitive response strategies

Focus on actionable insights for competitive advantage.`;
        return yield callBestModel(userPrompt, systemPrompt);
    });
}
// Call the best model for analysis (Claude 3.5 Sonnet)
function callBestModel(userPrompt, systemPrompt) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const openRouterApiKey = process.env.OPENROUTER_API_KEY;
        if (!openRouterApiKey) {
            throw new Error('OPENROUTER_API_KEY not found');
        }
        const response = yield fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openRouterApiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://personaops.local',
                'X-Title': 'PersonaOps Analysis Agent'
            },
            body: JSON.stringify({
                model: 'anthropic/claude-3.5-sonnet', // Best model for analysis
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                max_tokens: 6000, // Higher for detailed analysis
                temperature: 0.2, // Slightly higher for creative insights
                top_p: 0.9
            })
        });
        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.status}`);
        }
        const data = yield response.json();
        const content = ((_b = (_a = data.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '';
        try {
            return JSON.parse(content);
        }
        catch (parseError) {
            console.warn('Failed to parse analysis result as JSON, returning as text');
            return { analysis_result: content };
        }
    });
}
// Cost estimation for different analysis types
function estimateCost(model, taskType) {
    const baseCosts = {
        'claude-3.5-sonnet': {
            input: 0.003, // per 1K tokens
            output: 0.015 // per 1K tokens
        }
    };
    const estimatedTokens = {
        'icp_generation': { input: 2000, output: 1500 },
        'ibp_analysis': { input: 3000, output: 2500 },
        'sales_intelligence': { input: 4000, output: 3000 },
        'market_analysis': { input: 2500, output: 2000 },
        'competitive_intelligence': { input: 3000, output: 2500 }
    };
    const costs = baseCosts[model];
    const tokens = estimatedTokens[taskType];
    if (!costs || !tokens) {
        return '$0.05-0.15';
    }
    const inputCost = (tokens.input / 1000) * costs.input;
    const outputCost = (tokens.output / 1000) * costs.output;
    const totalCost = inputCost + outputCost;
    return `$${totalCost.toFixed(3)}`;
}
// Batch analysis for multiple tasks
function batchAnalyze(tasks) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`🔄 Starting batch analysis of ${tasks.length} tasks`);
        const results = yield Promise.all(tasks.map(task => analyzeWithBestModel(task)));
        const successCount = results.filter(r => r.success).length;
        console.log(`✅ Batch analysis completed: ${successCount}/${tasks.length} successful`);
        return results;
    });
}
// Quick analysis for simple tasks (uses Haiku for speed)
function quickAnalyze(task) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const startTime = Date.now();
        try {
            console.log(`⚡ Quick analysis with Haiku for: ${task.type}`);
            const openRouterApiKey = process.env.OPENROUTER_API_KEY;
            if (!openRouterApiKey) {
                throw new Error('OPENROUTER_API_KEY not found');
            }
            const response = yield fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${openRouterApiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://personaops.local',
                    'X-Title': 'PersonaOps Quick Analysis'
                },
                body: JSON.stringify({
                    model: 'anthropic/claude-3.5-haiku', // Fast/cheap for simple tasks
                    messages: [
                        { role: 'system', content: 'Provide quick, accurate analysis of the given data.' },
                        { role: 'user', content: `Analyze this ${task.type} data: ${JSON.stringify(task.data)}` }
                    ],
                    max_tokens: 1000,
                    temperature: 0.1
                })
            });
            if (!response.ok) {
                throw new Error(`OpenRouter API error: ${response.status}`);
            }
            const data = yield response.json();
            const content = ((_b = (_a = data.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '';
            const processingTime = Date.now() - startTime;
            return {
                success: true,
                data: { quick_analysis: content },
                model_used: 'claude-3.5-haiku',
                cost_estimate: '$0.001-0.005',
                processing_time: processingTime
            };
        }
        catch (error) {
            console.error('Error in quick analysis:', error);
            return {
                success: false,
                data: null,
                model_used: 'error',
                cost_estimate: '$0.00',
                processing_time: Date.now() - startTime
            };
        }
    });
}
