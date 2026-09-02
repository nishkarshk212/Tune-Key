import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { generateApiKeyForPlan, generateApiKey, generateClientToken } from '../services/keyService.js';

const router = express.Router();

// Admin Guard applied to all routes in this router
router.use(authenticateToken, requireAdmin);

// 1. Overview Dashboard Statistics (7 KPI Cards)
router.get('/overview', (req, res) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE role != "admin"').get()?.count || 0;
    const activeUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE role != "admin" AND is_banned = 0').get()?.count || 0;
    const totalKeys = db.prepare('SELECT COUNT(*) as count FROM api_keys').get()?.count || 0;
    const activeKeys = db.prepare("SELECT COUNT(*) as count FROM api_keys WHERE status = 'active'").get()?.count || 0;
    
    const pendingPayments = db.prepare("SELECT COUNT(*) as count FROM orders WHERE payment_status = 'pending_verification'").get()?.count || 0;
    const approvedPayments = db.prepare("SELECT COUNT(*) as count FROM orders WHERE payment_status = 'completed'").get()?.count || 0;
    
    const revenueResult = db.prepare("SELECT SUM(amount) as total FROM orders WHERE payment_status = 'completed'").get();
    const totalRevenue = revenueResult?.total || 0;

    const totalApiRequests = db.prepare('SELECT COUNT(*) as count FROM usage_logs').get()?.count || 0;
    const todayRequests = db.prepare('SELECT SUM(today_requests) as sum FROM api_keys').get()?.sum || 0;

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
        activeUsers,
        totalKeys,
        activeKeys,
        pendingPayments,
        approvedPayments,
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

// 2. User Management
router.get('/users', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT u.id, u.email, u.name, u.role, u.balance, u.is_banned, u.status, u.free_claimed, u.created_at,
             COUNT(k.id) as keys_count,
             COALESCE(SUM(k.used_quota), 0) as total_used_quota,
             (SELECT p.name FROM api_keys ak JOIN plans p ON ak.plan_id = p.id WHERE ak.user_id = u.id AND ak.status = 'active' ORDER BY ak.created_at DESC LIMIT 1) as current_plan
      FROM users u
      LEFT JOIN api_keys k ON u.id = k.user_id
      WHERE u.role != 'admin' OR u.email != 'admin'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `).all();

    return res.json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to load users' });
  }
});

router.get('/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const user = db.prepare('SELECT id, email, name, role, balance, is_banned, status, free_claimed, created_at FROM users WHERE id = ?').get(id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const keys = db.prepare('SELECT k.*, p.name as plan_name FROM api_keys k LEFT JOIN plans p ON k.plan_id = p.id WHERE k.user_id = ?').all(id);
    const orders = db.prepare('SELECT o.*, p.name as plan_name FROM orders o LEFT JOIN plans p ON o.plan_id = p.id WHERE o.user_id = ? ORDER BY o.created_at DESC').all(id);

    return res.json({ success: true, user, keys, orders });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch user profile' });
  }
});

router.patch('/users/:id/ban', (req, res) => {
  try {
    const { id } = req.params;
    const user = db.prepare('SELECT id, is_banned, role FROM users WHERE id = ?').get(id);
    
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, error: 'Cannot suspend an administrator account.' });

    const newBanStatus = user.is_banned ? 0 : 1;
    const newStatus = newBanStatus ? 'suspended' : 'active';
    db.prepare('UPDATE users SET is_banned = ?, status = ? WHERE id = ?').run(newBanStatus, newStatus, id);

    return res.json({
      success: true,
      message: `User account has been ${newBanStatus ? 'deactivated/suspended' : 'activated'}.`,
      is_banned: newBanStatus,
      status: newStatus
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update user status' });
  }
});

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

// 3. API Key & Subscription Management
router.get('/keys', (req, res) => {
  try {
    const keys = db.prepare(`
      SELECT k.*, u.email as user_email, u.name as user_name, p.name as plan_name, p.tier as plan_tier
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

router.put('/keys/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status, daily_quota, total_quota, rps_limit, expires_at, key_name } = req.body;

    db.prepare(`
      UPDATE api_keys
      SET status = COALESCE(?, status),
          daily_quota = COALESCE(?, daily_quota),
          total_quota = COALESCE(?, total_quota),
          rps_limit = COALESCE(?, rps_limit),
          expires_at = COALESCE(?, expires_at),
          key_name = COALESCE(?, key_name)
      WHERE id = ?
    `).run(status, daily_quota, total_quota, rps_limit, expires_at, key_name, id);

    return res.json({ success: true, message: 'API Key rules updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update key' });
  }
});

