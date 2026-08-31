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
