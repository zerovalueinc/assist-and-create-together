// @ts-nocheck
import express from 'express';
// import { runQuery, getRow, getRows } from '../database/init';
import { generatePersonalizedEmail } from '../../agents/claude';
import { uploadToInstantly } from '../../agents/emailAgent';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Rate limiting for Claude API calls
const claudeCallTracker = new Map<string, { count: number, resetTime: number }>();
const CLAUDE_RATE_LIMIT = 50; // calls per hour
const CLAUDE_RATE_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function checkClaudeRateLimit(): boolean {
  const now = Date.now();
  const hourAgo = now - CLAUDE_RATE_WINDOW;
  
  // Clean up old entries
  for (const [key, value] of claudeCallTracker.entries()) {
    if (value.resetTime < hourAgo) {
      claudeCallTracker.delete(key);
    }
  }
  
  const currentCount = Array.from(claudeCallTracker.values())
    .filter(v => v.resetTime > hourAgo)
    .reduce((sum, v) => sum + v.count, 0);
  
  return currentCount < CLAUDE_RATE_LIMIT;
}

function trackClaudeCall(): void {
  const now = Date.now();
  const key = `claude_${Math.floor(now / CLAUDE_RATE_WINDOW)}`;
  
  const current = claudeCallTracker.get(key) || { count: 0, resetTime: now + CLAUDE_RATE_WINDOW };
  current.count++;
  claudeCallTracker.set(key, current);
}

// Generate email template for a lead
router.post('/generate/:leadId', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const startTime = Date.now();
  console.log(`📧 Email generation request for lead ${req.params.leadId}`);
  
  try {
    const { leadId } = req.params;
    const { tone = 'professional', style = 'outbound', useClaude = true } = req.body;
    
    // Check rate limiting
    if (useClaude && !checkClaudeRateLimit()) {
      return res.status(429).json({ 
        error: 'Claude API rate limit exceeded. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: 3600 // 1 hour
      });
    }

    // Get the lead with enhanced error handling
    const lead = await getRow('SELECT * FROM leads WHERE id = ? AND userId = ?', [leadId, userId]);
    if (!lead) {
      return res.status(404).json({ 
        error: 'Lead not found',
        code: 'LEAD_NOT_FOUND',
        leadId
      });
    }

    // Get the ICP for context
    const icp = await getRow('SELECT * FROM icps WHERE id = ? AND userId = ?', [lead.icpId, userId]);
    if (!icp) {
      return res.status(404).json({ 
        error: 'ICP not found',
        code: 'ICP_NOT_FOUND',
        icpId: lead.icpId
      });
    }

    // Get enrichment data if available
    const enrichment = await getRow('SELECT * FROM enriched_leads WHERE leadId = ? AND userId = ?', [leadId, userId]);

    console.log(`📊 Generating email for ${lead.fullName} at ${lead.companyName}`);

    // Parse ICP data with validation
    let icpData;
    try {
      icpData = {
        ...icp,
        painPoints: JSON.parse(icp.painPoints || '[]'),
        technologies: JSON.parse(icp.technologies || '[]'),
        companySize: JSON.parse(icp.companySize || '[]'),
        jobTitles: JSON.parse(icp.jobTitles || '[]'),
        locationCountry: JSON.parse(icp.locationCountry || '[]'),
        industries: JSON.parse(icp.industries || '[]')
      };
    } catch (parseError) {
      console.error('Error parsing ICP data:', parseError);
      return res.status(500).json({ 
        error: 'Invalid ICP data format',
        code: 'INVALID_ICP_DATA'
      });
    }

    let emailTemplate;

    if (useClaude) {
      // Track Claude API call
      trackClaudeCall();
      
      // Generate personalized email using Claude with retry logic
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          emailTemplate = await generatePersonalizedEmail({
            lead,
            icp: icpData,
            enrichment,
            tone,
            style
          });
          break;
        } catch (claudeError) {
          retryCount++;
          console.error(`Claude API call failed (attempt ${retryCount}/${maxRetries}):`, claudeError);
          
          if (retryCount >= maxRetries) {
            console.warn('⚠️ Claude API failed, falling back to template generation');
            emailTemplate = generateFallbackEmail(lead, icpData, enrichment, tone);
            break;
          }
          
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    } else {
      // Use fallback template generation
      emailTemplate = generateFallbackEmail(lead, icpData, enrichment, tone);
    }

    // Store email template
    if (!emailTemplate) {
      throw new Error('Failed to generate email template');
    }
    
    const result = await runQuery(`
      INSERT INTO email_templates (leadId, subject, body, tone, userId)
      VALUES (?, ?, ?, ?, ?)
    `, [
      leadId,
      emailTemplate.subject,
      emailTemplate.body,
      tone,
      userId
    ]);

    // Get the created template
    const createdTemplate = await getRow('SELECT * FROM email_templates WHERE id = ? AND userId = ?', [result.id, userId]);

    console.log(`✅ Email template generated in ${Date.now() - startTime}ms`);

    res.json({
      success: true,
      emailTemplate: createdTemplate,
      generationMethod: useClaude ? 'claude' : 'template',
      duration: Date.now() - startTime,
      rateLimit: {
        remaining: CLAUDE_RATE_LIMIT - Array.from(claudeCallTracker.values())
          .filter(v => v.resetTime > Date.now() - CLAUDE_RATE_WINDOW)
          .reduce((sum, v) => sum + v.count, 0)
      }
    });

  } catch (error) {
    console.error('🚨 Email generation failed:', error);
    res.status(500).json({ 
      error: 'Failed to generate email template',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'EMAIL_GENERATION_FAILED',
      duration: Date.now() - startTime
    });
  }
});

