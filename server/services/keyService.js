import crypto from 'crypto';
import db from '../database.js';

import { generateApiKeyForPlan, generateVBitKey, PLAN_PREFIX_MAP } from '../generate_key.js';

export { generateApiKeyForPlan, generateVBitKey, PLAN_PREFIX_MAP };

export function generateApiKey(prefix = 'v-bit-', length = 32) {
  return generateVBitKey(prefix, length);
}

export function generateClientToken(prefix = 'tok_') {
  const randomHex = crypto.randomBytes(8).toString('hex');
  return `${prefix}${randomHex}`;
}

export function checkAndResetDailyQuotas() {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  try {
    const stmt = db.prepare(`
      UPDATE api_keys 
      SET today_requests = 0 
      WHERE last_used_at IS NOT NULL AND date(last_used_at) < date(?)
    `);
    stmt.run(todayStr);
  } catch (err) {
    console.error('Error resetting daily quotas:', err.message);
  }
}
