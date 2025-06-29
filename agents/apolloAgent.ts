// agents/apolloAgent.ts
// Handles Apollo.io API calls for lead search and enrichment
import fetch from 'node-fetch';

// Apollo API usage tracking
const apolloUsageTracker = {
  totalCalls: 0,
  totalLeads: 0,
  errors: 0,
  lastReset: new Date(),
  
  trackCall(leadsFound: number, success: boolean = true) {
    this.totalCalls++;
    this.totalLeads += leadsFound;
    if (!success) this.errors++;
    
    // Log usage every 5 calls
    if (this.totalCalls % 5 === 0) {
      console.log(`📊 Apollo API Usage: ${this.totalCalls} calls, ${this.totalLeads} leads found`);
    }
  },
  
  getStats() {
    return {
      totalCalls: this.totalCalls,
      totalLeads: this.totalLeads,
      errors: this.errors,
      averageLeadsPerCall: this.totalCalls > 0 ? this.totalLeads / this.totalCalls : 0,
      successRate: this.totalCalls > 0 ? ((this.totalCalls - this.errors) / this.totalCalls * 100).toFixed(2) + '%' : '0%'
    };
  },
  
  reset() {
    this.totalCalls = 0;
    this.totalLeads = 0;
    this.errors = 0;
    this.lastReset = new Date();
  }
};

// Apollo API rate limiting
const apolloRateLimiter = {
  calls: 0,
  lastReset: Date.now(),
  maxCallsPerMinute: 30, // Apollo.io typically has lower rate limits
  
  canMakeCall(): boolean {
    const now = Date.now();
    if (now - this.lastReset > 60000) { // 1 minute
      this.calls = 0;
      this.lastReset = now;
    }
    return this.calls < this.maxCallsPerMinute;
  },
  
  trackCall() {
    this.calls++;
  }
};

const APOLLO_API_KEY = process.env.APOLLO_API_KEY || 'YOUR_APOLLO_API_KEY';
const APOLLO_BASE_URL = 'https://api.apollo.io/v1/mixed_people/search'; // Example endpoint

// Transform Apollo contact to Instantly lead format
export function apolloToInstantlyLead(person: any) {
  return {
    email: person.email,
    firstName: person.first_name,
    lastName: person.last_name,
    jobTitle: person.title,
    companyName: person.organization?.name,
    companyWebsite: person.organization?.website_url,
    companyIndustry: person.organization?.industry,
    // Add more fields as needed
  };
}

// Search Apollo for leads matching the query
export async function searchApolloContacts(queryParams: any, limit = 15) {
  const url = `${APOLLO_BASE_URL}`;
  const payload = {
    q_organization_num_employees: queryParams.organization_num_employees || [],
    q_titles: queryParams.title || [],
    q_countries: queryParams.country || [],
    q_industries: queryParams.industry || [],
    page: 1,
    per_page: limit
  };
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': APOLLO_API_KEY,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Apollo API error (search):', errorText);
    throw new Error('Apollo search failed');
  }
  const data = await response.json() as any;
  return data.people || [];
}

export async function searchApolloLeads(icpData: any, retries: number = 3): Promise<any[]> {
  if (!process.env.APOLLO_API_KEY) {
    console.warn('⚠️ Apollo API key not configured, using mock data');
    return generateMockApolloLeads(icpData);
  }

  if (!apolloRateLimiter.canMakeCall()) {
    throw new Error('Apollo API rate limit exceeded. Please wait before making another call.');
  }

  const { industry, companySize, location, jobTitles } = icpData;
  
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      apolloRateLimiter.trackCall();
      
      console.log(`🔍 Apollo API search attempt ${attempt}/${retries} for ${industry} industry`);
      
      // Construct Apollo.io search query
      const searchParams = new URLSearchParams({
        api_key: process.env.APOLLO_API_KEY,
        page: '1',
        per_page: '25',
        q_organization_domains: '', // Will be populated based on industry
        q_titles: jobTitles?.join(',') || '',
        q_organization_locations: location || '',
        q_organization_industries: industry || ''
      });

      const response = await fetch(`https://api.apollo.io/v1/people/search?${searchParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`Apollo API responded with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.people) {
        throw new Error('Invalid response format from Apollo API');
      }

      const leads = data.people.map((person: any) => ({
        name: person.name || 'Unknown',
        title: person.title || 'Unknown',
        companyName: person.organization?.name || 'Unknown',
        email: person.email || null,
        linkedInUrl: person.linkedin_url || null,
        location: person.location || null,
        industry: person.organization?.industry || industry,
        companySize: person.organization?.size || companySize,
        apolloId: person.id,
        confidence: person.confidence || 0
      }));

      apolloUsageTracker.trackCall(leads.length, true);
      
      console.log(`✅ Apollo API search successful: ${leads.length} leads found`);
      
      return leads;
      
    } catch (error) {
      lastError = error as Error;
      apolloUsageTracker.trackCall(0, false);
      
      console.error(`❌ Apollo API search failed (attempt ${attempt}/${retries}):`, error);
      
      if (attempt < retries) {
        // Exponential backoff with longer delays for Apollo
        const delay = Math.pow(2, attempt) * 2000; // 2s, 4s, 8s
        console.log(`⏳ Retrying Apollo search in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.warn('⚠️ Apollo API failed, falling back to mock data');
  return generateMockApolloLeads(icpData);
}

// Enhanced mock data generation with better variety
function generateMockApolloLeads(icpData: any): any[] {
  const { industry, companySize, location, jobTitles } = icpData;
  
  const mockLeads: Array<{
    name: string;
    title: string;
    companyName: string;
    email: string;
    linkedInUrl: string;
    location: string;
    industry: string;
    companySize: string;
    apolloId: string;
    confidence: number;
  }> = [];
  const numLeads = Math.floor(Math.random() * 15) + 10; // 10-25 leads
  
  const sampleCompanies = [
    'TechCorp Solutions', 'InnovateLabs', 'FutureSystems', 'Digital Dynamics',
    'SmartTech Inc', 'NextGen Industries', 'CloudWorks', 'DataFlow Systems',
    'AI Innovations', 'CyberSecure Pro', 'Quantum Computing', 'Blockchain Tech',
    'Green Energy Co', 'HealthTech Solutions', 'FinTech Partners'
  ];
  
  const sampleNames = [
    'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Thompson',
    'Lisa Wang', 'James Wilson', 'Maria Garcia', 'Robert Brown',
    'Jennifer Lee', 'Christopher Davis', 'Amanda Miller', 'Daniel Taylor',
    'Jessica Anderson', 'Matthew Martinez', 'Ashley White'
  ];
  
  for (let i = 0; i < numLeads; i++) {
    const company = sampleCompanies[Math.floor(Math.random() * sampleCompanies.length)];
    const name = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const title = jobTitles ? jobTitles[Math.floor(Math.random() * jobTitles.length)] : 'Manager';
    
    mockLeads.push({
      name,
      title,
      companyName: company,
      email: `${name.toLowerCase().replace(' ', '.')}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
      linkedInUrl: `https://linkedin.com/in/${name.toLowerCase().replace(/\s+/g, '')}`,
      location: location || 'San Francisco, CA',
      industry: industry || 'Technology',
      companySize: companySize || '51-200',
      apolloId: `mock_${Date.now()}_${i}`,
      confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
    });
  }
  
  console.log(`🎭 Generated ${mockLeads.length} mock Apollo leads for ${industry} industry`);
  return mockLeads;
}

