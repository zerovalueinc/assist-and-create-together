// Centralized client for Supabase Edge Function calls
// Only add new logic here; do not break or refactor existing fetches yet

import { supabase } from '../supabaseClient';

export async function invokeEdgeFunction(functionName: string, payload: any) {
  return await supabase.functions.invoke(functionName, {
    body: payload,
  });
}

// Add more specialized wrappers as needed, e.g.:
// export async function invokePipelineOrchestrator(payload: any) {
//   return invokeEdgeFunction('pipeline-orchestrator', payload);
// } 