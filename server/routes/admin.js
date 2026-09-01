import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { generateApiKeyForPlan, generateClientToken } from '../services/keyService.js';

const router = express.Router();

// Admin Guard applied to all routes in this router
router.use(authenticateToken, requireAdmin);

// Overview Dashboard Statistics
router.get('/overview', (req, res) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const totalKeys = db.prepare('SELECT COUNT(*) as count FROM api_keys').get().count;
    const activeKeys = db.prepare("SELECT COUNT(*) as count FROM api_keys WHERE status = 'active'").get().count;
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    
    const revenueResult = db.prepare("SELECT SUM(amount) as total FROM orders WHERE payment_status = 'completed'").get();
    const totalRevenue = revenueResult?.total || 0;

    const totalApiRequests = db.prepare('SELECT COUNT(*) as count FROM usage_logs').get().count;
    const todayRequests = db.prepare('SELECT SUM(today_requests) as sum FROM api_keys').get().sum || 0;

    // Recent orders
    const recentOrders = db.prepare(`
      SELECT o.*, u.email as user_email, u.name as user_name, p.name as plan_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN plans p ON o.plan_id = p.id
      ORDER BY o.created_at DESC LIMIT 10
    `).all();

    // Recent system logs
    const recentLogs = db.prepare(`
      SELECT l.*, u.email as user_email, k.key_name
      FROM usage_logs l
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN api_keys k ON l.api_key_id = k.id
      ORDER BY l.timestamp DESC LIMIT 15
    `).all();

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalKeys,
        activeKeys,
        totalOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalApiRequests,
        todayRequests,
        upstreamQuotaHealth: 98.4,
        activeProxyNodes: 12
      },
      recentOrders,
      recentLogs
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch admin overview' });
  }
});

// Get Users List
router.get('/users', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT u.id, u.email, u.name, u.role, u.balance, u.is_banned, u.created_at,
             COUNT(k.id) as keys_count,
             COALESCE(SUM(k.used_quota), 0) as total_used_quota
      FROM users u
      LEFT JOIN api_keys k ON u.id = k.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `).all();

    return res.json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to load users' });
  }
});

// Toggle User Ban / Suspension Status
router.patch('/users/:id/ban', (req, res) => {
  try {
    const { id } = req.params;
    const user = db.prepare('SELECT id, is_banned, role FROM users WHERE id = ?').get(id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, error: 'Cannot suspend an administrator account.' });
    }

    const newBanStatus = user.is_banned ? 0 : 1;
    db.prepare('UPDATE users SET is_banned = ? WHERE id = ?').run(newBanStatus, id);

    return res.json({
      success: true,
      message: `User account has been ${newBanStatus ? 'suspended' : 'activated'}.`,
      is_banned: newBanStatus
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update user status' });
  }
});

// Update User Balance / Quota
router.patch('/users/:id/balance', (req, res) => {
  try {
    const { id } = req.params;
    const { balance } = req.body;

    if (balance === undefined || isNaN(balance)) {
      return res.status(400).json({ success: false, error: 'Valid numeric balance is required' });
    }

    db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(parseFloat(balance), id);
    return res.json({ success: true, message: 'User balance updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update balance' });
  }
});

// Get Global API Keys List
router.get('/keys', (req, res) => {
  try {
    const keys = db.prepare(`
      SELECT k.*, u.email as user_email, u.name as user_name, p.name as plan_name
      FROM api_keys k
      JOIN users u ON k.user_id = u.id
      LEFT JOIN plans p ON k.plan_id = p.id
      ORDER BY k.created_at DESC
    `).all();

    return res.json({ success: true, keys });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch global keys' });
  }
});

// Update Key Quotas / Expiration by Admin
router.put('/keys/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status, daily_quota, total_quota, rps_limit, expires_at } = req.body;

    db.prepare(`
      UPDATE api_keys
      SET status = COALESCE(?, status),
          daily_quota = COALESCE(?, daily_quota),
          total_quota = COALESCE(?, total_quota),
          rps_limit = COALESCE(?, rps_limit),
          expires_at = COALESCE(?, expires_at)
      WHERE id = ?
    `).run(status, daily_quota, total_quota, rps_limit, expires_at, id);

    return res.json({ success: true, message: 'API Key rules updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update key' });
  }
});

// Get Global Orders
router.get('/orders', (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT o.*, u.email as user_email, u.name as user_name, p.name as plan_name, p.tier as plan_tier, p.daily_quota, p.total_quota, p.rps_limit
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN plans p ON o.plan_id = p.id
      ORDER BY o.created_at DESC
    `).all();

    return res.json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to load orders' });
  }
});