// Upload campaign to Instantly
router.post('/upload/:templateId', authenticateToken, async (req, res) => {
  const startTime = Date.now();
  console.log(`📤 Uploading campaign for template ${req.params.templateId}`);
  
  try {
    const { templateId } = req.params;
    const { campaignName, sequenceSteps = 1 } = req.body;
    
    // Get the email template
    const template = await getRow('SELECT * FROM email_templates WHERE id = ? AND userId = ?', [templateId, req.user.id]);
    if (!template) {
      return res.status(404).json({ 
        error: 'Email template not found',
        code: 'TEMPLATE_NOT_FOUND'
      });
    }

    // Get the lead for context
    const lead = await getRow('SELECT * FROM leads WHERE id = ? AND userId = ?', [template.leadId, req.user.id]);
    if (!lead) {
      return res.status(404).json({ 
        error: 'Lead not found',
        code: 'LEAD_NOT_FOUND'
      });
    }

    // Prepare campaign data for Instantly
    const campaignData = {
      name: campaignName || `Campaign for ${lead.companyName}`,
      subject: template.subject,
      body: template.body,
      lead: {
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        company: lead.companyName,
        title: lead.title
      },
      sequenceSteps
    };

    // Upload to Instantly with retry logic
    let retryCount = 0;
    const maxRetries = 3;
    let uploadResult;
    
    while (retryCount < maxRetries) {
      try {
        uploadResult = await uploadToInstantly(campaignData);
        break;
      } catch (instantlyError) {
        retryCount++;
        console.error(`Instantly upload failed (attempt ${retryCount}/${maxRetries}):`, instantlyError);
        
        if (retryCount >= maxRetries) {
          throw new Error(`Instantly upload failed after ${maxRetries} attempts: ${instantlyError}`);
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    console.log(`✅ Campaign uploaded to Instantly in ${Date.now() - startTime}ms`);

    res.json({
      success: true,
      uploadResult,
      campaignName: campaignData.name,
      duration: Date.now() - startTime
    });

  } catch (error) {
    console.error('🚨 Campaign upload failed:', error);
    res.status(500).json({ 
      error: 'Failed to upload campaign',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'CAMPAIGN_UPLOAD_FAILED',
      duration: Date.now() - startTime
    });
  }
});

// Bulk email generation
router.post('/bulk-generate', authenticateToken, async (req, res) => {
  const startTime = Date.now();
  console.log(`📧 Bulk email generation request`);
  
  try {
    const { leadIds, tone = 'professional', style = 'outbound', useClaude = false } = req.body;
    
    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ 
        error: 'Lead IDs array is required',
        code: 'MISSING_LEAD_IDS'
      });
    }

    if (useClaude && !checkClaudeRateLimit()) {
      return res.status(429).json({ 
        error: 'Claude API rate limit exceeded for bulk operation',
        code: 'RATE_LIMIT_EXCEEDED'
      });
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
        // Get lead and ICP data
        const lead = await getRow('SELECT * FROM leads WHERE id = ? AND userId = ?', [leadId, req.user.id]);
        if (!lead) {
          errorCount++;
          results.push({ leadId, error: 'Lead not found' });
          continue;
        }

        const icp = await getRow('SELECT * FROM icps WHERE id = ? AND userId = ?', [lead.icpId, req.user.id]);
        if (!icp) {
          errorCount++;
          results.push({ leadId, error: 'ICP not found' });
          continue;
        }

        const enrichment = await getRow('SELECT * FROM enriched_leads WHERE leadId = ? AND userId = ?', [leadId, req.user.id]);

        // Parse ICP data
        const icpData = {
          ...icp,
          painPoints: JSON.parse(icp.painPoints || '[]'),
          technologies: JSON.parse(icp.technologies || '[]'),
          companySize: JSON.parse(icp.companySize || '[]'),
          jobTitles: JSON.parse(icp.jobTitles || '[]'),
          locationCountry: JSON.parse(icp.locationCountry || '[]'),
          industries: JSON.parse(icp.industries || '[]')
        };

        // Generate email template
        let emailTemplate;
        if (useClaude) {
          trackClaudeCall();
          emailTemplate = await generatePersonalizedEmail({
            lead,
            icp: icpData,
            enrichment,
            tone,
            style
          });
        } else {
          emailTemplate = generateFallbackEmail(lead, icpData, enrichment, tone);
        }

        // Store template
        const result = await runQuery(`
          INSERT INTO email_templates (leadId, subject, body, tone, userId)
          VALUES (?, ?, ?, ?, ?)
        `, [leadId, emailTemplate.subject, emailTemplate.body, tone, req.user.id]);

        const createdTemplate = await getRow('SELECT * FROM email_templates WHERE id = ? AND userId = ?', [result.id, req.user.id]);
        
        results.push({ leadId, success: true, template: createdTemplate });
        successCount++;

      } catch (leadError) {
        errorCount++;
        console.error(`Error processing lead ${leadId}:`, leadError);
        results.push({ 
          leadId, 
          error: leadError instanceof Error ? leadError.message : 'Unknown error'
        });
      }
    }

    console.log(`✅ Bulk email generation complete: ${successCount} success, ${errorCount} errors`);

    res.json({
      success: true,
      results,
      stats: {
        total: leadIds.length,
        success: successCount,
        errors: errorCount
      },
      duration: Date.now() - startTime
    });

  } catch (error) {
    console.error('🚨 Bulk email generation failed:', error);
    res.status(500).json({ 
      error: 'Failed to generate bulk emails',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'BULK_EMAIL_GENERATION_FAILED',
      duration: Date.now() - startTime
    });
  }
});

