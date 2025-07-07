// Basic database initialization
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function initDatabase() {
  try {
    // Initialize database connection
    console.log('Database initialized');
    return supabase;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

// Sales Intelligence Report functions
export async function createSalesIntelligenceReport(data: any) {
  try {
    const { data: result, error } = await supabase
      .from('sales_intelligence_reports')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error creating sales intelligence report:', error);
    throw error;
  }
}

export async function getSalesIntelligenceReport(id: string) {
  try {
    const { data, error } = await supabase
      .from('sales_intelligence_reports')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting sales intelligence report:', error);
    throw error;
  }
}

export async function getTopSalesIntelligenceReports(userId: string, limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('sales_intelligence_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting top sales intelligence reports:', error);
    return [];
  }
}

export async function updateApolloLeadMatches(
  reportId: string,
  apolloCompanyId: string,
  companyName: string,
  matchedContacts: any[],
  icpFitScore: number,
  intentScore: number
) {
  try {
    const { data, error } = await supabase
      .from('sales_intelligence_reports')
      .update({
        apollo_company_id: apolloCompanyId,
        apollo_company_name: companyName,
        apollo_matched_contacts: matchedContacts,
        icp_fit_score: icpFitScore,
        intent_score: intentScore,
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating Apollo lead matches:', error);
    throw error;
  }
}

// Additional database functions for company analysis
export async function getRows(query: string, params: any[] = []) {
  try {
    // This is a placeholder - you'll need to implement based on your database setup
    console.log('getRows called with:', query, params);
    return [];
  } catch (error) {
    console.error('Error in getRows:', error);
    return [];
  }
}

export async function saveReport(userId: string, companyName: string, url: string, data: any) {
  try {
    const { data: result, error } = await supabase
      .from('company_analysis_reports')
      .insert({
        user_id: userId,
        company_name: companyName,
        url: url,
        data: data,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error saving report:', error);
    throw error;
  }
}

export async function getSavedReports(userId: string) {
  try {
    const { data, error } = await supabase
      .from('company_analysis_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting saved reports:', error);
    return [];
  }
}

export default { 
  supabase, 
  initDatabase, 
  createSalesIntelligenceReport, 
  getSalesIntelligenceReport, 
  getTopSalesIntelligenceReports, 
  updateApolloLeadMatches,
  getRows,
  saveReport,
  getSavedReports
}; 