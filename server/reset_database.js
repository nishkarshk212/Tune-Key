import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TURSO_URL = process.env.TURSO_DATABASE_URL || 'libsql://api-key-nssharma212.aws-ap-south-1.turso.io';
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODgxOTE4OTUsImlkIjoiMDFhMDU4ODYtY2MwMS03MzNmLTg0Y2QtN2MwNDMxODdhYzUyIiwia2lkIjoiaWpBTUxxVmQtTTM2bjFHQ3RmSVZQYmVEWjZFTGRnT2Q4ckd2QlRHQS0tWSIsInJpZCI6IjQwNTYyNWQ3LTlhYzItNDliYS1hMTQzLThmMmFlZmE3MzViZiJ9.Dw69FmQMOcUi96O423DssBCP0qCrUP601hOPbNfatHghzEQ3EMhdoyAyRwu5Cu7pfX0UvYNANsXZ6qZbaUEWAA';

const schemaStatements = [
  // 1. Drop existing tables
  `DROP TABLE IF EXISTS usage_logs;`,
  `DROP TABLE IF EXISTS system_logs;`,
  `DROP TABLE IF EXISTS api_keys;`,
  `DROP TABLE IF EXISTS orders;`,
  `DROP TABLE IF EXISTS plans;`,
  `DROP TABLE IF EXISTS users;`,

  // 2. Create users table
  `CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    avatar_url TEXT,
    balance REAL DEFAULT 0.0,
    is_banned INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`,

  // 3. Create plans table
  `CREATE TABLE plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tier TEXT NOT NULL,
    price REAL NOT NULL,
    billing_period TEXT DEFAULT 'monthly',
    daily_quota INTEGER NOT NULL,
    total_quota INTEGER NOT NULL,
    rps_limit INTEGER NOT NULL,
    max_keys INTEGER NOT NULL DEFAULT 1,
    features_json TEXT NOT NULL,
    is_popular INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`,

  // 4. Create api_keys table
  `CREATE TABLE api_keys (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    plan_id TEXT,
    key_name TEXT NOT NULL,
    api_key TEXT UNIQUE NOT NULL,
    client_token TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    daily_quota INTEGER NOT NULL DEFAULT 500,
    today_requests INTEGER DEFAULT 0,
    total_quota INTEGER NOT NULL DEFAULT 15000,
    used_quota INTEGER DEFAULT 0,
    rps_limit INTEGER DEFAULT 10,
    bot_type TEXT DEFAULT 'Telegram Music Bot (Dedicated)',
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans (id) ON DELETE SET NULL
  );`,

  // 5. Create orders table
  `CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'INR',
    payment_method TEXT NOT NULL,
    payment_status TEXT DEFAULT 'pending_verification',
    transaction_id TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans (id) ON DELETE CASCADE
  );`,

  // 6. Create usage_logs table
  `CREATE TABLE usage_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    api_key_id TEXT,
    endpoint TEXT NOT NULL,
    query TEXT,
    ip_address TEXT,
    user_agent TEXT,
    status_code INTEGER NOT NULL,
    response_time_ms REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    FOREIGN KEY (api_key_id) REFERENCES api_keys (id) ON DELETE SET NULL
  );`,

  // 7. Create system_logs table
  `CREATE TABLE system_logs (
    id TEXT PRIMARY KEY,
    level TEXT NOT NULL,
    category TEXT NOT NULL,
    message TEXT NOT NULL,
    details_json TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );`
];

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
    features_json: JSON.stringify(['500 Requests / day', '1 Dedicated API Key', 'Community Support', '98% Uptime']),
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
    features_json: JSON.stringify(['1,000 Requests / day', '1 Dedicated API Key', 'Standard Support', '99% Uptime']),
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
    features_json: JSON.stringify(['1,500 Requests / day', '1 Dedicated API Key', 'Priority Support', '99.9% Uptime']),
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
    features_json: JSON.stringify(['2,000 Requests / day', '1 Dedicated API Key', 'Priority Support', '99.9% Uptime']),
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
    features_json: JSON.stringify(['2,500 Requests / day', '1 Dedicated API Key', 'VIP Support', '99.9% Uptime']),
    is_popular: 0,
    is_active: 1
  }
];

async function resetDatabases() {
  console.log('🔄 Wiping and recreating fresh database...\n');

  // ==========================================
  // 1. Reset Local SQLite Database
  // ==========================================
  const localDbPath = path.join(__dirname, 'database.sqlite');
  if (fs.existsSync(localDbPath)) {
    fs.unlinkSync(localDbPath);
  }
  const walPath = path.join(__dirname, 'database.sqlite-wal');
  if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
  const shmPath = path.join(__dirname, 'database.sqlite-shm');
  if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);

  const localDb = new Database(localDbPath);
  console.log('📦 Recreating tables in local SQLite...');
  for (const stmt of schemaStatements) {
    localDb.exec(stmt);
  }

  // Seed plans in local DB
  const insertPlanLocal = localDb.prepare(`
    INSERT INTO plans (id, name, tier, price, billing_period, daily_quota, total_quota, rps_limit, max_keys, features_json, is_popular, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of plans) {
    insertPlanLocal.run(
      p.id, p.name, p.tier, p.price, p.billing_period,
      p.daily_quota, p.total_quota, p.rps_limit, p.max_keys,
      p.features_json, p.is_popular, p.is_active
    );
  }

  // Seed Super-Admin User
  localDb.prepare(`
    INSERT INTO users (id, email, name, role, balance, avatar_url)
    VALUES ('usr_admin_master', 'hakeebtravels@gmail.com', 'Mohammed Hakeeb', 'admin', 0.0, 'https://api.dicebear.com/7.x/bottts/svg?seed=admin_master')
  `).run();

  console.log('✅ Local SQLite database reset and seeded successfully!\n');

  // ==========================================
  // 2. Reset Turso Cloud Edge Database
  // ==========================================
  if (TURSO_URL && TURSO_TOKEN) {
    console.log(`🌐 Connecting to Turso Cloud at: ${TURSO_URL}`);
    const turso = createClient({
      url: TURSO_URL,
      authToken: TURSO_TOKEN
    });

    console.log('📦 Dropping old tables and creating clean tables in Turso Cloud...');
    for (const stmt of schemaStatements) {
      await turso.execute(stmt);
    }

    console.log('🌱 Seeding fresh plans into Turso Cloud...');
    for (const p of plans) {
      await turso.execute({
        sql: `
          INSERT INTO plans (id, name, tier, price, billing_period, daily_quota, total_quota, rps_limit, max_keys, features_json, is_popular, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          p.id, p.name, p.tier, p.price, p.billing_period,
          p.daily_quota, p.total_quota, p.rps_limit, p.max_keys,
          p.features_json, p.is_popular, p.is_active
        ]
      });
    }

    console.log('👑 Seeding super-admin into Turso Cloud...');
    await turso.execute({
      sql: `
        INSERT INTO users (id, email, name, role, balance, avatar_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      args: [
        'usr_admin_master',
        'hakeebtravels@gmail.com',
        'Mohammed Hakeeb',
        'admin',
        0.0,
        'https://api.dicebear.com/7.x/bottts/svg?seed=admin_master'
      ]
    });

    console.log('🎉 Turso Cloud Database successfully wiped and freshly re-created!\n');
  }

  console.log('✨ All databases are now 100% clean and fresh!');
}

resetDatabases().catch(console.error);
