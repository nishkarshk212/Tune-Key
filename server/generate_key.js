import crypto from 'crypto';

/**
 * Custom API Key Generator for VBIT-API-STORE
 * Format: v-bit-[32-character secure alphanumeric token]
 */
export function generateVBitKey(prefix = 'v-bit-', length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars.charAt(bytes[i] % chars.length);
  }
  return `${prefix}${result}`;
}

// Generate sample keys if executed directly via CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('\n🔑 --- VBIT-API-STORE CUSTOM API KEY GENERATOR --- 🔑\n');
  for (let i = 1; i <= 5; i++) {
    console.log(`Key ${i}: ${generateVBitKey('v-bit-')}`);
  }
  console.log('\nPrefix Format: v-bit-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n');
}

export default generateVBitKey;
