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
