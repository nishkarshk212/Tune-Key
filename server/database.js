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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Column safety migrations
  try { db.exec("ALTER TABLE users ADD COLUMN is_banned INTEGER DEFAULT 0;"); } catch(e){}
  try { db.exec("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active';"); } catch(e){}
  try { db.exec("ALTER TABLE users ADD COLUMN avatar_url TEXT;"); } catch(e){}

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
      bot_type TEXT DEFAULT 'YukkiMusic Bot v3',
      daily_quota INTEGER DEFAULT 500,
      today_requests INTEGER DEFAULT 0,
      total_quota INTEGER DEFAULT 15000,
      used_quota INTEGER DEFAULT 0,
      rps_limit INTEGER DEFAULT 5,
      allowed_ips TEXT,
      expires_at DATETIME,
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

  // Seed Super-Admin if not existing
  const adminUser = db.prepare("SELECT id FROM users WHERE email = 'hakeebtravels@gmail.com'").get();
  if (!adminUser) {
    db.prepare(`
      INSERT INTO users (id, email, name, role, balance, is_banned, status, avatar_url)
      VALUES ('usr_admin_master', 'hakeebtravels@gmail.com', 'Mohammed Hakeeb', 'admin', 0.0, 0, 'active', 'https://api.dicebear.com/7.x/bottts/svg?seed=admin_master')
    `).run();
  }
}

export default db;
