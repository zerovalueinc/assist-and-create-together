// Centralized client for Supabase Edge Function calls
// Only add new logic here; do not break or refactor existing fetches yet

import { supabase } from '../supabaseClient';

export async function invokeEdgeFunction(
  functionName: string,
  payload: any,
  options?: { workspace_id?: string; access_token?: string }
) {
  const body = options?.workspace_id
    ? { ...payload, workspace_id: options.workspace_id }
    : payload;
  const headers = options?.access_token
    ? { Authorization: `Bearer ${options.access_token}` }
    : undefined;
  return await supabase.functions.invoke(functionName, {
    body,
    headers,
  });
}

// Direct HTTP proxy to Supabase Edge Function (for backend proxy routes)
export async function proxyToEdgeFunction({
  edgeUrl,
  payload,
  accessToken
}: {
  edgeUrl: string;
  payload: any;
  accessToken?: string;
}) {
  const res = await fetch(edgeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: accessToken } : {}),
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data };
}

// Add more specialized wrappers as needed, e.g.:
// export async function invokePipelineOrchestrator(payload: any) {
//   return invokeEdgeFunction('pipeline-orchestrator', payload);
// }

// Shared utility to fetch company analysis reports from the correct table
export async function getCompanyAnalysis({ userId }: { userId?: string } = {}) {
  let query = supabase
    .from('company_analyzer_outputs')
    .select('*')
    .order('created_at', { ascending: false });
  if (userId) {
    query = query.eq('user_id', userId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getCompanyAnalysisById(id: string) {
  const { data, error } = await supabase
    .from('company_analyzer_outputs')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
} 