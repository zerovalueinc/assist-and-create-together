import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalizeFirstLetter(name: string) {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

// Local storage cache helpers
export function setCache(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function getCache<T = any>(key: string, fallback: T = null): T {
  try {
    const val = localStorage.getItem(key);
    if (val) return JSON.parse(val);
  } catch {}
  return fallback;
}

export function removeCache(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {}
}

// Normalizes a report section (string, array, object) to a UI-friendly structure, with optional limit
export function normalizeReportSection(
  data: any,
  limit: number = 5
): { items: Array<{ label: string, value: string | string[] }>, hasMore: boolean } {
  let items: Array<{ label: string, value: string | string[] }> = [];
  if (data == null) return { items: [], hasMore: false };
  if (typeof data === 'string') {
    items = [{ label: '', value: data }];
  } else if (Array.isArray(data) && data.every(item => typeof item === 'string')) {
    items = [{ label: '', value: data }];
  } else if (Array.isArray(data) && data.every(item => typeof item === 'object')) {
    items = data.flatMap(item => normalizeReportSection(item, limit).items);
  } else if (typeof data === 'object') {
    items = Object.entries(data).map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value) && value.every(v => typeof v === 'string')) {
          return { label: key, value };
        }
        return { label: key, value: JSON.stringify(value, null, 2) };
      }
      return { label: key, value: String(value) };
    });
  } else {
    items = [{ label: '', value: JSON.stringify(data) }];
  }
  const hasMore = Array.isArray(items) && items.length > limit;
  return { items: items.slice(0, limit), hasMore };
}

// Prettifies a label (e.g., 'crm_systems' -> 'CRM Systems')
export function prettifyLabel(label: string): string {
  if (!label) return '';
  return label
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bApi\b/gi, 'API')
    .replace(/\bCrm\b/gi, 'CRM')
    .replace(/\bGtm\b/gi, 'GTM')
    .replace(/\bIb(p)?\b/gi, 'IBP')
    .replace(/\bIcp\b/gi, 'ICP')
    .replace(/\bSaas\b/gi, 'SaaS')
    .replace(/\bUi\b/gi, 'UI')
    .replace(/\bUx\b/gi, 'UX')
    .replace(/\bPwa\b/gi, 'PWA')
    .replace(/\bErp\b/gi, 'ERP')
    .replace(/\bB2b\b/gi, 'B2B')
    .replace(/\bB2c\b/gi, 'B2C')
    .replace(/\bAws\b/gi, 'AWS')
    .replace(/\bSmb\b/gi, 'SMB')
    .replace(/\bApi\b/gi, 'API')
    .replace(/\bUrl\b/gi, 'URL')
    .replace(/\bId\b/gi, 'ID')
    .replace(/\bAi\b/gi, 'AI')
    .replace(/\bUi\b/gi, 'UI')
    .replace(/\bUx\b/gi, 'UX')
    .replace(/\bSql\b/gi, 'SQL')
    .replace(/\bNo\b/gi, 'No');
}

// Flattens known nested fields for badge/list rendering
export function flattenKnownFields(obj: any): Array<{ label: string, value: string | string[] | boolean }> {
  if (!obj || typeof obj !== 'object') return [];
  const knownArrays = [
    'categories', 'development_tools', 'shipping', 'marketing', 'accounting', 'payment_gateways',
    'browsers', 'apps', 'notable_clients', 'main_products', 'industry_focus', 'company_characteristics', 'technology_profile',
  ];
  const knownBooleans = ['responsive', 'responsive_design'];
  const result: Array<{ label: string, value: string | string[] | boolean }> = [];
  for (const [key, value] of Object.entries(obj)) {
    if (knownArrays.includes(key) && Array.isArray(value)) {
      result.push({ label: key, value });
    } else if (knownBooleans.includes(key) && typeof value === 'boolean') {
      result.push({ label: key, value });
    } else if (typeof value === 'object' && value !== null) {
      // Recursively flatten one level for known objects
      const nested = flattenKnownFields(value);
      if (nested.length > 0) {
        nested.forEach(n => result.push({ label: prettifyLabel(key) + ' - ' + prettifyLabel(n.label), value: n.value }));
      } else {
        // Unknown object, skip for now (will be handled as JSON elsewhere)
      }
    }
  }
  return result;
}
