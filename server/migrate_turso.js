import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const url = process.env.TURSO_DATABASE_URL || 'libsql://api-key-nssharma212.aws-ap-south-1.turso.io';
const authToken = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODgxOTE4OTUsImlkIjoiMDFhMDU4ODYtY2MwMS03MzNmLTg0Y2QtN2MwNDMxODdhYzUyIiwia2lkIjoiaWpBTUxxVmQtTTM2bjFHQ3RmSVZQYmVEWjZFTGRnT2Q4ckd2QlRHQS0tWSIsInJpZCI6IjQwNTYyNWQ3LTlhYzItNDliYS1hMTQzLThmMmFlZmE3MzViZiJ9.Dw69FmQMOcUi96O423DssBCP0qCrUP601hOPbNfatHghzEQ3EMhdoyAyRwu5Cu7pfX0UvYNANsXZ6qZbaUEWAA';

console.log('Connecting to Turso at:', url);

const client = createClient({ url, authToken });

async function initTurso() {
  console.log('Creating tables on Turso cloud...');

  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      name TEXT,
      role TEXT DEFAULT 'user',
      balance REAL DEFAULT 0.00,
      status TEXT DEFAULT 'active',
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      tier TEXT NOT NULL,
      price REAL NOT NULL,
      billing_period TEXT DEFAULT 'monthly',
      daily_quota INTEGER NOT NULL,
      total_quota INTEGER NOT NULL,
      rps_limit INTEGER DEFAULT 30,
      max_keys INTEGER DEFAULT 1,
      features TEXT,
      is_popular INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      key_name TEXT DEFAULT 'Bot API Key',
      api_key TEXT UNIQUE NOT NULL,
      client_token TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'active',
      bot_type TEXT DEFAULT 'Custom Music Bot',
      daily_quota INTEGER DEFAULT 50000,
      today_requests INTEGER DEFAULT 0,
      used_quota INTEGER DEFAULT 0,
      rps_limit INTEGER DEFAULT 30,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      last_used_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (plan_id) REFERENCES plans(id)
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS usage_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      status_code INTEGER NOT NULL,
      response_time_ms INTEGER,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (key_id) REFERENCES api_keys(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      plan_name TEXT,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'INR',
      payment_method TEXT,
      payment_status TEXT DEFAULT 'pending',
      transaction_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (plan_id) REFERENCES plans(id)
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS system_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level TEXT NOT NULL,
      message TEXT NOT NULL,
      meta TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('✅ Tables created successfully!');

  // Seed INR Plans
  console.log('Seeding plans into Turso...');
  const plans = [
    {
      id: 'plan_basic',
      name: 'BASIC',
      tier: 'Basic',
      price: 49,
      billing_period: 'monthly',
      daily_quota: 10000,
      total_quota: 300000,
      rps_limit: 10,
      max_keys: 1,
      features: JSON.stringify(['10,000 Requests / day', '1 Dedicated API Key', 'Standard Support', '99% Uptime']),
      is_popular: 0,
      is_active: 1
    },
    {
      id: 'plan_pro',
      name: 'PRO',
      tier: 'Pro',
      price: 99,
      billing_period: 'monthly',
      daily_quota: 50000,
      total_quota: 1500000,
      rps_limit: 30,
      max_keys: 1,
      features: JSON.stringify(['50,000 Requests / day', '1 Dedicated API Key', 'Priority Support', '99.9% Uptime']),
      is_popular: 1,
      is_active: 1
    },
    {
      id: 'plan_advanced',
      name: 'ADVANCED',
      tier: 'Advanced',
      price: 149,
      billing_period: 'monthly',
      daily_quota: 150000,
      total_quota: 4500000,
      rps_limit: 60,
      max_keys: 1,
      features: JSON.stringify(['150,000 Requests / day', '1 Dedicated API Key', 'Priority Support', '99.9% Uptime']),
      is_popular: 0,
      is_active: 1
    },
    {
      id: 'plan_unlimited',
      name: 'UNLIMITED',
      tier: 'Unlimited',
      price: 199,
      billing_period: 'monthly',
      daily_quota: 1000000,
      total_quota: 30000000,
      rps_limit: 120,
      max_keys: 1,
      features: JSON.stringify(['Unlimited Requests', '1 Dedicated API Key', 'VIP Support', '99.9% Uptime']),
      is_popular: 0,
      is_active: 1
    }
  ];

  for (const p of plans) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO plans (id, name, tier, price, billing_period, daily_quota, total_quota, rps_limit, max_keys, features, is_popular, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [p.id, p.name, p.tier, p.price, p.billing_period, p.daily_quota, p.total_quota, p.rps_limit, p.max_keys, p.features, p.is_popular, p.is_active]
    });
  }

  // Seed Super Admin if none exists
  const existingUsers = await client.execute('SELECT COUNT(*) as count FROM users');
  if (existingUsers.rows[0].count === 0) {
    const salt = bcrypt.genSaltSync(10);
    const adminPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'Admin@Vbit2026', salt);

    await client.execute({
      sql: `INSERT INTO users (id, email, password_hash, name, role, balance, status, avatar_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'usr_admin_001',
        'admin@vbitapistore.com',
        adminPassword,
        'Super Admin',
        'admin',
        1000.00,
        'active',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
      ]
    });
    console.log('✅ Super Admin seeded (admin@vbitapistore.com)');
  }

  console.log('🎉 Turso migration & seeding complete!');
}

initTurso().catch(console.error);
