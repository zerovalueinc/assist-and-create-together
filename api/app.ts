import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req, res) {
  const { method, url, headers, body, query } = req;
  // TODO: Centralize auth logic here if needed
  // const userId = headers['x-user-id'] || body?.user_id || query?.user_id;

  console.log('=== API Request Debug ===');
  console.log('Method:', method);
  console.log('URL:', url);
  console.log('URL startsWith /api/company-analyze:', url.startsWith('/api/company-analyze'));

  try {
    // EMAIL ENDPOINTS
    if (url.startsWith('/api/email')) {
      // Get user from auth header
      const authHeader = headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header required' });
      }
      
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (authError || !user) {
          return res.status(401).json({ error: 'Invalid token' });
        }
        
        // Generate email template for a lead
        if (method === 'POST' && url.match(/\/generate\/(.+)$/)) {
          const leadId = url.match(/\/generate\/(.+)$/)[1];
          const { tone = 'professional', style = 'outbound', useClaude = true } = body;
          
          // Get the lead from Supabase
          const { data: lead, error: leadError } = await supabase
            .from('leads')
            .select('*')
            .eq('id', leadId)
            .eq('user_id', user.id)
            .single();
          
          if (leadError || !lead) {
            return res.status(404).json({ error: 'Lead not found' });
          }
          
          // Get the ICP for context
          const { data: icp, error: icpError } = await supabase
            .from('icps')
            .select('*')
            .eq('id', lead.icp_id)
            .eq('user_id', user.id)
            .single();
          
          if (icpError || !icp) {
            return res.status(404).json({ error: 'ICP not found' });
          }
          
          // Get enrichment data if available
          const { data: enrichment } = await supabase
            .from('enriched_leads')
            .select('*')
            .eq('lead_id', leadId)
            .eq('user_id', user.id)
            .single();
          
          // Generate email template (placeholder - would integrate with Claude agent)
          const emailTemplate = {
            subject: `Reaching out about ${lead.company_name}`,
            body: `Hi ${lead.first_name},\n\nI hope this message finds you well. I came across ${lead.company_name} and thought you might be interested in our solution.\n\nBest regards,\nYour Name`
          };
          
          // Store email template
          const { data: template, error: templateError } = await supabase
            .from('email_templates')
            .insert({
              lead_id: leadId,
              subject: emailTemplate.subject,
              body: emailTemplate.body,
              tone,
              user_id: user.id
            })
            .select()
            .single();
          
          if (templateError) {
            console.error('Template save error:', templateError);
            return res.status(500).json({ error: 'Failed to save email template' });
          }
          
          return res.json({
            success: true,
            emailTemplate: template,
            generationMethod: useClaude ? 'claude' : 'template'
          });
        }
        
        // Upload campaign to Instantly
        if (method === 'POST' && url.match(/\/upload\/(.+)$/)) {
          const templateId = url.match(/\/upload\/(.+)$/)[1];
          const { campaignName, sequenceSteps = 1 } = body;
          
          // Get the email template
          const { data: template, error: templateError } = await supabase
            .from('email_templates')
            .select('*')
            .eq('id', templateId)
            .eq('user_id', user.id)
            .single();
          
          if (templateError || !template) {
            return res.status(404).json({ error: 'Email template not found' });
          }
          
          // Get the lead for context
          const { data: lead, error: leadError } = await supabase
            .from('leads')
            .select('*')
            .eq('id', template.lead_id)
            .eq('user_id', user.id)
            .single();
          
          if (leadError || !lead) {
            return res.status(404).json({ error: 'Lead not found' });
          }
          
          // Placeholder for Instantly upload (would integrate with email agent)
          const uploadResult = {
            campaignId: `campaign_${Date.now()}`,
            status: 'uploaded',
            name: campaignName || `Campaign for ${lead.company_name}`
          };
          
          return res.json({
            success: true,
            uploadResult,
            campaignName: uploadResult.name
          });
        }
        
        // Bulk email generation
        if (method === 'POST' && url.includes('/bulk-generate')) {
          const { leadIds, tone = 'professional', style = 'outbound', useClaude = false } = body;
          
          if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
            return res.status(400).json({ error: 'Lead IDs array is required' });
          }
          
          const results: Array<{
            leadId: any;
            success?: boolean;
            template?: any;
            error?: string;
          }> = [];
          let successCount = 0;
          let errorCount = 0;
          
          for (const leadId of leadIds) {
            try {
              // Get lead data
              const { data: lead, error: leadError } = await supabase
                .from('leads')
                .select('*')
                .eq('id', leadId)
                .eq('user_id', user.id)
                .single();
              
              if (leadError || !lead) {
                errorCount++;
                results.push({ leadId, error: 'Lead not found' });
                continue;
              }
              
              // Generate simple template (placeholder)
              const emailTemplate = {
                subject: `Reaching out about ${lead.company_name}`,
                body: `Hi ${lead.first_name},\n\nI hope this message finds you well.\n\nBest regards,\nYour Name`
              };
              
              // Store template
              const { data: template, error: templateError } = await supabase
                .from('email_templates')
                .insert({
                  lead_id: leadId,
                  subject: emailTemplate.subject,
                  body: emailTemplate.body,
                  tone,
                  user_id: user.id
                })
                .select()
                .single();
              
              if (templateError) {
                errorCount++;
                results.push({ leadId, error: 'Failed to save template' });
                continue;
              }
              
              results.push({ leadId, success: true, template });
              successCount++;
              
            } catch (error) {
              errorCount++;
              results.push({ leadId, error: error.message });
            }
          }
          
          return res.json({
            success: true,
            results,
            stats: {
              total: leadIds.length,
              success: successCount,
              errors: errorCount
            }
          });
        }
        
        // Get email templates for a lead
        if (method === 'GET' && url.match(/\/api\/email\/([^\/]+)$/)) {
          const leadId = url.match(/\/api\/email\/([^\/]+)$/)[1];
          const { tone, limit = 10 } = query;
          
          let queryBuilder = supabase
            .from('email_templates')
            .select('*')
            .eq('lead_id', leadId)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(parseInt(limit));
          
          if (tone) {
            queryBuilder = queryBuilder.eq('tone', tone);
          }
          
          const { data: templates, error: templatesError } = await queryBuilder;
          
          if (templatesError) {
            console.error('Templates fetch error:', templatesError);
            return res.status(500).json({ error: 'Failed to fetch email templates' });
          }
          
          return res.json({ templates });
        }
        
        // Update email template
        if (method === 'PUT' && url.match(/\/api\/email\/([^\/]+)$/)) {
          const templateId = url.match(/\/api\/email\/([^\/]+)$/)[1];
          const { subject, body: emailBody, tone } = body;
          
          const { data: template, error: updateError } = await supabase
            .from('email_templates')
            .update({ subject, body: emailBody, tone, updated_at: new Date().toISOString() })
            .eq('id', templateId)
            .eq('user_id', user.id)
            .select()
            .single();
          
          if (updateError) {
            console.error('Template update error:', updateError);
            return res.status(500).json({ error: 'Failed to update email template' });
          }
          
          return res.json({ template });
        }
        
        // Delete email template
        if (method === 'DELETE' && url.match(/\/api\/email\/([^\/]+)$/)) {
          const templateId = url.match(/\/api\/email\/([^\/]+)$/)[1];
          
          const { error: deleteError } = await supabase
            .from('email_templates')
            .delete()
            .eq('id', templateId)
            .eq('user_id', user.id);
          
          if (deleteError) {
            console.error('Template delete error:', deleteError);
            return res.status(500).json({ error: 'Failed to delete email template' });
          }
          
          return res.json({ success: true });
        }
        
        return res.status(404).json({ error: 'Email endpoint not found' });
        
      } catch (err) {
        console.error('Email API error:', err);
        return res.status(500).json({ error: 'Email API failed' });
      }
    }
    // ENRICH ENDPOINTS
    if (url.startsWith('/api/enrich')) {
      // Get user from auth header
      const authHeader = headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header required' });
      }
      
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (authError || !user) {
          return res.status(401).json({ error: 'Invalid token' });
        }
        
        // Enrich lead
        if (method === 'POST' && url.includes('/lead')) {
          const { leadId } = body;
          
          if (!leadId) {
            return res.status(400).json({ error: 'Lead ID is required' });
          }
          
          // Get lead from database
          const { data: lead, error: leadError } = await supabase
            .from('leads')
            .select('*')
            .eq('id', leadId)
            .eq('user_id', user.id)
            .single();
          
          if (leadError || !lead) {
            return res.status(404).json({ error: 'Lead not found' });
          }
          
          // Mock enrichment data (placeholder - would integrate with enrichment agent)
          const enrichmentData = {
            lead_id: leadId,
            user_id: user.id,
            company_size: '11-50',
            industry: 'Technology',
            funding_stage: 'Series A',
            technologies: ['React', 'Node.js', 'PostgreSQL'],
            social_profiles: {
              linkedin: lead.linkedin_url,
              twitter: null,
              github: null
            },
            contact_info: {
              phone: '+1-555-0123',
              location: 'San Francisco, CA'
            },
            company_info: {
              founded_year: 2020,
              revenue: '$1M-$10M',
              employees: 25
            }
          };
          
          // Save enrichment data
          const { data: enrichment, error: enrichmentError } = await supabase
            .from('enriched_leads')
            .upsert(enrichmentData)
            .select()
            .single();
          
          if (enrichmentError) {
            console.error('Enrichment save error:', enrichmentError);
            return res.status(500).json({ error: 'Failed to save enrichment data' });
          }
          
          return res.json({
            success: true,
            enrichment
          });
        }
        
        // Bulk enrich leads
        if (method === 'POST' && url.includes('/bulk')) {
          const { leadIds } = body;
          
          if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
            return res.status(400).json({ error: 'Lead IDs array is required' });
          }
          
          const results: Array<{
            leadId: any;
            success?: boolean;
            enrichment?: any;
            error?: string;
          }> = [];
          let successCount = 0;
          let errorCount = 0;
          
          for (const leadId of leadIds) {
            try {
              // Get lead
              const { data: lead, error: leadError } = await supabase
                .from('leads')
                .select('*')
                .eq('id', leadId)
                .eq('user_id', user.id)
                .single();
              
              if (leadError || !lead) {
                errorCount++;
                results.push({ leadId, error: 'Lead not found' });
                continue;
              }
              
              // Mock enrichment data
              const enrichmentData = {
                lead_id: leadId,
                user_id: user.id,
                company_size: '11-50',
                industry: 'Technology',
                funding_stage: 'Series A',
                technologies: ['React', 'Node.js'],
                social_profiles: { linkedin: lead.linkedin_url },
                contact_info: { phone: '+1-555-0123', location: 'San Francisco, CA' },
                company_info: { founded_year: 2020, revenue: '$1M-$10M', employees: 25 }
              };
              
              // Save enrichment
              const { data: enrichment, error: enrichmentError } = await supabase
                .from('enriched_leads')
                .upsert(enrichmentData)
                .select()
                .single();
              
              if (enrichmentError) {
                errorCount++;
                results.push({ leadId, error: 'Failed to save enrichment' });
                continue;
              }
              
              results.push({ leadId, success: true, enrichment });
              successCount++;
              
            } catch (error) {
              errorCount++;
              results.push({ leadId, error: error.message });
            }
          }
          
          return res.json({
            success: true,
            results,
            stats: {
              total: leadIds.length,
              success: successCount,
              errors: errorCount
            }
          });
        }
        
        return res.status(404).json({ error: 'Enrich endpoint not found' });
        
      } catch (err) {
        console.error('Enrich API error:', err);
        return res.status(500).json({ error: 'Enrich API failed' });
      }
    }
    // ICP ENDPOINTS
    if (url.startsWith('/api/icp')) {
      // Get user from auth header
      const authHeader = headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header required' });
      }
      
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (authError || !user) {
          return res.status(401).json({ error: 'Invalid token' });
        }
        
        // Generate comprehensive IBP
        if (method === 'POST' && url.includes('/comprehensive')) {
          const { url: companyUrl } = body;
          if (!companyUrl) {
            return res.status(400).json({ error: 'Company URL is required' });
          }
          
          // Check cache first
          const { data: cachedResult } = await supabase
            .from('cache')
            .select('*')
            .eq('url', companyUrl)
            .eq('is_comprehensive', true)
            .eq('user_id', user.id)
            .single();
          
          if (cachedResult && new Date(cachedResult.expires_at) > new Date()) {
            // Return cached result
            const { data: report } = await supabase
              .from('company_analysis_reports')
              .select('*')
              .eq('id', cachedResult.report_id)
              .eq('user_id', user.id)
              .single();
            
            return res.json({
              success: true,
              report: {
                ...report,
                icp_profile: report?.icp_profile || {},
                comprehensive_data: cachedResult.comprehensive_data,
                isCached: true,
                isExpired: false,
                cachedAt: cachedResult.created_at,
                expiresAt: cachedResult.expires_at
              }
            });
          }
          
          // Generate new comprehensive analysis (placeholder)
          const comprehensiveData = {
            company_name: companyUrl,
            company_profile: { industry: "Technology", size: "11-50 employees" },
            decision_makers: ["CTO", "VP Engineering"],
            pain_points: ["Efficiency", "Scalability"],
            technologies: ["Web Technologies"],
            location: "United States",
            market_trends: "Growing demand for automation",
            competitive_landscape: "Competitive market with focus on innovation",
            go_to_market_strategy: "Direct sales with content marketing",
            research_summary: "Technology company focused on efficiency solutions",
            icp_profile: {
              target_industries: ["Technology"],
              target_company_size: { revenue_range: "Unknown", employee_range: "11-50" },
              pain_points_and_triggers: ["Efficiency", "Scalability"],
              buyer_personas: [{ title: "CTO" }],
              recommended_apollo_search_params: {
                technologies: ["Web Technologies"],
                titles: ["CTO", "VP Engineering"],
                locations: ["United States"]
              },
              messaging_angles: ["Business process optimization"]
            }
          };
          
          // Save to company_analysis_reports with embedded ICP
          const { data: report, error: reportError } = await supabase
            .from('company_analysis_reports')
            .insert({
              user_id: user.id,
              company_name: comprehensiveData.company_name || companyUrl,
              company_url: companyUrl,
              company_profile: comprehensiveData.company_profile || {},
              decision_makers: comprehensiveData.decision_makers || [],
              pain_points: comprehensiveData.pain_points || [],
              technologies: comprehensiveData.technologies || [],
              location: comprehensiveData.location || '',
              market_trends: comprehensiveData.market_trends || '',
              competitive_landscape: comprehensiveData.competitive_landscape || '',
              go_to_market_strategy: comprehensiveData.go_to_market_strategy || '',
              research_summary: comprehensiveData.research_summary || '',
              icp_profile: comprehensiveData.icp_profile || {},
              llm_output: JSON.stringify(comprehensiveData)
            })
            .select()
            .single();
          
          if (reportError) {
            console.error('Report save error:', reportError);
            return res.status(500).json({ error: 'Failed to save report' });
          }
          
          // Save to cache
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
          
          await supabase
            .from('cache')
            .insert({
              url: companyUrl,
              is_comprehensive: true,
              comprehensive_data: comprehensiveData,
              report_id: report.id,
              user_id: user.id,
              expires_at: expiresAt.toISOString()
            });
          
          return res.json({
            success: true,
            report: {
              ...report,
              icp_profile: report.icp_profile || {},
              comprehensive_data: comprehensiveData,
              isCached: false,
              isExpired: false
            }
          });
        }
        
        // Generate basic company analysis
        if (method === 'POST' && url.includes('/generate')) {
          const { url: companyUrl, comprehensive = false } = body;
          if (!companyUrl) {
            return res.status(400).json({ error: 'URL is required' });
          }
          
          // Check cache
          const cacheKey = comprehensive ? `${companyUrl} (comprehensive)` : `${companyUrl} (basic)`;
          const { data: cachedResult } = await supabase
            .from('cache')
            .select('*')
            .eq('url', cacheKey)
            .eq('is_comprehensive', comprehensive)
            .eq('user_id', user.id)
            .single();
          
          if (cachedResult && new Date(cachedResult.expires_at) > new Date()) {
            return res.json({
              success: true,
              report: cachedResult,
              isCached: true,
              isExpired: false
            });
          }
          
          // Generate new analysis (placeholder)
          const result = {
            company_name: companyUrl,
            company_profile: { industry: "Technology", size: "11-50 employees" },
            decision_makers: ["CTO", "VP Engineering"],
            pain_points: ["Efficiency", "Scalability"],
            technologies: ["Web Technologies"],
            location: "United States",
            market_trends: "Growing demand for automation",
            competitive_landscape: "Competitive market with focus on innovation",
            go_to_market_strategy: "Direct sales with content marketing",
            research_summary: "Technology company focused on efficiency solutions",
            icp_profile: {
              target_industries: ["Technology"],
              target_company_size: { revenue_range: "Unknown", employee_range: "11-50" },
              pain_points_and_triggers: ["Efficiency", "Scalability"],
              buyer_personas: [{ title: "CTO" }],
              recommended_apollo_search_params: {
                technologies: ["Web Technologies"],
                titles: ["CTO", "VP Engineering"],
                locations: ["United States"]
              },
              messaging_angles: ["Business process optimization"]
            }
          };
          
          // Save to company_analysis_reports
          const { data: report, error: reportError } = await supabase
            .from('company_analysis_reports')
            .insert({
              user_id: user.id,
              company_name: result.company_name,
              company_url: companyUrl,
              company_profile: result.company_profile,
              decision_makers: result.decision_makers,
              pain_points: result.pain_points,
              technologies: result.technologies,
              location: result.location,
              market_trends: result.market_trends,
              competitive_landscape: result.competitive_landscape,
              go_to_market_strategy: result.go_to_market_strategy,
              research_summary: result.research_summary,
              icp_profile: result.icp_profile,
              llm_output: JSON.stringify(result)
            })
            .select()
            .single();
          
          if (reportError) {
            console.error('Report save error:', reportError);
            return res.status(500).json({ error: 'Failed to save report' });
          }
          
          // Save to cache
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30);
          
          await supabase
            .from('cache')
            .insert({
              url: cacheKey,
              is_comprehensive: comprehensive,
              comprehensive_data: result,
              report_id: report.id,
              user_id: user.id,
              expires_at: expiresAt.toISOString()
            });
          
          return res.json({
            success: true,
            report: {
              ...report,
              icp_profile: report.icp_profile || {},
              isCached: false,
              isExpired: false
            }
          });
        }
        
        // Get all company analysis reports
        if (method === 'GET' && url === '/api/company-analysis') {
          const { data: reports, error: reportsError } = await supabase
            .from('company_analysis_reports')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          if (reportsError) {
            console.error('Reports fetch error:', reportsError);
            return res.status(500).json({ error: 'Failed to fetch reports' });
          }
          
          const formattedReports = reports.map(report => ({
            ...report,
            icp_profile: report.icp_profile || {}
          }));
          
          return res.json({ success: true, reports: formattedReports });
        }
        
        // Get specific company analysis report by ID
        if (method === 'GET' && url.match(/\/api\/company-analysis\/([^\/]+)$/)) {
          const reportId = url.match(/\/api\/company-analysis\/([^\/]+)$/)[1];
          
          const { data: report, error: reportError } = await supabase
            .from('company_analysis_reports')
            .select('*')
            .eq('id', reportId)
            .eq('user_id', user.id)
            .single();
          
          if (reportError || !report) {
            return res.status(404).json({ error: 'Report not found' });
          }
          
          const formattedReport = {
            ...report,
            icp_profile: report.icp_profile || {}
          };
          
          return res.json({ success: true, report: formattedReport });
        }
        
        // Save report
        if (method === 'POST' && url.includes('/save-report')) {
          const { companyName, url: companyUrl, reportId } = body;
          if (!companyName || !companyUrl || !reportId) {
            return res.status(400).json({ error: 'companyName, url, and reportId are required' });
          }
          
          const { error: reportError } = await supabase
            .from('saved_reports')
            .insert({
              user_id: user.id,
              company_name: companyName,
              url: companyUrl,
              report_id: reportId
            });
          
          if (reportError) {
            console.error('Report save error:', reportError);
            return res.status(500).json({ error: 'Failed to save report' });
          }
          
          return res.json({ success: true });
        }
        
        return res.status(404).json({ error: 'ICP endpoint not found' });
        
      } catch (err) {
        console.error('ICP API error:', err);
        return res.status(500).json({ error: 'ICP API failed' });
      }
    }
    // LEADS ENDPOINTS
    if (url.startsWith('/api/leads')) {
      // Get user from auth header
      const authHeader = headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header required' });
      }
      
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (authError || !user) {
          return res.status(401).json({ error: 'Invalid token' });
        }
        
        // Search leads
        if (method === 'POST' && url.includes('/search')) {
          const { icpId, limit = 15, forceRefresh = false } = body;
          
          if (!icpId) {
            return res.status(400).json({ error: 'ICP ID is required' });
          }
          
          // Get ICP from database
          const { data: icp, error: icpError } = await supabase
            .from('icps')
            .select('*')
            .eq('id', icpId)
            .eq('user_id', user.id)
            .single();
          
          if (icpError || !icp) {
            return res.status(404).json({ error: 'ICP not found' });
          }
          
          // Parse ICP data
          const icpData = {
            ...icp,
            painPoints: icp.pain_points ? JSON.parse(icp.pain_points) : [],
            technologies: icp.technologies ? JSON.parse(icp.technologies) : [],
            companySize: icp.company_size ? JSON.parse(icp.company_size) : [],
            jobTitles: icp.job_titles ? JSON.parse(icp.job_titles) : [],
            locationCountry: icp.location_country ? JSON.parse(icp.location_country) : [],
            industries: icp.industries ? JSON.parse(icp.industries) : []
          };
          
          // Prepare search parameters (placeholder - would integrate with Apollo agent)
          const queryParams = {
            organization_num_employees: icpData.companySize || [],
            title: icpData.jobTitles || [],
            country: icpData.locationCountry || [],
            industry: icpData.industries || [],
          };
          
          // Mock Apollo search results (placeholder)
          const mockLeads = [
            {
              firstName: 'John',
              lastName: 'Doe',
              fullName: 'John Doe',
              title: 'CTO',
              email: 'john.doe@example.com',
              linkedInUrl: 'https://linkedin.com/in/johndoe',
              companyName: 'Tech Corp',
              companyWebsite: 'https://techcorp.com',
              confidenceScore: 0.8
            },
            {
              firstName: 'Jane',
              lastName: 'Smith',
              fullName: 'Jane Smith',
              title: 'VP Engineering',
              email: 'jane.smith@example.com',
              linkedInUrl: 'https://linkedin.com/in/janesmith',
              companyName: 'Tech Corp',
              companyWebsite: 'https://techcorp.com',
              confidenceScore: 0.7
            }
          ].slice(0, limit);
          
          // Store leads in database
          const storedLeads: any[] = [];
          for (const lead of mockLeads) {
            // Check if lead already exists
            const { data: existingLead } = await supabase
              .from('leads')
              .select('id')
              .eq('email', lead.email)
              .eq('icp_id', icpId)
              .eq('user_id', user.id)
              .single();
            
            if (existingLead && !forceRefresh) {
              continue; // Skip duplicate
            }
            
            // Store lead
            const { data: storedLead, error: leadError } = await supabase
              .from('leads')
              .insert({
                first_name: lead.firstName,
                last_name: lead.lastName,
                full_name: lead.fullName,
                title: lead.title,
                email: lead.email,
                linkedin_url: lead.linkedInUrl,
                company_name: lead.companyName,
                company_website: lead.companyWebsite,
                confidence_score: lead.confidenceScore,
                icp_id: icpId,
                user_id: user.id
              })
              .select()
              .single();
            
            if (!leadError) {
              storedLeads.push(storedLead);
            }
          }
          
          return res.json({
            success: true,
            leads: storedLeads,
            count: storedLeads.length,
            searchParams: queryParams
          });
        }
        
        // Get leads with pagination and filtering
        if (method === 'GET' && url === '/api/leads') {
          const { 
            icpId, 
            page = 1, 
            limit = 20, 
            search, 
            company,
            title,
            sortBy = 'created_at',
            sortOrder = 'DESC'
          } = query;
          
          let queryBuilder = supabase
            .from('leads')
            .select('*')
            .eq('user_id', user.id);
          
          if (icpId) {
            queryBuilder = queryBuilder.eq('icp_id', icpId);
          }
          
          if (search) {
            queryBuilder = queryBuilder.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%`);
          }
          
          if (company) {
            queryBuilder = queryBuilder.ilike('company_name', `%${company}%`);
          }
          
          if (title) {
            queryBuilder = queryBuilder.ilike('title', `%${title}%`);
          }
          
          // Add sorting
          const validSortFields = ['created_at', 'full_name', 'company_name', 'title', 'confidence_score'];
          const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'created_at';
          const order = sortOrder === 'ASC' ? 'asc' : 'desc';
          
          queryBuilder = queryBuilder.order(sortField, { ascending: order === 'asc' });
          
          // Add pagination
          const offset = (Number(page) - 1) * Number(limit);
          queryBuilder = queryBuilder.range(offset, offset + Number(limit) - 1);
          
          const { data: leads, error: leadsError, count } = await queryBuilder;
          
          if (leadsError) {
            console.error('Leads fetch error:', leadsError);
            return res.status(500).json({ error: 'Failed to fetch leads' });
          }
          
          return res.json({
            success: true,
            leads,
            pagination: {
              page: Number(page),
              limit: Number(limit),
              total: count || leads.length,
              pages: Math.ceil((count || leads.length) / Number(limit))
            },
            filters: {
              icpId,
              search,
              company,
              title,
              sortBy,
              sortOrder
            }
          });
        }
        
        // Get specific lead by ID
        if (method === 'GET' && url.match(/\/api\/leads\/([^\/]+)$/)) {
          const leadId = url.match(/\/api\/leads\/([^\/]+)$/)[1];
          
          const { data: lead, error: leadError } = await supabase
            .from('leads')
            .select('*')
            .eq('id', leadId)
            .eq('user_id', user.id)
            .single();
          
          if (leadError || !lead) {
            return res.status(404).json({ error: 'Lead not found' });
          }
          
          return res.json({ success: true, lead });
        }
        
        // Update lead
        if (method === 'PUT' && url.match(/\/api\/leads\/([^\/]+)$/)) {
          const leadId = url.match(/\/api\/leads\/([^\/]+)$/)[1];
          const { firstName, lastName, title, email, companyName, companyWebsite } = body;
          
          const { data: lead, error: updateError } = await supabase
            .from('leads')
            .update({
              first_name: firstName,
              last_name: lastName,
              full_name: `${firstName} ${lastName}`,
              title,
              email,
              company_name: companyName,
              company_website: companyWebsite,
              updated_at: new Date().toISOString()
            })
            .eq('id', leadId)
            .eq('user_id', user.id)
            .select()
            .single();
          
          if (updateError) {
            console.error('Lead update error:', updateError);
            return res.status(500).json({ error: 'Failed to update lead' });
          }
          
          return res.json({ success: true, lead });
        }
        
        // Delete lead
        if (method === 'DELETE' && url.match(/\/api\/leads\/([^\/]+)$/)) {
          const leadId = url.match(/\/api\/leads\/([^\/]+)$/)[1];
          
          const { error: deleteError } = await supabase
            .from('leads')
            .delete()
            .eq('id', leadId)
            .eq('user_id', user.id);
          
          if (deleteError) {
            console.error('Lead delete error:', deleteError);
            return res.status(500).json({ error: 'Failed to delete lead' });
          }
          
          return res.json({ success: true });
        }
        
        return res.status(404).json({ error: 'Leads endpoint not found' });
        
      } catch (err) {
        console.error('Leads API error:', err);
        return res.status(500).json({ error: 'Leads API failed' });
      }
    }
    // SALES-INTELLIGENCE ENDPOINTS
    if (url.startsWith('/api/sales-intelligence')) {
      // Get user from auth header
      const authHeader = headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header required' });
      }
      
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (authError || !user) {
          return res.status(401).json({ error: 'Invalid token' });
        }
        
        // Generate sales intelligence report
        if (method === 'POST' && url.includes('/generate')) {
          const { websiteUrl } = body;
          
          if (!websiteUrl) {
            return res.status(400).json({ error: 'Website URL is required' });
          }
          
          // Check if report already exists
          const { data: existingReport } = await supabase
            .from('sales_intelligence_reports')
            .select('*')
            .eq('user_id', user.id)
            .eq('website_url', websiteUrl)
            .single();
          
          if (existingReport) {
            return res.json({
              success: true,
              data: existingReport,
              isCached: true,
              message: 'Report retrieved from database'
            });
          }
          
          // Generate new report (placeholder - would integrate with sales intelligence agent)
          const reportData = {
            companyOverview: {
              companyName: 'Tech Corp',
              industry: 'Technology',
              foundedYear: 2020,
              employeeCount: '11-50',
              revenue: '$1M-$10M'
            },
            marketAnalysis: {
              marketSize: 'Large',
              growthRate: 'High',
              competition: 'Moderate'
            },
            technologyStack: ['React', 'Node.js', 'PostgreSQL'],
            buyingTriggers: ['Growth', 'Efficiency', 'Cost Reduction'],
            decisionMakers: ['CTO', 'VP Engineering', 'Head of Product'],
            icpFitScore: 0.85,
            ibpMaturityScore: 0.75,
            salesTriggerScore: 0.80,
            totalScore: 0.80,
            priority: 'high'
          };
          
          // Save to database
          const { data: report, error: reportError } = await supabase
            .from('sales_intelligence_reports')
            .insert({
              user_id: user.id,
              company_name: reportData.companyOverview.companyName,
              website_url: websiteUrl,
              report_data: reportData,
              icp_fit_score: reportData.icpFitScore,
              ibp_maturity_score: reportData.ibpMaturityScore,
              sales_trigger_score: reportData.salesTriggerScore,
              total_score: reportData.totalScore,
              priority: reportData.priority
            })
            .select()
            .single();
          
          if (reportError) {
            console.error('Report save error:', reportError);
            return res.status(500).json({ error: 'Failed to save report' });
          }
          
          return res.json({
            success: true,
            data: report,
            isCached: false,
            message: 'Report generated successfully'
          });
        }
        
        // Get report by URL
        if (method === 'GET' && url.match(/\/report\/(.+)$/)) {
          const websiteUrl = decodeURIComponent(url.match(/\/report\/(.+)$/)[1]);
          
          const { data: report, error: reportError } = await supabase
            .from('sales_intelligence_reports')
            .select('*')
            .eq('user_id', user.id)
            .eq('website_url', websiteUrl)
            .single();
          
          if (reportError || !report) {
            return res.status(404).json({ error: 'Sales Intelligence Report not found' });
          }
          
          return res.json({
            success: true,
            data: report
          });
        }
        
        // Get top reports
        if (method === 'GET' && url.includes('/top')) {
          const limit = parseInt(query.limit as string) || 10;
          
          const { data: reports, error: reportsError } = await supabase
            .from('sales_intelligence_reports')
            .select('*')
            .eq('user_id', user.id)
            .order('total_score', { ascending: false })
            .limit(limit);
          
          if (reportsError) {
            console.error('Reports fetch error:', reportsError);
            return res.status(500).json({ error: 'Failed to fetch reports' });
          }
          
          return res.json({
            success: true,
            data: reports,
            count: reports.length
          });
        }
        
        // Update Apollo matches
        if (method === 'POST' && url.includes('/apollo-matches')) {
          const { 
            reportId, 
            apolloCompanyId, 
            companyName, 
            matchedContacts, 
            icpFitScore, 
            intentScore 
          } = body;
          
          if (!reportId || !apolloCompanyId || !companyName) {
            return res.status(400).json({ error: 'Report ID, Apollo Company ID, and Company Name are required' });
          }
          
          const { error: updateError } = await supabase
            .from('sales_intelligence_reports')
            .update({
              apollo_company_id: apolloCompanyId,
              matched_contacts: matchedContacts || [],
              icp_fit_score: icpFitScore || 0,
              intent_score: intentScore || 0,
              updated_at: new Date().toISOString()
            })
            .eq('id', reportId)
            .eq('user_id', user.id);
          
          if (updateError) {
            console.error('Update error:', updateError);
            return res.status(500).json({ error: 'Failed to update Apollo matches' });
          }
          
          return res.json({
            success: true,
            message: 'Apollo lead matches updated successfully'
          });
        }
        
        // Get analytics
        if (method === 'GET' && url.includes('/analytics')) {
          const { data: reports, error: reportsError } = await supabase
            .from('sales_intelligence_reports')
            .select('*')
            .eq('user_id', user.id)
            .order('total_score', { ascending: false })
            .limit(20);
          
          if (reportsError) {
            console.error('Reports fetch error:', reportsError);
            return res.status(500).json({ error: 'Failed to fetch reports' });
          }
          
          // Calculate analytics
          const analytics = {
            totalReports: reports.length,
            averageICPFitScore: reports.length > 0 ? reports.reduce((sum, report) => sum + (report.icp_fit_score || 0), 0) / reports.length : 0,
            averageIBPMaturityScore: reports.length > 0 ? reports.reduce((sum, report) => sum + (report.ibp_maturity_score || 0), 0) / reports.length : 0,
            averageSalesTriggerScore: reports.length > 0 ? reports.reduce((sum, report) => sum + (report.sales_trigger_score || 0), 0) / reports.length : 0,
            averageTotalScore: reports.length > 0 ? reports.reduce((sum, report) => sum + (report.total_score || 0), 0) / reports.length : 0,
            priorityBreakdown: {
              high: reports.filter(r => r.priority === 'high').length,
              medium: reports.filter(r => r.priority === 'medium').length,
              low: reports.filter(r => r.priority === 'low').length
            }
          };
          
          return res.json({
            success: true,
            data: analytics
          });
        }
        
        return res.status(404).json({ error: 'Sales Intelligence endpoint not found' });
        
      } catch (err) {
        console.error('Sales Intelligence API error:', err);
        return res.status(500).json({ error: 'Sales Intelligence API failed' });
      }
    }
    // UPLOAD ENDPOINTS
    if (url.startsWith('/api/upload')) {
      // Get user from auth header
      const authHeader = headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header required' });
      }
      
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (authError || !user) {
          return res.status(401).json({ error: 'Invalid token' });
        }
        
        // Upload leads to Instantly
        if (method === 'POST' && url.includes('/instantly')) {
          const { icpId, listName } = body;
          
          if (!icpId) {
            return res.status(400).json({ error: 'ICP ID is required' });
          }
          
          // Get all leads for this ICP and user
          const { data: leads, error: leadsError } = await supabase
            .from('leads')
            .select('*')
            .eq('icp_id', icpId)
            .eq('user_id', user.id);
          
          if (leadsError) {
            console.error('Leads fetch error:', leadsError);
            return res.status(500).json({ error: 'Failed to fetch leads' });
          }
          
          if (leads.length === 0) {
            return res.status(400).json({ error: 'No leads found for this ICP' });
          }
          
          // Get enrichment data for leads
          const enrichedLeads: any[] = [];
          for (const lead of leads) {
            const { data: enrichment } = await supabase
              .from('enriched_leads')
              .select('*')
              .eq('lead_id', lead.id)
              .single();
            
            enrichedLeads.push({
              ...lead,
              enrichment: enrichment ? {
                ...enrichment,
                interests: enrichment.interests ? JSON.parse(enrichment.interests) : []
              } : null
            });
          }
          
          // Format leads for Instantly (placeholder - would integrate with research agent)
          const instantlyLeads = enrichedLeads.map(lead => ({
            email: lead.email,
            firstName: lead.first_name,
            lastName: lead.last_name,
            jobTitle: lead.title,
            companyName: lead.company_name,
            companyWebsite: lead.company_website,
            linkedInUrl: lead.linkedin_url,
            // Add enrichment data as custom fields if available
            ...(lead.enrichment && {
              bio: lead.enrichment.bio,
              interests: lead.enrichment.interests?.join(', ') || '',
              whyTheyCare: lead.enrichment.one_sentence_why_they_care
            })
          }));
          
          // Mock upload result (placeholder - would integrate with research agent)
          const uploadResult = {
            success: true,
            uploadedCount: instantlyLeads.length,
            listName: listName || 'Default List',
            timestamp: new Date().toISOString()
          };
          
          return res.json({
            success: true,
            message: `Successfully uploaded ${instantlyLeads.length} leads to Instantly`,
            uploadResult,
            leadsCount: instantlyLeads.length
          });
        }
        
        // Get upload status
        if (method === 'GET' && url.match(/\/status\/(.+)$/)) {
          const icpId = url.match(/\/status\/(.+)$/)[1];
          
          // Get leads count for this ICP and user
          const { data: leads, error: leadsError } = await supabase
            .from('leads')
            .select('*')
            .eq('icp_id', icpId)
            .eq('user_id', user.id);
          
          if (leadsError) {
            console.error('Leads fetch error:', leadsError);
            return res.status(500).json({ error: 'Failed to fetch leads' });
          }
          
          // Get enriched leads count
          const { count: enrichedCount } = await supabase
            .from('enriched_leads')
            .select('*', { count: 'exact', head: true })
            .eq('lead_id', leads.map(l => l.id))
            .eq('user_id', user.id);
          
          // Get email templates count
          const { count: emailTemplatesCount } = await supabase
            .from('email_templates')
            .select('*', { count: 'exact', head: true })
            .eq('lead_id', leads.map(l => l.id))
            .eq('user_id', user.id);
          
          return res.json({
            success: true,
            status: {
              totalLeads: leads.length,
              enrichedLeads: enrichedCount || 0,
              emailTemplates: emailTemplatesCount || 0,
              readyForUpload: leads.length > 0
            }
          });
        }
        
        return res.status(404).json({ error: 'Upload endpoint not found' });
        
      } catch (err) {
        console.error('Upload API error:', err);
        return res.status(500).json({ error: 'Upload API failed' });
      }
    }
    // WORKFLOW ENDPOINTS
    if (url.startsWith('/api/workflow')) {
      // Get user from auth header
      const authHeader = headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header required' });
      }
      
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (authError || !user) {
          return res.status(401).json({ error: 'Invalid token' });
        }
        
        // Execute workflow
        if (method === 'POST' && url.includes('/execute')) {
          const { workflowType, parameters } = body;
          
          if (!workflowType) {
            return res.status(400).json({ error: 'Workflow type is required' });
          }
          
          // Mock workflow execution (placeholder - would integrate with workflow manager)
          const workflowResult = {
            id: `workflow_${Date.now()}`,
            type: workflowType,
            status: 'completed',
            result: {
              leadsGenerated: 15,
              emailsCreated: 12,
              enrichmentCompleted: 10,
              uploadReady: true
            },
            timestamp: new Date().toISOString()
          };
          
          // Save workflow result
          const { data: savedWorkflow, error: workflowError } = await supabase
            .from('workflows')
            .insert({
              user_id: user.id,
              workflow_type: workflowType,
              parameters: parameters || {},
              result: workflowResult.result,
              status: workflowResult.status
            })
            .select()
            .single();
          
          if (workflowError) {
            console.error('Workflow save error:', workflowError);
            return res.status(500).json({ error: 'Failed to save workflow result' });
          }
          
          return res.json({
            success: true,
            workflow: savedWorkflow
          });
        }
        
        // Get workflow status
        if (method === 'GET' && url.match(/\/status\/(.+)$/)) {
          const workflowId = url.match(/\/status\/(.+)$/)[1];
          
          const { data: workflow, error: workflowError } = await supabase
            .from('workflows')
            .select('*')
            .eq('id', workflowId)
            .eq('user_id', user.id)
            .single();
          
          if (workflowError || !workflow) {
            return res.status(404).json({ error: 'Workflow not found' });
          }
          
          return res.json({
            success: true,
            workflow
          });
        }
        
        // Get workflow history
        if (method === 'GET' && url === '/api/workflow') {
          const { data: workflows, error: workflowsError } = await supabase
            .from('workflows')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          if (workflowsError) {
            console.error('Workflows fetch error:', workflowsError);
            return res.status(500).json({ error: 'Failed to fetch workflows' });
          }
          
          return res.json({
            success: true,
            workflows
          });
        }
        
        return res.status(404).json({ error: 'Workflow endpoint not found' });
        
      } catch (err) {
        console.error('Workflow API error:', err);
        return res.status(500).json({ error: 'Workflow API failed' });
      }
    }
    // AUTH ENDPOINTS
    if (url.startsWith('/api/auth')) {
      // Google OAuth endpoint
      if (method === 'POST' && url.includes('/google')) {
        const { credential } = body;
        if (!credential) {
          return res.status(400).json({ error: 'Missing Google credential' });
        }
        
        try {
          // Verify the Google token and get user info
          const { OAuth2Client } = require('google-auth-library');
          const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
          const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
          });
          const payload = ticket.getPayload();
          
          // Sign in with Supabase using Google OAuth
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: credential,
          });
          
          if (error) {
            console.error('Supabase auth error:', error);
            return res.status(401).json({ error: 'Authentication failed' });
          }
          
          return res.json({ 
            user: data.user, 
            session: data.session 
          });
        } catch (err) {
          console.error('Google OAuth error:', err);
          return res.status(401).json({ error: 'Invalid Google credential' });
        }
      }
      
      // Get user profile
      if (method === 'GET' && url.includes('/profile')) {
        const authHeader = headers.authorization;
        if (!authHeader) {
          return res.status(401).json({ error: 'Authorization header required' });
        }
        
        try {
          const { data: { user }, error } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
          if (error || !user) {
            return res.status(401).json({ error: 'Invalid token' });
          }
          
          return res.json({ user });
        } catch (err) {
          console.error('Profile fetch error:', err);
          return res.status(500).json({ error: 'Failed to fetch profile' });
        }
      }
      
      // Update user profile
      if (method === 'PUT' && url.includes('/profile')) {
        const authHeader = headers.authorization;
        if (!authHeader) {
          return res.status(401).json({ error: 'Authorization header required' });
        }
        
        try {
          const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
          if (authError || !user) {
            return res.status(401).json({ error: 'Invalid token' });
          }
          
          const { firstName, lastName, company } = body;
          const { error: updateError } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              first_name: firstName,
              last_name: lastName,
              company,
              updated_at: new Date().toISOString()
            });
          
          if (updateError) {
            console.error('Profile update error:', updateError);
            return res.status(500).json({ error: 'Failed to update profile' });
          }
          
          return res.json({ success: true });
        } catch (err) {
          console.error('Profile update error:', err);
          return res.status(500).json({ error: 'Profile update failed' });
        }
      }
      
      // Logout
      if (method === 'POST' && url.includes('/logout')) {
        return res.json({ message: 'Logged out successfully' });
      }
      
      // Default auth response
      return res.status(404).json({ error: 'Auth endpoint not found' });
    }
    // COMPANY-ANALYZE ENDPOINT
    if (url.startsWith('/api/company-analyze')) {
      console.log('=== Company Analyze Handler Hit ===');
      console.log('Method:', method);
      if (method !== 'POST') {
        console.log('Method not allowed, returning 405');
        return res.status(405).json({ error: 'Method Not Allowed' });
      }
      const SUPABASE_EDGE_URL = 'https://hbogcsztrryrepudceww.functions.supabase.co/company-analyze';
      const userToken = headers['authorization'];
      try {
        const edgeRes = await fetch(SUPABASE_EDGE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(userToken ? { 'Authorization': userToken } : {}),
          },
          body: JSON.stringify(body),
        });
        const text = await edgeRes.text();
        let data;
        try { data = JSON.parse(text); } catch { data = text; }
        return res.status(edgeRes.status).json(data);
      } catch (err) {
        return res.status(500).json({ error: 'Proxy to Supabase Edge Function failed', details: err.message });
      }
    }
    // GTM-GENERATE ENDPOINT
    if (url.startsWith('/api/gtm-generate')) {
      if (method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
      }
      const SUPABASE_EDGE_URL = process.env.SUPABASE_EDGE_GTM_URL || 'https://hbogcsztrryrepudceww.functions.supabase.co/gtm-generate';
      const userToken = headers['authorization'];
      try {
        const edgeRes = await fetch(SUPABASE_EDGE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(userToken ? { 'Authorization': userToken } : {}),
          },
          body: JSON.stringify(body),
        });
        const text = await edgeRes.text();
        let data;
        try { data = JSON.parse(text); } catch { data = text; }
        return res.status(edgeRes.status).json(data);
      } catch (err) {
        return res.status(500).json({ error: 'Proxy to Supabase Edge Function failed', details: err.message });
      }
    }
    // ANALYTICS ENDPOINT
    if (url.startsWith('/api/analytics')) {
      // Get user from auth header
      const authHeader = headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header required' });
      }
      
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (authError || !user) {
          return res.status(401).json({ error: 'Invalid token' });
        }
        
        // Lead volume over time
        if (method === 'GET' && url.includes('/lead-volume')) {
          const { data, error } = await supabase.rpc('lead_volume_by_week_warehouse', { user_id: user.id });
          if (error) {
            console.error('Lead volume error:', error);
            return res.status(500).json({ error: error.message });
          }
          return res.json({ data });
        }
        
        // Success rate
        if (method === 'GET' && url.includes('/success-rate')) {
          const { data, error } = await supabase
            .from('crm_deals')
            .select('data')
            .eq('user_id', user.id);
          
          if (error) {
            console.error('Success rate error:', error);
            return res.status(500).json({ error: error.message });
          }
          
          const deals = (data || []).map((d: any) => d.data);
          const total = deals.length;
          const won = deals.filter((d: any) => (d.properties?.dealstage || '').toLowerCase().includes('won')).length;
          
          return res.json({ 
            total, 
            won, 
            successRate: total ? won / total : 0 
          });
        }
        
        // Playbook outcomes
        if (method === 'GET' && url.includes('/playbook-outcomes')) {
          // TODO: Implement mapping from playbooks to outcomes using warehouse data
          return res.json({ data: [] });
        }
        
        // Lead funnel
        if (method === 'GET' && url.includes('/lead-funnel')) {
          const { data, error } = await supabase
            .from('crm_deals')
            .select('data')
            .eq('user_id', user.id);
          
          if (error) {
            console.error('Lead funnel error:', error);
            return res.status(500).json({ error: error.message });
          }
          
          const deals = (data || []).map((d: any) => d.data);
          const funnel = deals.reduce((acc: any, d: any) => {
            const stage = d.properties?.dealstage || 'Unknown';
            acc[stage] = (acc[stage] || 0) + 1;
            return acc;
          }, {});
          
          return res.json({ funnel });
        }
        
        return res.status(404).json({ error: 'Analytics endpoint not found' });
        
      } catch (err) {
        console.error('Analytics API error:', err);
        return res.status(500).json({ error: 'Analytics API failed' });
      }
    }
    // INTEGRATIONS ENDPOINT
    if (url.startsWith('/api/integrations')) {
      // Get user from auth header
      const authHeader = headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header required' });
      }
      
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (authError || !user) {
          return res.status(401).json({ error: 'Invalid token' });
        }
        
        // Get HubSpot integration status
        if (method === 'GET' && url.includes('/hubspot/status')) {
          const { data: integration, error } = await supabase
            .from('integrations')
            .select('*')
            .eq('user_id', user.id)
            .eq('provider', 'hubspot')
            .maybeSingle();
          
          if (error) {
            console.error('Integration status error:', error);
            return res.status(500).json({ error: error.message });
          }
          
          return res.json({ 
            status: integration?.status || 'not_connected', 
            integration 
          });
        }
        
        // Get HubSpot OAuth URL
        if (method === 'GET' && url.includes('/hubspot/auth-url')) {
          const HUBSPOT_CLIENT_ID = process.env.HUBSPOT_CLIENT_ID;
          const HUBSPOT_REDIRECT_URI = process.env.HUBSPOT_REDIRECT_URI;
          const HUBSPOT_SCOPES = 'contacts';
          
          if (!HUBSPOT_CLIENT_ID || !HUBSPOT_REDIRECT_URI) {
            return res.status(500).json({ error: 'HubSpot configuration missing' });
          }
          
          const state = `${user.id}`;
          const url = `https://app.hubspot.com/oauth/authorize?client_id=${HUBSPOT_CLIENT_ID}&scope=${encodeURIComponent(HUBSPOT_SCOPES)}&redirect_uri=${encodeURIComponent(HUBSPOT_REDIRECT_URI)}&state=${encodeURIComponent(state)}`;
          
          return res.json({ url });
        }
        
        // Handle HubSpot OAuth callback
        if (method === 'GET' && url.includes('/hubspot/callback')) {
          const { code, state } = query;
          
          if (!code || !state) {
            return res.status(400).json({ error: 'Missing code or state' });
          }
          
          try {
            const user_id = String(state);
            if (!user_id) {
              return res.status(400).json({ error: 'Invalid state' });
            }
            
            // Exchange code for tokens (placeholder - would integrate with HubSpot API)
            const access_token = 'mock_access_token';
            const refresh_token = 'mock_refresh_token';
            const expires_in = 3600;
            
            // Upsert integration for this user
            const { error: upsertError } = await supabase
              .from('integrations')
              .upsert([{
                user_id,
                provider: 'hubspot',
                access_token,
                refresh_token,
                status: 'connected',
                updated_at: new Date().toISOString()
              }], { onConflict: 'user_id,provider' });
            
            if (upsertError) {
              console.error('Integration upsert error:', upsertError);
              return res.status(500).json({ error: upsertError.message });
            }
            
            // Trigger ingestion job (placeholder)
            console.log('HubSpot ingestion triggered for user:', user_id);
            
            return res.redirect('/workspace?integration=hubspot&status=connected');
            
          } catch (err: any) {
            console.error('HubSpot callback error:', err);
            return res.status(500).json({ error: err.message || 'Failed to exchange code' });
          }
        }
        
        // Disconnect HubSpot
        if (method === 'POST' && url.includes('/hubspot/disconnect')) {
          const { error } = await supabase
            .from('integrations')
            .delete()
            .eq('user_id', user.id)
            .eq('provider', 'hubspot');
          
          if (error) {
            console.error('Disconnect error:', error);
            return res.status(500).json({ error: error.message });
          }
          
          return res.json({ success: true });
        }
        
        // Get all HubSpot statuses
        if (method === 'GET' && url.includes('/hubspot/status/all')) {
          // Get current user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email')
            .eq('id', user.id)
            .maybeSingle();
          
          if (profileError) {
            console.error('Profile error:', profileError);
            return res.status(500).json({ error: profileError.message });
          }
          
          // Get integration for user
          const { data: integration, error: intError } = await supabase
            .from('integrations')
            .select('*')
            .eq('user_id', user.id)
            .eq('provider', 'hubspot')
            .maybeSingle();
          
          if (intError) {
            console.error('Integration error:', intError);
            return res.status(500).json({ error: intError.message });
          }
          
          if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
          }
          
          const statusList = [{
            user_id: profile.id,
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email,
            email: profile.email,
            status: integration?.status || 'not_connected',
            integration
          }];
          
          return res.json({ statuses: statusList });
        }
        
        return res.status(404).json({ error: 'Integrations endpoint not found' });
        
      } catch (err) {
        console.error('Integrations API error:', err);
        return res.status(500).json({ error: 'Integrations API failed' });
      }
    }
    // INVITATIONS ENDPOINT
    if (url.startsWith('/api/invitations')) {
      // Get user from auth header
      const authHeader = headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header required' });
      }
      
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (authError || !user) {
          return res.status(401).json({ error: 'Invalid token' });
        }
        
        // Create invitation
        if (method === 'POST' && url === '/api/invitations') {
          const { email } = body;
          
          if (!email) {
            return res.status(400).json({ error: 'Email required' });
          }
          
          const { data, error } = await supabase
            .from('invitations')
            .insert({ email, inviter_user_id: user.id })
            .select()
            .maybeSingle();
          
          if (error) {
            console.error('Invitation create error:', error);
            return res.status(500).json({ error: error.message });
          }
          
          return res.json({ invitation: data });
        }
        
        // List invitations sent by the current user
        if (method === 'GET' && url === '/api/invitations') {
          const { data, error } = await supabase
            .from('invitations')
            .select('*')
            .eq('inviter_user_id', user.id);
          
          if (error) {
            console.error('Invitations fetch error:', error);
            return res.status(500).json({ error: error.message });
          }
          
          return res.json({ invitations: data });
        }
        
        return res.status(404).json({ error: 'Invitations endpoint not found' });
        
      } catch (err) {
        console.error('Invitations API error:', err);
        return res.status(500).json({ error: 'Invitations API failed' });
      }
    }
    
    // TEAM ENDPOINT
    if (url.startsWith('/api/team')) {
      // Get user from auth header
      const authHeader = headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header required' });
      }
      
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (authError || !user) {
          return res.status(401).json({ error: 'Invalid token' });
        }
        
        // List the current user profile only (no workspace logic)
        if (method === 'GET' && url === '/api/team') {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email, role')
            .eq('id', user.id);
          
          if (error) {
            console.error('Team fetch error:', error);
            return res.status(500).json({ error: error.message });
          }
          
          return res.json({ team: data });
        }
        
        return res.status(404).json({ error: 'Team endpoint not found' });
        
      } catch (err) {
        console.error('Team API error:', err);
        return res.status(500).json({ error: 'Team API failed' });
      }
    }
    // DEFAULT: Not found
    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
} 