// Approve Manual UTR Payment & Automatically Provision Key
router.post('/orders/:id/approve', (req, res) => {
  try {
    const { id } = req.params;

    const order = db.prepare(`
      SELECT o.*, u.id as user_id, u.email as user_email, u.name as user_name,
             p.id as plan_id, p.name as plan_name, p.tier as plan_tier,
             p.daily_quota, p.total_quota, p.rps_limit, p.billing_period
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN plans p ON o.plan_id = p.id
      WHERE o.id = ?
    `).get(id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (order.payment_status === 'completed') {
      return res.status(400).json({ success: false, error: 'This order is already approved and completed.' });
    }

    // 1. Mark order completed
    db.prepare("UPDATE orders SET payment_status = 'completed' WHERE id = ?").run(id);

    // If this is a wallet deposit, credit user balance
    if (!order.plan_id || order.plan_id === 'wallet_deposit') {
      db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(order.amount, order.user_id);
      return res.json({
        success: true,
        message: `Wallet deposit of ₹${order.amount} approved and credited to ${order.user_email}!`
      });
    }

    // 2. Generate and provision high-quota API Key
    const apiKey = generateApiKeyForPlan(order.plan_tier || order.plan_name);
    const clientToken = generateClientToken();
    const keyId = `key_${uuidv4().replace(/-/g, '').slice(0, 10)}`;

    const expires = new Date();
    expires.setDate(expires.getDate() + (order.billing_period === 'yearly' ? 365 : 30));

    db.prepare(`
      INSERT INTO api_keys (
        id, user_id, plan_id, key_name, api_key, client_token, status,
        daily_quota, total_quota, rps_limit, bot_type, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, 'Telegram Music Bot (Dedicated)', ?)
    `).run(
      keyId,
      order.user_id,
      order.plan_id,
      `${order.plan_name} Key (Approved)`,
      apiKey,
      clientToken,
      order.daily_quota,
      order.total_quota,
      order.rps_limit,
      expires.toISOString()
    );

    const createdKey = db.prepare('SELECT * FROM api_keys WHERE id = ?').get(keyId);

    return res.json({
      success: true,
      message: `Order approved successfully! API Key [${apiKey}] provisioned for ${order.user_email}.`,
      apiKey: createdKey
    });
  } catch (error) {
    console.error('Approve order error:', error);
    return res.status(500).json({ success: false, error: 'Failed to approve order' });
  }
});

// Reject Manual UTR Payment
router.post('/orders/:id/reject', (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    db.prepare("UPDATE orders SET payment_status = 'rejected' WHERE id = ?").run(id);

    return res.json({
      success: true,
      message: `Order rejected. Reason: ${reason || 'Invalid UTR / Payment not received.'}`
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to reject order' });
  }
});

// Plans Management (Create & Edit)
router.post('/plans', (req, res) => {
  try {
    const { name, tier, price, daily_quota, total_quota, rps_limit, concurrency, features, is_popular } = req.body;
    const planId = `plan_${uuidv4().replace(/-/g, '').slice(0, 8)}`;

    db.prepare(`
      INSERT INTO plans (id, name, tier, price, daily_quota, total_quota, rps_limit, concurrency, features_json, is_popular)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      planId,
      name,
      tier || 'pro',
      parseFloat(price),
      parseInt(daily_quota),
      parseInt(total_quota),
      parseInt(rps_limit || 15),
      parseInt(concurrency || 5),
      JSON.stringify(features || []),
      is_popular ? 1 : 0
    );

    return res.status(201).json({ success: true, message: 'Plan created successfully', planId });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to create plan' });
  }
});

router.put('/plans/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, daily_quota, total_quota, rps_limit, concurrency, features, is_popular, is_active } = req.body;

    db.prepare(`
      UPDATE plans
      SET name = COALESCE(?, name),
          price = COALESCE(?, price),
          daily_quota = COALESCE(?, daily_quota),
          total_quota = COALESCE(?, total_quota),
          rps_limit = COALESCE(?, rps_limit),
          concurrency = COALESCE(?, concurrency),
          features_json = COALESCE(?, features_json),
          is_popular = COALESCE(?, is_popular),
          is_active = COALESCE(?, is_active)
      WHERE id = ?
    `).run(
      name,
      price !== undefined ? parseFloat(price) : null,
      daily_quota !== undefined ? parseInt(daily_quota) : null,
      total_quota !== undefined ? parseInt(total_quota) : null,
      rps_limit !== undefined ? parseInt(rps_limit) : null,
      concurrency !== undefined ? parseInt(concurrency) : null,
      features ? JSON.stringify(features) : null,
      is_popular !== undefined ? (is_popular ? 1 : 0) : null,
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      id
    );

    return res.json({ success: true, message: 'Plan updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update plan' });
  }
});

// System Query Logs
router.get('/logs', (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '100');
    const logs = db.prepare(`
      SELECT l.*, u.email as user_email, k.key_name, k.api_key
      FROM usage_logs l
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN api_keys k ON l.api_key_id = k.id
      ORDER BY l.timestamp DESC LIMIT ?
    `).all(limit);

    return res.json({ success: true, logs });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch logs' });
  }
});

export default router;
