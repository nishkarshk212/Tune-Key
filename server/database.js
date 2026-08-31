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
    const adminPassword = bcrypt.hashSync('Admin@1234', salt);
    const demoPassword = bcrypt.hashSync('Demo@1234', salt);

    // Seed Admin
    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, balance, status, avatar_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'usr_admin_001',
      'admin@ytkey.io',
      adminPassword,
      'Super Admin',
      'admin',
      500.00,
      'active',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    );

    // Seed Nishkarsh (Demo User)
    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, balance, status, avatar_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'usr_demo_001',
      'demo@ytkey.io',
      demoPassword,
      'Nishkarsh',
      'user',
      9.20,
      'active',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
    );
  }

  // Always sync seed plans to match YTKey.io mockup
  const planCount = db.prepare('SELECT COUNT(*) as count FROM plans').get();
  if (planCount.count === 0) {
    const plans = [
      {
        id: 'plan_basic',
        name: 'BASIC',
        tier: 'Basic',
        price: 4.99,
        billing_period: 'monthly',
        daily_quota: 10000,
        total_quota: 300000,
        rps_limit: 10,
        max_keys: 1,
        features: JSON.stringify([
          '10,000 Requests / day',
          '1 API Key',
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
        price: 9.99,
        billing_period: 'monthly',
        daily_quota: 50000,
        total_quota: 1500000,
        rps_limit: 30,
        max_keys: 3,
        features: JSON.stringify([
          '50,000 Requests / day',
          '3 API Keys',
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
        price: 19.99,
        billing_period: 'monthly',
        daily_quota: 150000,
        total_quota: 4500000,
        rps_limit: 60,
        max_keys: 10,
        features: JSON.stringify([
          '150,000 Requests / day',
          '10 API Keys',
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
        price: 39.99,
        billing_period: 'monthly',
        daily_quota: 1000000,
        total_quota: 30000000,
        rps_limit: 120,
        max_keys: 999,
        features: JSON.stringify([
          'Unlimited Requests',
          'Unlimited API Keys',
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

  // Seed sample keys for Nishkarsh
  const keyCount = db.prepare('SELECT COUNT(*) as count FROM api_keys').get();
  if (keyCount.count === 0) {
    const insertKey = db.prepare(`
      INSERT INTO api_keys (id, user_id, plan_id, key_name, api_key, client_token, status, bot_type, daily_quota, today_requests, used_quota, rps_limit, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '+28 days'))
    `);

    insertKey.run(
      'key_demo_001',
      'usr_demo_001',
      'plan_pro',
      'Main Bot Key',
      'yt_live_7f8a3c9b1e2d4f5a6b7c8d9e0f1a2b3c',
      'tok_live_c1a89f0e3412',
      'active',
      'YukkiMusic Bot v3',
      50000,
      12450,
      348000,
      30
    );

    insertKey.run(
      'key_demo_002',
      'usr_demo_001',
      'plan_pro',
      'Backup Key',
      'yt_live_9c3b8a1e4f2d5a6b7c8d9e0f1a2b3c4d',
      'tok_live_d2b90e1f4523',
      'active',
      'AnonXMusic Bot',
      50000,
      2300,
      89000,
      30
    );

    insertKey.run(
      'key_demo_003',
      'usr_demo_001',
      'plan_pro',
      'Test Key',
      'yt_live_a1d94f2e3b5a6c7d8e9f0a1b2c3d4e5f',
      'tok_live_e3c01f2a5634',
      'inactive',
      'PyTgCalls Voice Client',
      50000,
      0,
      14200,
      30
    );

    // Seed Sample Orders
    const insertOrder = db.prepare(`
      INSERT INTO orders (id, user_id, plan_id, plan_name, amount, payment_method, payment_status, transaction_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertOrder.run(
      'ord_9901',
      'usr_demo_001',
      'plan_pro',
      'Pro Plan',
      9.99,
      'UPI / Card',
      'completed',
      'tx_stripe_9901238'
    );
  }
}

export default db;
