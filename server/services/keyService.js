import crypto from 'crypto';
import db from '../database.js';

export function generateApiKey(prefix = 'v-bit-', length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars.charAt(bytes[i] % chars.length);
  }
  return `${prefix}${result}`;
}

export function generateClientToken(prefix = 'tok_') {
  const randomHex = crypto.randomBytes(8).toString('hex');
  return `${prefix}${randomHex}`;
}

export function checkAndResetDailyQuotas() {
  // If last reset was on a previous UTC day, reset today_requests to 0
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  const stmt = db.prepare(`
    UPDATE api_keys 
    SET today_requests = 0 
    WHERE strftime('%Y-%m-%d', updated_at) < ?
  `);
  
  stmt.run(todayStr);
}
