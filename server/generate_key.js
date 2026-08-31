import crypto from 'crypto';

/**
 * Plan-to-Prefix mapping
 */
export const PLAN_PREFIX_MAP = {
  free: 'v-bit-free-',
  basic: 'v-bit-basic-',
  pro: 'v-bit-pro-',
  advanced: 'v-bit-adv-',
  unlimited: 'v-bit-unlimited-',
  trial: 'v-bit-trial-',
  custom: 'v-bit-'
};

/**
 * Plan Specifications with requested quotas
 */
export const PLAN_SPECS = {
  free: {
    tier: 'Free',
    name: 'FREE',
    price: 0,
    dailyQuota: 500,
    rps: 5,
    prefix: 'v-bit-free-'
  },
  basic: {
    tier: 'Basic',
    name: 'BASIC',
    price: 49,
    dailyQuota: 1000,
    rps: 10,
    prefix: 'v-bit-basic-'
  },
  pro: {
    tier: 'Pro',
    name: 'PRO',
    price: 99,
    dailyQuota: 1500,
    rps: 20,
    prefix: 'v-bit-pro-'
  },
  advanced: {
    tier: 'Advanced',
    name: 'ADVANCED',
    price: 149,
    dailyQuota: 2000,
    rps: 30,
    prefix: 'v-bit-adv-'
  },
  unlimited: {
    tier: 'Unlimited',
    name: 'UNLIMITED',
    price: 199,
    dailyQuota: 2500,
    rps: 50,
    prefix: 'v-bit-unlimited-'
  }
};

/**
 * Generate a Secure Random Alphanumeric String
 */
function getRandomAlphanumeric(length = 28) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars.charAt(bytes[i] % chars.length);
  }
  return result;
}

/**
 * Generate Custom API Key According to Plan
 * @param {string} planTier - 'free' | 'basic' | 'pro' | 'advanced' | 'unlimited' | 'trial'
 * @param {number} randomLength - Length of random token suffix (default: 28)
 */
export function generateApiKeyForPlan(planTier = 'pro', randomLength = 28) {
  const normalizedTier = (planTier || '').toLowerCase().trim();
  const prefix = PLAN_PREFIX_MAP[normalizedTier] || `v-bit-${normalizedTier}-`;
  const token = getRandomAlphanumeric(randomLength);
  return `${prefix}${token}`;
}

export function generateVBitKey(prefix = 'v-bit-', length = 32) {
  return `${prefix}${getRandomAlphanumeric(length)}`;
}

// Interactive CLI Execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const requestedTier = process.argv[2] ? process.argv[2].toLowerCase() : null;

  console.log('\n=============================================================');
  console.log('    🔑 VBIT-API-STORE: PLAN-SPECIFIC API KEY GENERATOR     ');
  console.log('=============================================================\n');

  if (requestedTier && (PLAN_SPECS[requestedTier] || PLAN_PREFIX_MAP[requestedTier])) {
    const spec = PLAN_SPECS[requestedTier] || { name: requestedTier.toUpperCase(), prefix: PLAN_PREFIX_MAP[requestedTier] };
    console.log(`Generating 5 Keys for [${spec.name || requestedTier.toUpperCase()}] Plan:`);
    console.log(`- Prefix: ${spec.prefix || `v-bit-${requestedTier}-`}`);
    console.log(`- Plan Price: ₹${spec.price || 0}/month | Daily Quota: ${spec.dailyQuota?.toLocaleString() || 500} req/day`);
    console.log('-------------------------------------------------------------');
    for (let i = 1; i <= 5; i++) {
      console.log(`Key ${i}: ${generateApiKeyForPlan(requestedTier)}`);
    }
  } else {
    console.log('Generating sample custom API keys across all 5 plans:\n');
    
    Object.keys(PLAN_SPECS).forEach((key) => {
      const plan = PLAN_SPECS[key];
      const sampleKey = generateApiKeyForPlan(key);
      console.log(`[${plan.name} PLAN - ₹${plan.price}/mo] (${plan.dailyQuota.toLocaleString()} requests/day, ${plan.rps} RPS):`);
      console.log(`👉 ${sampleKey}\n`);
    });

    console.log('-------------------------------------------------------------');
    console.log('💡 Tip: Run with a specific plan name:');
    console.log('   node server/generate_key.js free');
    console.log('   node server/generate_key.js basic');
    console.log('   node server/generate_key.js pro');
    console.log('   node server/generate_key.js advanced');
    console.log('   node server/generate_key.js unlimited');
  }
  console.log('\n=============================================================\n');
}

export default generateApiKeyForPlan;
