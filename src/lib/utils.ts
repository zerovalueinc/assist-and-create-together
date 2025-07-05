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

// Normalizes a report section (string, array, object) to a UI-friendly structure
export function normalizeReportSection(data: any): Array<{ label: string, value: string | string[] }> {
  if (data == null) return [];
  // If it's a string, return as a single value
  if (typeof data === 'string') {
    return [{ label: '', value: data }];
  }
  // If it's an array of strings, return as a list
  if (Array.isArray(data) && data.every(item => typeof item === 'string')) {
    return [{ label: '', value: data }];
  }
  // If it's an array of objects, flatten each object
  if (Array.isArray(data) && data.every(item => typeof item === 'object')) {
    return data.flatMap(item => normalizeReportSection(item));
  }
  // If it's an object, map each key to a label/value pair
  if (typeof data === 'object') {
    return Object.entries(data).map(([key, value]) => {
      // Recursively normalize nested objects/arrays
      if (typeof value === 'object' && value !== null) {
        // If value is an array of strings, show as list
        if (Array.isArray(value) && value.every(v => typeof v === 'string')) {
          return { label: key, value };
        }
        // If value is an object or array, flatten further
        return { label: key, value: JSON.stringify(value, null, 2) };
      }
      return { label: key, value: String(value) };
    });
  }
  // Fallback: stringify
  return [{ label: '', value: JSON.stringify(data) }];
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