router.post('/keys/:id/regenerate', (req, res) => {
  try {
    const { id } = req.params;
    const key = db.prepare('SELECT * FROM api_keys WHERE id = ?').get(id);
    if (!key) return res.status(404).json({ success: false, error: 'API key not found' });

    const newApiKey = generateApiKey();
    const newClientToken = generateClientToken();

    db.prepare(`
      UPDATE api_keys
      SET api_key = ?, client_token = ?, status = 'active', regeneration_count = COALESCE(regeneration_count, 0) + 1
      WHERE id = ?
    `).run(newApiKey, newClientToken, id);

    return res.json({
      success: true,
      message: 'API Key regenerated successfully. Expiration date retained.',
      api_key: newApiKey
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to regenerate key' });
  }
});

router.post('/keys/:id/extend', (req, res) => {
  try {
    const { id } = req.params;
    const { days = 30 } = req.body;
    const key = db.prepare('SELECT * FROM api_keys WHERE id = ?').get(id);
    if (!key) return res.status(404).json({ success: false, error: 'API key not found' });

    const currentExpiry = key.expires_at ? new Date(key.expires_at) : new Date();
    const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
    baseDate.setDate(baseDate.getDate() + parseInt(days));

    db.prepare("UPDATE api_keys SET expires_at = ?, status = 'active' WHERE id = ?").run(baseDate.toISOString(), id);

    return res.json({
      success: true,
      message: `Subscription extended by ${days} days. New expiry: ${baseDate.toLocaleDateString()}`,
      expires_at: baseDate.toISOString()
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to extend subscription' });
  }
});

// 4. Payment Settings (UPI ID, QR, Instructions)
router.get('/payment-settings', (req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM site_settings').all();
    const settings = {};
    for (const r of rows) settings[r.key] = r.value;

    return res.json({
      success: true,
      settings: {
        upi_id: settings.upi_id || 'mohammadhakeeb@fam',
        merchant_name: settings.merchant_name || 'Mohammed Hakeeb',
        qr_url: settings.qr_url || '/assets/paytm_qr.jpg',
        payment_instructions: settings.payment_instructions || 'Scan with any UPI app (Paytm, Google Pay, PhonePe, BHIM, Cred) and submit your 12-digit UTR transaction number.',
        admin_username: settings.admin_username || 'admin'
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to load payment settings' });
  }
});

router.post('/payment-settings', (req, res) => {
  try {
    const { upi_id, merchant_name, qr_url, payment_instructions } = req.body;

    const upsert = db.prepare(`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `);

    if (upi_id !== undefined) upsert.run('upi_id', upi_id.trim());
    if (merchant_name !== undefined) upsert.run('merchant_name', merchant_name.trim());
    if (qr_url !== undefined) upsert.run('qr_url', qr_url.trim());
    if (payment_instructions !== undefined) upsert.run('payment_instructions', payment_instructions.trim());

    return res.json({
      success: true,
      message: '✅ Payment settings updated successfully! New UPI ID & QR Code are now live across all checkout pages.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to save payment settings' });
  }
});

// 5. Service / API Management
router.get('/services', (req, res) => {
  try {
    const services = db.prepare('SELECT * FROM services ORDER BY created_at ASC').all();
    return res.json({ success: true, services });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to load services' });
  }
});

router.post('/services', (req, res) => {
  try {
    const { name, description, price, requests_per_day, requests_per_month, is_active } = req.body;
    const serviceId = `srv_${uuidv4().replace(/-/g, '').slice(0, 8)}`;

    db.prepare(`
      INSERT INTO services (id, name, description, price, requests_per_day, requests_per_month, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      serviceId,
      name.trim(),
      description?.trim() || '',
      parseFloat(price || 0),
      parseInt(requests_per_day || 1000),
      parseInt(requests_per_month || 30000),
      is_active !== undefined ? (is_active ? 1 : 0) : 1
    );

    return res.status(201).json({ success: true, message: 'API Service added successfully', serviceId });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to create service' });
  }
});

router.put('/services/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, requests_per_day, requests_per_month, is_active } = req.body;

    db.prepare(`
      UPDATE services
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          price = COALESCE(?, price),
          requests_per_day = COALESCE(?, requests_per_day),
          requests_per_month = COALESCE(?, requests_per_month),
          is_active = COALESCE(?, is_active)
      WHERE id = ?
    `).run(
      name,
      description,
      price !== undefined ? parseFloat(price) : null,
      requests_per_day !== undefined ? parseInt(requests_per_day) : null,
      requests_per_month !== undefined ? parseInt(requests_per_month) : null,
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      id
    );

    return res.json({ success: true, message: 'Service updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update service' });
  }
});

router.delete('/services/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM services WHERE id = ?').run(id);
    return res.json({ success: true, message: 'Service removed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete service' });
  }
});

// 6. Plans Management
router.get('/plans', (req, res) => {
  try {
    const plans = db.prepare('SELECT * FROM plans WHERE id != "wallet_deposit" ORDER BY price ASC').all();
    return res.json({ success: true, plans });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to load plans' });
  }
});

router.post('/plans', (req, res) => {
  try {
    const { name, tier, price, daily_quota, total_quota, rps_limit, features, is_popular, is_active } = req.body;
    const planId = `plan_${uuidv4().replace(/-/g, '').slice(0, 8)}`;

    db.prepare(`
      INSERT INTO plans (id, name, tier, price, daily_quota, total_quota, rps_limit, features_json, is_popular, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      planId,
      name.trim(),
      tier || 'pro',
      parseFloat(price || 0),
      parseInt(daily_quota || 1000),
      parseInt(total_quota || 30000),
      parseInt(rps_limit || 15),
      JSON.stringify(features || []),
      is_popular ? 1 : 0,
      is_active !== undefined ? (is_active ? 1 : 0) : 1
    );

    return res.status(201).json({ success: true, message: 'Plan created successfully', planId });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to create plan' });
  }
});

router.put('/plans/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, daily_quota, total_quota, rps_limit, features, is_popular, is_active } = req.body;

    db.prepare(`
      UPDATE plans
      SET name = COALESCE(?, name),
          price = COALESCE(?, price),
          daily_quota = COALESCE(?, daily_quota),
          total_quota = COALESCE(?, total_quota),
          rps_limit = COALESCE(?, rps_limit),
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

router.delete('/plans/:id', (req, res) => {
  try {
    const { id } = req.params;
    if (id === 'plan_free' || id === 'wallet_deposit') {
      return res.status(400).json({ success: false, error: 'Cannot delete core system plans' });
    }
    db.prepare('DELETE FROM plans WHERE id = ?').run(id);
    return res.json({ success: true, message: 'Plan deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete plan' });
  }
});

// 7. Orders & Payment Management
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

// Approve Manual UTR Payment & Automatically Provision Key with 30 Days Validity
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

    // 2. Generate and provision 30-day paid subscription API Key
    const apiKey = generateApiKeyForPlan(order.plan_tier || order.plan_name);
    const clientToken = generateClientToken();
    const keyId = `key_${uuidv4().replace(/-/g, '').slice(0, 10)}`;

    const purchaseDate = new Date();
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);

    db.prepare(`
      INSERT INTO api_keys (
        id, user_id, plan_id, key_name, api_key, client_token, status, type,
        daily_quota, total_quota, rps_limit, bot_type, purchase_date, expires_at, regeneration_count
      ) VALUES (?, ?, ?, ?, ?, ?, 'active', 'paid', ?, ?, ?, 'Telegram Music Bot (Dedicated)', ?, ?, 0)
    `).run(
      keyId,
      order.user_id,
      order.plan_id,
      `${order.plan_name} 30-Day Subscription Key`,
      apiKey,
      clientToken,
      order.daily_quota || 1500,
      order.total_quota || 45000,
      order.rps_limit || 20,
      purchaseDate.toISOString(),
      expires.toISOString()
    );

    const createdKey = db.prepare('SELECT * FROM api_keys WHERE id = ?').get(keyId);

    return res.json({
      success: true,
      message: `🎉 Order approved! 30-Day Paid Subscription & API Key [${apiKey}] activated for ${order.user_email} (Expires: ${expires.toLocaleDateString()}).`,
      apiKey: createdKey
    });
  } catch (error) {
    console.error('Approve order error:', error);
    return res.status(500).json({ success: false, error: 'Failed to approve order' });
  }
});

router.post('/orders/:id/reject', (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    db.prepare("UPDATE orders SET payment_status = 'rejected' WHERE id = ?").run(id);

    return res.json({
      success: true,
      message: `Order rejected. Reason: ${reason || 'Invalid UTR / Payment not verified.'}`
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to reject order' });
  }
});

// 8. Admin Settings / Change Password
router.post('/change-password', (req, res) => {
  try {
    const { currentPassword, newPassword, newUsername } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long.' });
    }

    const admin = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!admin) return res.status(404).json({ success: false, error: 'Admin account not found' });

    if (currentPassword && admin.password_hash) {
      if (!bcrypt.compareSync(currentPassword, admin.password_hash)) {
        return res.status(401).json({ success: false, error: 'Current password does not match.' });
      }
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, req.user.id);

    if (newUsername) {
      db.prepare(`
        INSERT INTO site_settings (key, value, updated_at)
        VALUES ('admin_username', ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
      `).run(newUsername.trim());
    }

    return res.json({ success: true, message: '🔒 Admin credentials updated securely!' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update credentials' });
  }
});

// 9. System Logs
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
