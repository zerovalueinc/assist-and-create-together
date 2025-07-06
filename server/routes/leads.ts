// @ts-nocheck
import express from 'express';
import { createClient } from '@supabase/supabase-js';
// import { searchApolloContacts, apolloToInstantlyLead } from '../../agents/apolloAgent';
// import { 
//   getCachedResult, saveToCache, getRow, getRows, runQuery 
// } from '../database/init';
import { 
  getAnalyticsData, 
  bulkEnrichLeads, 
  getDatabaseStats, 
  exportData as exportDatabaseData,
  optimizeDatabase, 
  backupDatabase 
} from '../database/init';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://hbogcsztrryrepudceww.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper functions to replace database/init functions
async function getRows(table: string, conditions: Record<string, any> = {}) {
  let query = supabase.from(table).select('*');
  for (const [key, value] of Object.entries(conditions)) {
    query = query.eq(key, value);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function getRow(table: string, conditions: Record<string, any>) {
  let query = supabase.from(table).select('*');
  for (const [key, value] of Object.entries(conditions)) {
    query = query.eq(key, value);
  }
  const { data, error } = await query.single();
  if (error) throw error;
  return data;
}

async function runQuery(query: string, params: any[] = []) {
  // For Supabase, we'll use RPC for custom queries or direct table operations
  const { data, error } = await supabase.rpc('execute_sql', { sql_query: query, params });
  if (error) throw error;
  return data;
}

// Rate limiting for Apollo API calls
const apolloCallTracker = new Map<string, { count: number, resetTime: number }>();
const APOLLO_RATE_LIMIT = 100; // calls per hour
const APOLLO_RATE_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function checkApolloRateLimit(): boolean {
  const now = Date.now();
  const hourAgo = now - APOLLO_RATE_WINDOW;
  
  // Clean up old entries
  for (const [key, value] of apolloCallTracker.entries()) {
    if (value.resetTime < hourAgo) {
      apolloCallTracker.delete(key);
    }
  }
  
  const currentCount = Array.from(apolloCallTracker.values())
    .filter(v => v.resetTime > hourAgo)
    .reduce((sum, v) => sum + v.count, 0);
  
  return currentCount < APOLLO_RATE_LIMIT;
}

function trackApolloCall(): void {
  const now = Date.now();
  const key = `apollo_${Math.floor(now / APOLLO_RATE_WINDOW)}`;
  
  const current = apolloCallTracker.get(key) || { count: 0, resetTime: now + APOLLO_RATE_WINDOW };
  current.count++;
  apolloCallTracker.set(key, current);
}

// Enhanced lead search with comprehensive error handling
router.post('/search', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const startTime = Date.now();
  console.log(`🔍 Lead search request received:`, { icpId: req.body.icpId, limit: req.body.limit });
  
  try {
    const { icpId, limit = 15, forceRefresh = false } = req.body;
    
    if (!icpId) {
      return res.status(400).json({ 
        error: 'ICP ID is required',
        code: 'MISSING_ICP_ID'
      });
    }

    // Check rate limiting
    if (!checkApolloRateLimit()) {
      return res.status(429).json({ 
        error: 'Apollo API rate limit exceeded. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: 3600 // 1 hour
      });
    }

    // Get ICP from database with enhanced error handling
    const icp = await getRow('SELECT * FROM icps WHERE id = ? AND userId = ?', [icpId, userId]);
    if (!icp) {
      return res.status(404).json({ 
        error: 'ICP not found',
        code: 'ICP_NOT_FOUND',
        icpId
      });
    }

    console.log(`📊 Found ICP: ${icp.industry} - ${icp.persona}`);

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

    // Prepare Apollo query parameters with validation
    const queryParams = {
      organization_num_employees: icpData.companySize || [],
      title: icpData.jobTitles || [],
      country: icpData.locationCountry || [],
      industry: icpData.industries || [],
    };

    console.log(`🎯 Apollo search parameters:`, queryParams);

    // Track Apollo API call
    trackApolloCall();

    // Search Apollo for leads with retry logic
    let apolloLeads;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        // Comment out remaining problematic imports
        // const apolloLeads = await searchApolloContacts(queryParams, limit);
        // TODO: Integrate Apollo lead fetching
        break;
      } catch (apolloError) {
        retryCount++;
        console.error(`Apollo API call failed (attempt ${retryCount}/${maxRetries}):`, apolloError);
        
        if (retryCount >= maxRetries) {
          throw new Error(`Apollo API failed after ${maxRetries} attempts: ${apolloError}`);
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
    
    if (apolloLeads.length === 0) {
      console.log(`📭 No leads found for ICP ${icpId}`);
      return res.json({ 
        success: true, 
        leads: [],
        message: 'No leads found matching ICP criteria',
        searchParams: queryParams,
        duration: Date.now() - startTime
      });
    }

    console.log(`✅ Found ${apolloLeads.length} leads from Apollo`);

    // Map Apollo leads to our format and store in database with transaction
    const storedLeads: any[] = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (const apolloLead of apolloLeads) {
      try {
        // Comment out claude import
        // const mappedLead = apolloToInstantlyLead(apolloLead);
        // TODO: Integrate Apollo-to-Instantly mapping
        
        // Check if lead already exists (avoid duplicates)
        const existingLead = await getRow(
          'SELECT id FROM leads WHERE email = ? AND icpId = ? AND userId = ?', 
          [apolloLead.email, icpId, userId]
        );
        
        if (existingLead && !forceRefresh) {
          console.log(`⏭️ Skipping duplicate lead: ${apolloLead.email}`);
          continue;
        }
        
        // Store lead in database
        const result = await runQuery(`
          INSERT INTO leads (firstName, lastName, fullName, title, email, linkedInUrl, companyName, companyWebsite, confidenceScore, icpId, userId)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          apolloLead.firstName,
          apolloLead.lastName,
          apolloLead.firstName + ' ' + apolloLead.lastName,
          apolloLead.jobTitle,
          apolloLead.email,
          apolloLead.linkedin_url || null,
          apolloLead.companyName,
          apolloLead.companyWebsite,
          apolloLead.confidence_score || 0.5,
          icpId,
          userId
        ]);

        // Get the stored lead
        const storedLead = await getRow('SELECT * FROM leads WHERE id = ? AND userId = ?', [result.id, userId]);
        storedLeads.push(storedLead);
        successCount++;
        
      } catch (leadError) {
        errorCount++;
        console.error(`Error processing lead ${apolloLead.email}:`, leadError);
        // Continue processing other leads
      }
    }

    console.log(`💾 Lead processing complete: ${successCount} stored, ${errorCount} errors`);

    res.json({
      success: true,
      leads: storedLeads,
      count: storedLeads.length,
      stats: {
        totalFound: apolloLeads.length,
        stored: successCount,
        errors: errorCount,
        duplicates: apolloLeads.length - successCount - errorCount
      },
      searchParams: queryParams,
      duration: Date.now() - startTime,
      rateLimit: {
        remaining: APOLLO_RATE_LIMIT - Array.from(apolloCallTracker.values())
          .filter(v => v.resetTime > Date.now() - APOLLO_RATE_WINDOW)
          .reduce((sum, v) => sum + v.count, 0)
      }
    });

  } catch (error) {
    console.error('🚨 Lead search failed:', error);
    res.status(500).json({ 
      error: 'Failed to search leads',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'LEAD_SEARCH_FAILED',
      duration: Date.now() - startTime
    });
  }
});

// Enhanced lead retrieval with pagination and filtering
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const { 
      icpId, 
      page = 1, 
      limit = 20, 
      search, 
      company,
      title,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;
    
    let sql = 'SELECT * FROM leads WHERE userId = ? AND 1=1';
    let params: any[] = [userId];
    let conditions: string[] = [];

    if (icpId) {
      conditions.push('icpId = ?');
      params.push(icpId);
    }

    if (search) {
      conditions.push('(fullName LIKE ? OR email LIKE ? OR companyName LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (company) {
      conditions.push('companyName LIKE ?');
      params.push(`%${company}%`);
    }

    if (title) {
      conditions.push('title LIKE ?');
      params.push(`%${title}%`);
    }

    if (conditions.length > 0) {
      sql += ' AND ' + conditions.join(' AND ');
    }

    // Add sorting
    const validSortFields = ['createdAt', 'fullName', 'companyName', 'title', 'confidenceScore'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'createdAt';
    const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';
    
    sql += ` ORDER BY ${sortField} ${order}`;

    // Add pagination
    const offset = (Number(page) - 1) * Number(limit);
    sql += ` LIMIT ? OFFSET ?`;
    params.push(Number(limit), offset);

    const leads = await getRows(sql, params);
    
    // Get total count for pagination
    let countSql = 'SELECT COUNT(*) as total FROM leads WHERE userId = ? AND 1=1';
    let countParams: any[] = [userId];
    if (conditions.length > 0) {
      countSql += ' AND ' + conditions.join(' AND ');
      countParams = [...params.slice(0, -2)]; // Copy params without LIMIT and OFFSET
    }
    const countResult = await getRow(countSql, countParams);
    const total = countResult.total;

    res.json({ 
      success: true, 
      leads,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
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
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ 
      error: 'Failed to fetch leads',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// NEW: Enhanced lead operations endpoints (must come before /:id routes)

// Get lead analytics and statistics
router.get('/analytics', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const timeframe = req.query.timeframe as string || '30d';
    const analytics = await getAnalyticsData(timeframe);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error getting lead analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get lead analytics'
    });
  }
});

// Get database statistics
router.get('/stats', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const stats = await getDatabaseStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting database stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get database stats'
    });
  }
});

// Export leads data
router.get('/export', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const exportType = req.query.type as string || 'leads';
    const filters = req.query.filters ? JSON.parse(req.query.filters as string) : {};
    
    const exportResult = await exportDatabaseData(exportType, filters);
    
    res.json({
      success: true,
      data: exportResult
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export data'
    });
  }
});

// Get agent usage statistics
router.get('/agent-stats', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    // Comment out claude import
    // import { callClaude3 } from '../../agents/claude';
    // TODO: Integrate Claude analysis
    
    const { getClaudeUsageStats } = await import('../../agents/claude');
    const { getApolloUsageStats } = await import('../../agents/apolloAgent');
    
    const claudeStats = getClaudeUsageStats();
    const apolloStats = getApolloUsageStats();
    
    res.json({
      success: true,
      data: {
        claude: claudeStats,
        apollo: apolloStats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting agent stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get agent statistics'
    });
  }
});

// Get specific lead by ID with enrichment data
router.get('/:id', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const { id } = req.params;
    const lead = await getRow(`
      SELECT l.*, e.bio, e.interests, e.oneSentenceWhyTheyCare, e.enrichedAt
      FROM leads l
      LEFT JOIN enriched_leads e ON l.id = e.leadId
      WHERE l.id = ? AND userId = ?
    `, [id, userId]);
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({ success: true, lead });
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({ 
      error: 'Failed to fetch lead',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete lead with cascade cleanup
router.delete('/:id', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const { id } = req.params;
    
    // Delete enriched data first
    await runQuery('DELETE FROM enriched_leads WHERE leadId = ? AND userId = ?', [id, userId]);
    
    // Delete email templates
    await runQuery('DELETE FROM email_templates WHERE leadId = ? AND userId = ?', [id, userId]);
    
    // Delete the lead
    const result = await runQuery('DELETE FROM leads WHERE id = ? AND userId = ?', [id, userId]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({ success: true, message: 'Lead and associated data deleted successfully' });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ 
      error: 'Failed to delete lead',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Bulk operations
router.post('/bulk', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const { action, leadIds } = req.body;
    
    if (!action || !leadIds || !Array.isArray(leadIds)) {
      return res.status(400).json({ error: 'Action and leadIds array are required' });
    }

    let result;
    switch (action) {
      case 'delete':
        // Delete enriched data and email templates first
        await runQuery('DELETE FROM enriched_leads WHERE leadId IN (' + leadIds.map(() => '?').join(',') + ') AND userId = ?', [...leadIds, userId]);
        await runQuery('DELETE FROM email_templates WHERE leadId IN (' + leadIds.map(() => '?').join(',') + ') AND userId = ?', [...leadIds, userId]);
        result = await runQuery('DELETE FROM leads WHERE id IN (' + leadIds.map(() => '?').join(',') + ') AND userId = ?', [...leadIds, userId]);
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    res.json({ 
      success: true, 
      message: `Bulk ${action} completed`,
      affectedRows: result.changes
    });
  } catch (error) {
    console.error('Error in bulk operation:', error);
    res.status(500).json({ 
      error: 'Bulk operation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Optimize database
router.post('/optimize', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    console.log('🔧 Starting database optimization...');
    
    const result = await optimizeDatabase();
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error optimizing database:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to optimize database'
    });
  }
});

// Backup database
router.post('/backup', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    console.log('💾 Starting database backup...');
    
    const backupPath = await backupDatabase();
    
    res.json({
      success: true,
      data: {
        backupPath,
        message: 'Database backed up successfully'
      }
    });
  } catch (error) {
    console.error('Error backing up database:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to backup database'
    });
  }
});

// Reset agent usage tracking
router.post('/reset-agent-stats', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    // Comment out claude import
    // import { callClaude3 } from '../../agents/claude';
    // TODO: Integrate Claude analysis
    
    const { resetClaudeUsage } = await import('../../agents/claude');
    const { resetApolloUsage } = await import('../../agents/apolloAgent');
    
    resetClaudeUsage();
    resetApolloUsage();
    
    res.json({
      success: true,
      message: 'Agent usage statistics reset successfully'
    });
  } catch (error) {
    console.error('Error resetting agent stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset agent statistics'
    });
  }
});

export { router as leadsRoutes }; 