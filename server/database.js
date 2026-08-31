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
      balance REAL DEFAULT 9.20,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

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
      max_keys INTEGER NOT NULL,
      features TEXT NOT NULL,
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
      client_token TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'active',
      bot_type TEXT DEFAULT 'YukkiMusic Bot',
      daily_quota INTEGER DEFAULT 50000,
      today_requests INTEGER DEFAULT 12450,
      used_quota INTEGER DEFAULT 342000,
      rps_limit INTEGER DEFAULT 30,
      allowed_ips TEXT,
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (plan_id) REFERENCES plans (id)
    );
  `);

  // 4. Usage Logs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS usage_logs (
      id TEXT PRIMARY KEY,
      key_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
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
      plan_name TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT DEFAULT 'completed',
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
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count === 0) {
    const salt = bcrypt.genSaltSync(10);
    const adminPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'Admin@Vbit2026', salt);

    // Seed Super Admin
    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, balance, status, avatar_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'usr_admin_001',
      'admin@vbitapistore.com',
      adminPassword,
      'Super Admin',
      'admin',
      1000.00,
      'active',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    );
  }

  // Always sync seed plans with Indian Rupee (INR) pricing and 1 API Key per plan
  const plans = [
    {
      id: 'plan_free',
      name: 'FREE',
      tier: 'Free',
      price: 0,
      billing_period: 'monthly',
      daily_quota: 500,
      total_quota: 15000,
      rps_limit: 5,
      max_keys: 1,
      features: JSON.stringify([
        '500 Requests / day',
        '1 Dedicated API Key',
        'Community Support',
        '98% Uptime'
      ]),
      is_popular: 0,
      is_active: 1
    },
    {
      id: 'plan_basic',
      name: 'BASIC',
      tier: 'Basic',
      price: 49,
      billing_period: 'monthly',
      daily_quota: 1000,
      total_quota: 30000,
      rps_limit: 10,
      max_keys: 1,
      features: JSON.stringify([
        '1,000 Requests / day',
        '1 Dedicated API Key',
        'Standard Support',
        '99% Uptime'
      ]),
      is_popular: 0,
      is_active: 1
    },
    {
      id: 'plan_pro',
      name: 'PRO',
      tier: 'Pro',
      price: 99,
      billing_period: 'monthly',
      daily_quota: 1500,
      total_quota: 45000,
      rps_limit: 20,
      max_keys: 1,
      features: JSON.stringify([
        '1,500 Requests / day',
        '1 Dedicated API Key',
        'Priority Support',
        '99.9% Uptime'
      ]),
      is_popular: 1,
      is_active: 1
    },
    {
      id: 'plan_advanced',
      name: 'ADVANCED',
      tier: 'Advanced',
      price: 149,
      billing_period: 'monthly',
      daily_quota: 2000,
      total_quota: 60000,
      rps_limit: 30,
      max_keys: 1,
      features: JSON.stringify([
        '2,000 Requests / day',
        '1 Dedicated API Key',
        'Priority Support',
        '99.9% Uptime'
      ]),
      is_popular: 0,
      is_active: 1
    },
    {
      id: 'plan_unlimited',
      name: 'UNLIMITED',
      tier: 'Unlimited',
      price: 199,
      billing_period: 'monthly',
      daily_quota: 2500,
      total_quota: 75000,
      rps_limit: 50,
      max_keys: 1,
      features: JSON.stringify([
        '2,500 Requests / day',
        '1 Dedicated API Key',
        'VIP Support',
        '99.9% Uptime'
      ]),
      is_popular: 0,
      is_active: 1
    }
  ];

  const insertPlan = db.prepare(`
    INSERT OR REPLACE INTO plans (id, name, tier, price, billing_period, daily_quota, total_quota, rps_limit, max_keys, features, is_popular, is_active)
    VALUES (@id, @name, @tier, @price, @billing_period, @daily_quota, @total_quota, @rps_limit, @max_keys, @features, @is_popular, @is_active)
  `);

  for (const p of plans) {
    insertPlan.run(p);
  }
}

export default db;