// Get email templates for a lead with enhanced filtering
router.get('/:leadId', authenticateToken, async (req, res) => {
  try {
    const { leadId } = req.params;
    const { tone, limit = 10 } = req.query;
    
    let sql = 'SELECT * FROM email_templates WHERE leadId = ? AND userId = ?';
    let params: any[] = [leadId, req.user.id];
    
    if (tone) {
      sql += ' AND tone = ?';
      params.push(tone);
    }
    
    sql += ' ORDER BY createdAt DESC LIMIT ?';
    params.push(Number(limit));
    
    const templates = await getRows(sql, params);
    
    res.json({ 
      success: true, 
      templates,
      filters: { tone, limit }
    });
  } catch (error) {
    console.error('Error fetching email templates:', error);
    res.status(500).json({ 
      error: 'Failed to fetch email templates',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update email template
router.put('/:templateId', authenticateToken, async (req, res) => {
  try {
    const { templateId } = req.params;
    const { subject, body, tone } = req.body;
    
    const result = await runQuery(`
      UPDATE email_templates 
      SET subject = ?, body = ?, tone = ?
      WHERE id = ? AND userId = ?
    `, [subject, body, tone, templateId, req.user.id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Email template not found' });
    }

    const updatedTemplate = await getRow('SELECT * FROM email_templates WHERE id = ? AND userId = ?', [templateId, req.user.id]);
    res.json({ success: true, emailTemplate: updatedTemplate });
  } catch (error) {
    console.error('Error updating email template:', error);
    res.status(500).json({ 
      error: 'Failed to update email template',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete email template
router.delete('/:templateId', authenticateToken, async (req, res) => {
  try {
    const { templateId } = req.params;
    
    const result = await runQuery('DELETE FROM email_templates WHERE id = ? AND userId = ?', [templateId, req.user.id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Email template not found' });
    }

    res.json({ success: true, message: 'Email template deleted successfully' });
  } catch (error) {
    console.error('Error deleting email template:', error);
    res.status(500).json({ 
      error: 'Failed to delete email template',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper function for fallback email generation
function generateFallbackEmail(lead: any, icp: any, enrichment: any, tone: string) {
  const painPoint = icp.painPoints?.[0] || 'business challenges';
  const useCase = icp.validUseCase || 'business efficiency';
  
  const subject = `Quick question about ${useCase} at ${lead.companyName}`;
  
  let body = `Hi ${lead.firstName},\n\n`;
  
  if (tone === 'casual') {
    body += `I came across ${lead.companyName} and noticed you're the ${lead.title} there. `;
    body += `I thought you might be interested in how we're helping companies tackle ${painPoint}.\n\n`;
  } else {
    body += `I noticed you're the ${lead.title} at ${lead.companyName}, and I thought you might be interested in how we're helping companies like yours with ${painPoint}.\n\n`;
  }
  
  if (enrichment?.oneSentenceWhyTheyCare) {
    body += `${enrichment.oneSentenceWhyTheyCare}\n\n`;
  } else {
    body += `As someone in your position, you likely care about ${painPoint}.\n\n`;
  }
  
  body += `Would you be open to a 15-minute call to discuss how we could help ${lead.companyName} achieve better results?\n\n`;
  body += `Best regards,\n[Your Name]`;
  
  return { subject, body };
}

export { router as emailRoutes }; 