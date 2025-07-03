import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req, res) {
  const { method, url, headers, body, query } = req;
  // TODO: Centralize auth logic here if needed
  // const userId = headers['x-user-id'] || body?.user_id || query?.user_id;

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
            const { data: icp } = await supabase
              .from('icps')
              .select('*')
              .eq('id', cachedResult.icp_id)
              .eq('user_id', user.id)
              .single();
            
            return res.json({
              success: true,
              ibp: {
                ...icp,
                painPoints: icp?.pain_points ? JSON.parse(icp.pain_points) : [],
                technologies: icp?.technologies ? JSON.parse(icp.technologies) : [],
                companySize: icp?.company_size ? JSON.parse(icp.company_size) : [],
                jobTitles: icp?.job_titles ? JSON.parse(icp.job_titles) : [],
                locationCountry: icp?.location_country ? JSON.parse(icp.location_country) : [],
                industries: icp?.industries ? JSON.parse(icp.industries) : [],
                comprehensiveIBP: cachedResult.comprehensive_data,
                isCached: true,
                isExpired: false,
                cachedAt: cachedResult.created_at,
                expiresAt: cachedResult.expires_at
              }
            });
          }
          
          // Generate new IBP (placeholder - would integrate with Claude agent)
          const comprehensiveIBP = {
            quantitativeMarketAnalysis: {
              marketMaturity: "Technology",
              marketSize: "Unknown"
            },
            salesIntelligence: {
              buyingTriggers: ["Efficiency", "Scalability"]
            },
            enhancedBuyerPersonas: {
              decisionMakers: [{ title: "CTO" }]
            },
            competitiveIntelligence: {
              competitiveAdvantages: ["Technology Stack"]
            },
            revenueOptimization: {
              salesCycleOptimization: ["Business optimization"]
            }
          };
          
          // Save to database
          const { data: icp, error: icpError } = await supabase
            .from('icps')
            .insert({
              industry: comprehensiveIBP.quantitativeMarketAnalysis?.marketMaturity || "Technology",
              funding: comprehensiveIBP.quantitativeMarketAnalysis?.marketSize || "Unknown",
              pain_points: JSON.stringify(comprehensiveIBP.salesIntelligence?.buyingTriggers || []),
              persona: comprehensiveIBP.enhancedBuyerPersonas?.decisionMakers?.[0]?.title || "CTO",
              technologies: JSON.stringify(comprehensiveIBP.competitiveIntelligence?.competitiveAdvantages || []),
              valid_use_case: comprehensiveIBP.revenueOptimization?.salesCycleOptimization?.[0] || "Business optimization",
              company_size: JSON.stringify([comprehensiveIBP.quantitativeMarketAnalysis?.marketSize || "11-50"]),
              job_titles: JSON.stringify(comprehensiveIBP.enhancedBuyerPersonas?.decisionMakers?.map((p: any) => p.title) || []),
              location_country: JSON.stringify(["United States"]),
              industries: JSON.stringify([comprehensiveIBP.quantitativeMarketAnalysis?.marketMaturity || "Technology"]),
              user_id: user.id
            })
            .select()
            .single();
          
          if (icpError) {
            console.error('ICP save error:', icpError);
            return res.status(500).json({ error: 'Failed to save ICP' });
          }
          
          // Save to cache
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
          
          await supabase
            .from('cache')
            .insert({
              url: companyUrl,
              is_comprehensive: true,
              comprehensive_data: comprehensiveIBP,
              icp_id: icp.id,
              user_id: user.id,
              expires_at: expiresAt.toISOString()
            });
          
          return res.json({
            success: true,
            ibp: {
              ...icp,
              painPoints: JSON.parse(icp.pain_points || '[]'),
              technologies: JSON.parse(icp.technologies || '[]'),
              companySize: JSON.parse(icp.company_size || '[]'),
              jobTitles: JSON.parse(icp.job_titles || '[]'),
              locationCountry: JSON.parse(icp.location_country || '[]'),
              industries: JSON.parse(icp.industries || '[]'),
              comprehensiveIBP: comprehensiveIBP,
              isCached: false,
              isExpired: false
            }
          });
        }
        
        // Generate basic ICP
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
              icp: cachedResult,
              isCached: true,
              isExpired: false
            });
          }
          
          // Generate new ICP (placeholder)
          const result = {
            targetIndustries: ["Technology"],
            targetCompanySize: { revenueRange: "Unknown", employeeRange: "11-50" },
            painPointsAndTriggers: ["Efficiency", "Scalability"],
            buyerPersonas: [{ title: "CTO" }],
            recommendedApolloSearchParams: {
              technologies: ["Web Technologies"],
              titles: ["CTO", "VP Engineering"],
              locations: ["United States"]
            },
            messagingAngles: ["Business process optimization"]
          };
          
          // Save to database
          const { data: icp, error: icpError } = await supabase
            .from('icps')
            .insert({
              industry: result.targetIndustries?.[0] || "Technology",
              funding: result.targetCompanySize?.revenueRange || "Unknown",
              pain_points: JSON.stringify(result.painPointsAndTriggers || ["Efficiency", "Scalability"]),
              persona: result.buyerPersonas?.[0]?.title || "CTO",
              technologies: JSON.stringify(result.recommendedApolloSearchParams?.technologies || ["Web Technologies"]),
              valid_use_case: result.messagingAngles?.[0] || "Business process optimization",
              company_size: JSON.stringify([result.targetCompanySize?.employeeRange || "11-50"]),
              job_titles: JSON.stringify(result.recommendedApolloSearchParams?.titles || ["CTO", "VP Engineering"]),
              location_country: JSON.stringify(result.recommendedApolloSearchParams?.locations || ["United States"]),
              industries: JSON.stringify(result.targetIndustries || ["Technology"]),
              user_id: user.id
            })
            .select()
            .single();
          
          if (icpError) {
            console.error('ICP save error:', icpError);
            return res.status(500).json({ error: 'Failed to save ICP' });
          }
          
          // Save to cache
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30);
          
          await supabase
            .from('cache')
            .insert({
              url: cacheKey,
              is_comprehensive: comprehensive,
              comprehensive_data: comprehensive ? result : null,
              icp_id: icp.id,
              user_id: user.id,
              expires_at: expiresAt.toISOString()
            });
          
          return res.json({
            success: true,
            icp: icp,
            isCached: false,
            isExpired: false
          });
        }
        
        // Get all ICPs or generate for specific URL
        if (method === 'GET' && url === '/api/icp') {
          const { url: companyUrl } = query;
          
          if (companyUrl) {
            // Generate ICP for specific URL
            const cacheKey = `${companyUrl} (basic)`;
            const { data: cachedResult } = await supabase
              .from('cache')
              .select('*')
              .eq('url', cacheKey)
              .eq('is_comprehensive', false)
              .eq('user_id', user.id)
              .single();
            
            if (cachedResult && new Date(cachedResult.expires_at) > new Date()) {
              return res.json({
                success: true,
                icp: cachedResult,
                isCached: true,
                isExpired: false
              });
            }
            
            // Generate new (placeholder)
            const result = {
              targetIndustries: ["Technology"],
              targetCompanySize: { revenueRange: "Unknown", employeeRange: "11-50" },
              painPointsAndTriggers: ["Efficiency", "Scalability"],
              buyerPersonas: [{ title: "CTO" }],
              recommendedApolloSearchParams: {
                technologies: ["Web Technologies"],
                titles: ["CTO", "VP Engineering"],
                locations: ["United States"]
              },
              messagingAngles: ["Business process optimization"]
            };
            
            const { data: icp, error: icpError } = await supabase
              .from('icps')
              .insert({
                industry: result.targetIndustries?.[0] || "Technology",
                funding: result.targetCompanySize?.revenueRange || "Unknown",
                pain_points: JSON.stringify(result.painPointsAndTriggers || ["Efficiency", "Scalability"]),
                persona: result.buyerPersonas?.[0]?.title || "CTO",
                technologies: JSON.stringify(result.recommendedApolloSearchParams?.technologies || ["Web Technologies"]),
                valid_use_case: result.messagingAngles?.[0] || "Business process optimization",
                company_size: JSON.stringify([result.targetCompanySize?.employeeRange || "11-50"]),
                job_titles: JSON.stringify(result.recommendedApolloSearchParams?.titles || ["CTO", "VP Engineering"]),
                location_country: JSON.stringify(result.recommendedApolloSearchParams?.locations || ["United States"]),
                industries: JSON.stringify(result.targetIndustries || ["Technology"]),
                user_id: user.id
              })
              .select()
              .single();
            
            if (icpError) {
              console.error('ICP save error:', icpError);
              return res.status(500).json({ error: 'Failed to save ICP' });
            }
            
            return res.json({
              success: true,
              icp: icp,
              isCached: false,
              isExpired: false
            });
          } else {
            // Get all ICPs for user
            const { data: icps, error: icpsError } = await supabase
              .from('icps')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false });
            
            if (icpsError) {
              console.error('ICPs fetch error:', icpsError);
              return res.status(500).json({ error: 'Failed to fetch ICPs' });
            }
            
            const formattedIcps = icps.map(icp => ({
              ...icp,
              painPoints: icp.pain_points ? JSON.parse(icp.pain_points) : [],
              technologies: icp.technologies ? JSON.parse(icp.technologies) : [],
              companySize: icp.company_size ? JSON.parse(icp.company_size) : [],
              jobTitles: icp.job_titles ? JSON.parse(icp.job_titles) : [],
              locationCountry: icp.location_country ? JSON.parse(icp.location_country) : [],
              industries: icp.industries ? JSON.parse(icp.industries) : []
            }));
            
            return res.json({ success: true, icps: formattedIcps });
          }
        }
        
        // Get specific ICP by ID
        if (method === 'GET' && url.match(/\/api\/icp\/([^\/]+)$/)) {
          const icpId = url.match(/\/api\/icp\/([^\/]+)$/)[1];
          
          const { data: icp, error: icpError } = await supabase
            .from('icps')
            .select('*')
            .eq('id', icpId)
            .eq('user_id', user.id)
            .single();
          
          if (icpError || !icp) {
            return res.status(404).json({ error: 'ICP not found' });
          }
          
          const formattedIcp = {
            ...icp,
            painPoints: icp.pain_points ? JSON.parse(icp.pain_points) : [],
            technologies: icp.technologies ? JSON.parse(icp.technologies) : [],
            companySize: icp.company_size ? JSON.parse(icp.company_size) : [],
            jobTitles: icp.job_titles ? JSON.parse(icp.job_titles) : [],
            locationCountry: icp.location_country ? JSON.parse(icp.location_country) : [],
            industries: icp.industries ? JSON.parse(icp.industries) : []
          };
          
          return res.json({ success: true, icp: formattedIcp });
        }
        
        // Save report
        if (method === 'POST' && url.includes('/save-report')) {
          const { companyName, url: companyUrl, icpId } = body;
          if (!companyName || !companyUrl || !icpId) {
            return res.status(400).json({ error: 'companyName, url, and icpId are required' });
          }
          
          const { error: reportError } = await supabase
            .from('saved_reports')
            .insert({
              user_id: user.id,
              company_name: companyName,
              url: companyUrl,
              icp_id: icpId
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
      // TODO: Migrate all /api/sales-intelligence logic here
      return res.status(501).json({ error: 'Sales-Intelligence API not implemented in app.ts yet' });
    }
    // UPLOAD ENDPOINTS
    if (url.startsWith('/api/upload')) {
      // TODO: Migrate all /api/upload logic here
      return res.status(501).json({ error: 'Upload API not implemented in app.ts yet' });
    }
    // WORKFLOW ENDPOINTS
    if (url.startsWith('/api/workflow')) {
      // TODO: Migrate all /api/workflow logic here
      return res.status(501).json({ error: 'Workflow API not implemented in app.ts yet' });
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
      if (method !== 'POST') {
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
      // TODO: Migrate all /api/analytics logic here
      return res.status(501).json({ error: 'Analytics API not implemented in app.ts yet' });
    }
    // INTEGRATIONS ENDPOINT
    if (url.startsWith('/api/integrations')) {
      // TODO: Migrate all /api/integrations logic here
      return res.status(501).json({ error: 'Integrations API not implemented in app.ts yet' });
    }
    // INVITATIONS ENDPOINT
    if (url.startsWith('/api/invitations')) {
      // TODO: Migrate all /api/invitations logic here
      return res.status(501).json({ error: 'Invitations API not implemented in app.ts yet' });
    }
    // TEAM ENDPOINT
    if (url.startsWith('/api/team')) {
      // TODO: Migrate all /api/team logic here
      return res.status(501).json({ error: 'Team API not implemented in app.ts yet' });
    }
    // DEFAULT: Not found
    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
} 