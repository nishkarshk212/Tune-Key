import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.VERCEL
  ? path.join('/tmp', 'database.sqlite')
  : path.join(__dirname, 'database.sqlite');

const db = new Database(dbPath);

if (!process.env.VERCEL) {
  // Enable WAL mode for local high performance
  db.pragma('journal_mode = WAL');
}

export function initDatabase() {
  // 1. Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      avatar_url TEXT,
      balance REAL DEFAULT 0.0,
      is_banned INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      free_claimed INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Column safety migrations
  try { db.exec("ALTER TABLE users ADD COLUMN is_banned INTEGER DEFAULT 0;"); } catch(e){}
  try { db.exec("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active';"); } catch(e){}
  try { db.exec("ALTER TABLE users ADD COLUMN avatar_url TEXT;"); } catch(e){}
  try { db.exec("ALTER TABLE users ADD COLUMN free_claimed INTEGER DEFAULT 0;"); } catch(e){}

  // 2. Plans Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      tier TEXT NOT NULL,
      price REAL NOT NULL,
      billing_period TEXT DEFAULT 'monthly',
      daily_quota INTEGER NOT NULL,
      total_quota INTEGER NOT NULL,
      rps_limit INTEGER NOT NULL,
      max_keys INTEGER NOT NULL DEFAULT 1,
      features_json TEXT,
      is_popular INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. API Keys Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan_id TEXT,
      key_name TEXT NOT NULL,
      api_key TEXT UNIQUE NOT NULL,
      client_token TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      type TEXT DEFAULT 'free',
      bot_type TEXT DEFAULT 'YukkiMusic Bot v3',
      daily_quota INTEGER DEFAULT 500,
      today_requests INTEGER DEFAULT 0,
      total_quota INTEGER DEFAULT 15000,
      used_quota INTEGER DEFAULT 0,
      rps_limit INTEGER DEFAULT 5,
      allowed_ips TEXT,
      purchase_date DATETIME,
      expires_at DATETIME,
      regeneration_count INTEGER DEFAULT 0,
      last_used_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (plan_id) REFERENCES plans (id)
    );
  `);

  // Key safety migrations
  try { db.exec("ALTER TABLE api_keys ADD COLUMN last_used_at DATETIME;"); } catch(e){}
  try { db.exec("ALTER TABLE api_keys ADD COLUMN bot_type TEXT DEFAULT 'YukkiMusic Bot v3';"); } catch(e){}
  try { db.exec("ALTER TABLE api_keys ADD COLUMN allowed_ips TEXT;"); } catch(e){}
  try { db.exec("ALTER TABLE api_keys ADD COLUMN type TEXT DEFAULT 'free';"); } catch(e){}
  try { db.exec("ALTER TABLE api_keys ADD COLUMN purchase_date DATETIME;"); } catch(e){}
  try { db.exec("ALTER TABLE api_keys ADD COLUMN regeneration_count INTEGER DEFAULT 0;"); } catch(e){}

  // Plans safety migrations
  try { db.exec("ALTER TABLE plans ADD COLUMN is_popular INTEGER DEFAULT 0;"); } catch(e){}
  try { db.exec("ALTER TABLE plans ADD COLUMN is_active INTEGER DEFAULT 1;"); } catch(e){}
  try { db.exec("ALTER TABLE plans ADD COLUMN features_json TEXT;"); } catch(e){}
  try { db.exec("ALTER TABLE plans ADD COLUMN rps_limit INTEGER DEFAULT 15;"); } catch(e){}
  try { db.exec("ALTER TABLE plans ADD COLUMN daily_quota INTEGER DEFAULT 1500;"); } catch(e){}
  try { db.exec("ALTER TABLE plans ADD COLUMN total_quota INTEGER DEFAULT 45000;"); } catch(e){}

  // 4. Usage Logs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS usage_logs (
      id TEXT PRIMARY KEY,
      key_id TEXT,
      user_id TEXT,
      endpoint TEXT NOT NULL,
      query TEXT,
      status_code INTEGER NOT NULL,
      latency_ms INTEGER NOT NULL,
      ip_address TEXT,
      bot_agent TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (key_id) REFERENCES api_keys (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
  `);

  // 5. Orders & Payments Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      plan_name TEXT,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'INR',
      payment_method TEXT NOT NULL,
      payment_status TEXT DEFAULT 'pending_verification',
      transaction_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (plan_id) REFERENCES plans (id)
    );
  `);

  // 6. Password Reset Tokens Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      token TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 7. Site Settings Table (Dynamic UPI ID, QR, instructions)
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 8. Services Table (API Services Management)
  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      requests_per_day INTEGER DEFAULT 1000,
      requests_per_month INTEGER DEFAULT 30000,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedData();
}

function seedData() {
  const planCount = db.prepare('SELECT COUNT(*) as count FROM plans').get();
  if (planCount.count === 0) {
    const insertPlan = db.prepare(`
      INSERT INTO plans (id, name, tier, price, billing_period, daily_quota, total_quota, rps_limit, max_keys, features_json, is_popular, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const defaultPlans = [
      ['plan_free', 'FREE', 'Free', 0, 'monthly', 500, 15000, 5, 1, JSON.stringify(['500 Requests / day', '1 Key', 'Community Support']), 0, 1],
      ['plan_basic', 'BASIC', 'Basic', 49, 'monthly', 1000, 30000, 10, 1, JSON.stringify(['1,000 Requests / day', '1 Key', 'Standard Support']), 0, 1],
      ['plan_pro', 'PRO', 'Pro', 99, 'monthly', 1500, 45000, 20, 1, JSON.stringify(['1,500 Requests / day', '1 Key', 'Priority Support']), 1, 1],
      ['plan_advanced', 'ADVANCED', 'Advanced', 149, 'monthly', 2000, 60000, 30, 1, JSON.stringify(['2,000 Requests / day', '1 Key', 'Priority Support']), 0, 1],
      ['plan_unlimited', 'UNLIMITED', 'Unlimited', 199, 'monthly', 2500, 75000, 50, 1, JSON.stringify(['2,500 Requests / day', '1 Key', 'VIP Support']), 0, 1],
    ];

    for (const p of defaultPlans) {
      insertPlan.run(...p);
    }
  }

  // Ensure wallet_deposit plan entry exists
  const walletPlan = db.prepare("SELECT id FROM plans WHERE id = 'wallet_deposit'").get();
  if (!walletPlan) {
    try {
      db.prepare(`
        INSERT INTO plans (id, name, tier, price, billing_period, daily_quota, total_quota, rps_limit, max_keys, features_json, is_popular, is_active)
        VALUES ('wallet_deposit', 'Wallet Top-Up', 'Wallet', 0, 'onetime', 0, 0, 0, 0, '[]', 0, 0)
      `).run();
    } catch(e) {}
  }

  // Seed default site settings
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM site_settings').get();
  if (settingsCount.count === 0) {
    const insertSetting = db.prepare('INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)');
    insertSetting.run('upi_id', 'mohammadhakeeb@fam');
    insertSetting.run('merchant_name', 'Mohammed Hakeeb');
    insertSetting.run('qr_url', '/assets/paytm_qr.jpg');
    insertSetting.run('payment_instructions', 'Scan with any UPI app (Paytm, Google Pay, PhonePe, BHIM, Cred) and submit your 12-digit UTR transaction number.');
    insertSetting.run('admin_username', 'admin');
  }

  // Seed default services if empty
  const serviceCount = db.prepare('SELECT COUNT(*) as count FROM services').get();
  if (serviceCount.count === 0) {
    const insertService = db.prepare(`
      INSERT INTO services (id, name, description, price, requests_per_day, requests_per_month, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertService.run('srv_yt_stream', 'YouTube Audio Stream Engine', 'Ultra-fast direct 160kbps Opus audio stream extraction for Telegram Voice Chats', 99, 1500, 45000, 1);
    insertService.run('srv_yt_search', 'YouTube Search & Metadata API', 'Fast video/audio search with title, duration, views, thumbnails, and channel info', 49, 1000, 30000, 1);
    insertService.run('srv_yt_lyrics', 'Track Lyrics & Translation API', 'Multi-language lyrics scraper and subtitle translator for music players', 49, 1000, 30000, 1);
  }

  // Seed Super-Admin accounts
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);
  
  // Seed admin@vbit.io
  const defaultAdmin = db.prepare("SELECT id FROM users WHERE email = 'admin@vbit.io' OR email = 'admin'").get();
  if (!defaultAdmin) {
    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, balance, is_banned, status, avatar_url)
      VALUES ('usr_admin_default', 'admin@vbit.io', ?, 'Administrator', 'admin', 0.0, 0, 'active', 'https://api.dicebear.com/7.x/bottts/svg?seed=admin_master')
    `).run(adminPasswordHash);
  }

  // Also ensure hakeebtravels@gmail.com has admin password
  const hakeebAdmin = db.prepare("SELECT id FROM users WHERE email = 'hakeebtravels@gmail.com'").get();
  if (!hakeebAdmin) {
    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, balance, is_banned, status, avatar_url)
      VALUES ('usr_admin_master', 'hakeebtravels@gmail.com', ?, 'Mohammed Hakeeb', 'admin', 0.0, 0, 'active', 'https://api.dicebear.com/7.x/bottts/svg?seed=admin_master')
    `).run(adminPasswordHash);
  } else {
    // Ensure password matches admin123 if needed
    db.prepare("UPDATE users SET password_hash = ? WHERE email = 'hakeebtravels@gmail.com'").run(adminPasswordHash);
  }
}

export default db;