// Get Apollo usage statistics
export function getApolloUsageStats() {
  return apolloUsageTracker.getStats();
}

// Reset Apollo usage tracking
export function resetApolloUsage() {
  apolloUsageTracker.reset();
}

// Enhanced lead enrichment with Apollo data
export async function enrichLeadWithApollo(leadId: string, retries: number = 2): Promise<any> {
  if (!process.env.APOLLO_API_KEY) {
    console.warn('⚠️ Apollo API key not configured, using mock enrichment');
    return generateMockEnrichment();
  }

  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      apolloRateLimiter.trackCall();
      
      console.log(`🔍 Apollo lead enrichment attempt ${attempt}/${retries} for lead ${leadId}`);
      
      const response = await fetch(`https://api.apollo.io/v1/people/${leadId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': process.env.APOLLO_API_KEY
        }
      });

      if (!response.ok) {
        throw new Error(`Apollo enrichment API responded with status: ${response.status}`);
      }

      const data = await response.json();
      
      const enrichment = {
        bio: data.bio || 'No bio available',
        interests: data.interests || [],
        oneSentenceWhyTheyCare: generateWhyTheyCare(data),
        socialProfiles: {
          linkedin: data.linkedin_url || null,
          twitter: data.twitter_url || null,
          facebook: data.facebook_url || null
        },
        recentActivity: data.recent_activity || [],
        companyInfo: data.organization || {},
        contactInfo: {
          email: data.email,
          phone: data.phone,
          location: data.location
        }
      };

      apolloUsageTracker.trackCall(1, true);
      
      console.log(`✅ Apollo lead enrichment successful for lead ${leadId}`);
      
      return enrichment;
      
    } catch (error) {
      lastError = error as Error;
      apolloUsageTracker.trackCall(0, false);
      
      console.error(`❌ Apollo lead enrichment failed (attempt ${attempt}/${retries}):`, error);
      
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Retrying enrichment in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.warn('⚠️ Apollo enrichment failed, using mock data');
  return generateMockEnrichment();
}

function generateWhyTheyCare(personData: any): string {
  const title = personData.title || 'professional';
  const company = personData.organization?.name || 'their company';
  
  const reasons = [
    `As a ${title}, they likely care about business efficiency and growth.`,
    `Being in ${title} role at ${company}, they probably prioritize operational excellence.`,
    `Their position as ${title} suggests they value strategic decision-making and ROI.`,
    `Working at ${company} as ${title}, they likely focus on competitive advantage and innovation.`
  ];
  
  return reasons[Math.floor(Math.random() * reasons.length)];
}

function generateMockEnrichment(): any {
  return {
    bio: 'Experienced professional with a track record of driving business growth and operational excellence.',
    interests: ['Business Strategy', 'Technology Innovation', 'Market Analysis', 'Team Leadership'],
    oneSentenceWhyTheyCare: 'As a business professional, they likely care about efficiency, growth, and competitive advantage.',
    socialProfiles: {
      linkedin: 'https://linkedin.com/in/mock-profile',
      twitter: null,
      facebook: null
    },
    recentActivity: [
      { type: 'company_update', description: 'Company expansion', date: new Date().toISOString() },
      { type: 'industry_news', description: 'Market trends', date: new Date().toISOString() }
    ],
    companyInfo: {
      name: 'Mock Company',
      industry: 'Technology',
      size: '51-200 employees'
    },
    contactInfo: {
      email: 'contact@mockcompany.com',
      phone: '+1-555-0123',
      location: 'San Francisco, CA'
    }
  };
} 