import { db } from '../config/db';

let configCache: Record<string, string> = {};
let lastFetch = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export const getConfig = async (key: string, defaultValue: string = ''): Promise<string> => {
  const now = Date.now();
  
  if (configCache[key] && (now - lastFetch < CACHE_TTL)) {
    return configCache[key]!;
  }

  try {
    const result = await db.query('SELECT value FROM config WHERE key = $1 LIMIT 1', [key]);
    
    if (result.rows.length === 0) {
      return defaultValue;
    }

    const value = result.rows[0].value;
    configCache[key] = value;
    lastFetch = now;
    return value;
  } catch (error) {
    console.error('Error fetching config:', error);
    return defaultValue;
  }
};


export const clearConfigCache = () => {
  configCache = {};
  lastFetch = 0;
};
