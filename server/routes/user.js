import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import { generateApiKey, generateApiKeyForPlan, generateClientToken, checkAndResetDailyQuotas } from '../services/keyService.js';

const router = express.Router();

// Get User Dashboard Overview Statistics
router.get('/dashboard/stats', authenticateToken, (req, res) => {
  try {
    checkAndResetDailyQuotas();
    const userId = req.user.id;

    // Keys summary
    const keys = db.prepare(`
      SELECT * FROM api_keys WHERE user_id = ? ORDER BY created_at DESC
    `).all(userId);

    const activeKeysCount = keys.filter(k => k.status === 'active').length;
    const totalDailyQuota = keys.reduce((sum, k) => sum + (k.status === 'active' ? k.daily_quota : 0), 0);
    const todayRequests = keys.reduce((sum, k) => sum + k.today_requests, 0);
    const totalRequests = keys.reduce((sum, k) => sum + k.used_quota, 0);

    // Recent activity logs
    const recentLogs = db.prepare(`
      SELECT * FROM usage_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT 20
    `).all(userId);

    // Average latency
    const avgLatencyResult = db.prepare(`
      SELECT AVG(latency_ms) as avg_lat FROM usage_logs WHERE user_id = ?
    `).get(userId);

    const avgLatency = avgLatencyResult?.avg_lat ? Math.round(avgLatencyResult.avg_lat) : 0;

    return res.json({
      success: true,
      stats: {
        activeKeysCount,
        totalKeysCount: keys.length,
        totalDailyQuota,
        todayRequests,
        totalRequests,
        avgLatency,
        walletBalance: req.user.balance || 0.0
      },
      keys,
      recentLogs
    });
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
  }
});

// Get Detailed Real Analytics & Telemetry
router.get('/analytics', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;

    // Keys summary
    const keys = db.prepare('SELECT id, api_key, key_name, daily_quota, today_requests, used_quota FROM api_keys WHERE user_id = ?').all(userId);
    const keyIds = keys.map(k => k.id);

    const totalRequests = keys.reduce((sum, k) => sum + (k.used_quota || 0), 0);
    const todayRequests = keys.reduce((sum, k) => sum + (k.today_requests || 0), 0);
    const totalDailyQuota = keys.reduce((sum, k) => sum + (k.daily_quota || 0), 0);

    // Endpoint distribution from real logs
    const endpointLogs = db.prepare(`
      SELECT endpoint, COUNT(*) as count FROM usage_logs WHERE user_id = ? GROUP BY endpoint
    `).all(userId);

    // Recent logs
    const recentLogs = db.prepare(`
      SELECT * FROM usage_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT 20
    `).all(userId);

    // Average latency
    const avgLatencyResult = db.prepare(`
      SELECT AVG(latency_ms) as avg_lat FROM usage_logs WHERE user_id = ?
    `).get(userId);

    const avgLatency = avgLatencyResult?.avg_lat ? Math.round(avgLatencyResult.avg_lat) : 0;

    return res.json({
      success: true,
      totalRequests,
      todayRequests,
      totalDailyQuota,
      avgLatency,
      endpointLogs,
      recentLogs,
      keysCount: keys.length
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({ success: false, error: 'Failed to load analytics' });
  }
});

// Get User's API Keys
router.get('/keys', authenticateToken, (req, res) => {
  try {
    const keys = db.prepare(`
      SELECT k.*, p.name as plan_name, p.tier as plan_tier
      FROM api_keys k
      LEFT JOIN plans p ON k.plan_id = p.id
      WHERE k.user_id = ?
      ORDER BY k.created_at DESC
    `).all(req.user.id);

    return res.json({ success: true, keys });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to load API keys' });
  }
});

// Create / Provision New API Key
router.post('/keys/create', authenticateToken, (req, res) => {
  try {
    const { keyName, allowedIps, botType, planId } = req.body;
    const userId = req.user.id;

    // Get selected plan or fallback to free plan
    const targetPlanId = planId || 'plan_free';
    const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(targetPlanId) 
      || db.prepare("SELECT * FROM plans WHERE id = 'plan_free'").get()
      || { id: 'plan_free', name: 'FREE', tier: 'Free', daily_quota: 500, total_quota: 15000, rps_limit: 5, price: 0 };

    // Enforce 1 active API key per plan subscription
    const existingKey = db.prepare(`
      SELECT * FROM api_keys 
      WHERE user_id = ? AND plan_id = ? AND status = 'active'
    `).get(userId, plan.id);

    if (existingKey) {
      return res.status(400).json({
        success: false,
        error: `Only 1 active API key is permitted per plan (${plan.name}). You already have key "${existingKey.key_name}" (${existingKey.api_key}). You can regenerate it if you need a new key.`
      });
    }

    // If paid plan, verify user has an order or sufficient wallet balance
    if (plan.id !== 'plan_free' && plan.price > 0) {
      const hasOrder = db.prepare(`
        SELECT * FROM orders 
        WHERE user_id = ? AND plan_id = ? AND payment_status = 'completed'
      `).get(userId, plan.id);

      const userRec = db.prepare('SELECT balance FROM users WHERE id = ?').get(userId);

      if (!hasOrder) {
        if ((userRec?.balance || 0) < plan.price) {
          return res.status(400).json({
            success: false,
            error: `Insufficient wallet balance for ${plan.name} plan (₹${plan.price}). Please add funds in the Wallet tab or purchase from the Plans page.`
          });
        }

        // Deduct from wallet balance
        db.prepare('UPDATE users SET balance = balance - ? WHERE id = ?').run(plan.price, userId);
      }
    }

    const newApiKey = generateApiKeyForPlan(plan.tier);
    const newClientToken = generateClientToken();
    const keyId = `key_${uuidv4().replace(/-/g, '').slice(0, 10)}`;

    const expires = new Date();
    expires.setDate(expires.getDate() + 30);

    db.prepare(`
      INSERT INTO api_keys (
        id, user_id, plan_id, key_name, api_key, client_token, status,
        daily_quota, total_quota, rps_limit, allowed_ips, bot_type, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?)
    `).run(
      keyId,
      userId,
      plan.id,
      keyName?.trim() || `${plan.name} Bot Key`,
      newApiKey,
      newClientToken,
      plan.daily_quota || 500,
      plan.total_quota || 15000,
      plan.rps_limit || 5,
      allowedIps?.trim() || '',
      botType || 'YukkiMusic Bot v3',
      expires.toISOString()
    );

    const created = db.prepare(`
      SELECT k.*, p.name as plan_name, p.tier as plan_tier
      FROM api_keys k
      LEFT JOIN plans p ON k.plan_id = p.id
      WHERE k.id = ?
    `).get(keyId);

    return res.status(201).json({
      success: true,
      message: `🎉 Successfully generated ${plan.name} API Key (${plan.daily_quota} req/day)!`,
      key: created
    });
  } catch (error) {
    console.error('Create key error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create API key' });
  }
});

// Toggle Status (Activate / Deactivate)
router.patch('/keys/:id/toggle', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const key = db.prepare('SELECT * FROM api_keys WHERE id = ? AND user_id = ?').get(id, req.user.id);
    
    if (!key) {
      return res.status(404).json({ success: false, error: 'API key not found' });
    }

    if (key.status === 'revoked') {
      return res.status(400).json({ success: false, error: 'Revoked keys cannot be reactivated.' });
    }

    const newStatus = key.status === 'active' ? 'inactive' : 'active';
    db.prepare('UPDATE api_keys SET status = ? WHERE id = ?').run(newStatus, id);

    return res.json({
      success: true,
      message: `API Key is now ${newStatus}`,
      status: newStatus
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update key status' });
  }
});

// Regenerate API Key Credentials
router.post('/keys/:id/regenerate', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const key = db.prepare('SELECT * FROM api_keys WHERE id = ? AND user_id = ?').get(id, req.user.id);
    
    if (!key) {
      return res.status(404).json({ success: false, error: 'API key not found' });
    }

    const newApiKey = generateApiKey();
    const newClientToken = generateClientToken();

    db.prepare(`
      UPDATE api_keys
      SET api_key = ?, client_token = ?, status = 'active'
      WHERE id = ?
    `).run(newApiKey, newClientToken, id);

    return res.json({
      success: true,
      message: 'API Key credentials regenerated successfully. Update your Telegram bot config with the new key.',
      api_key: newApiKey,
      client_token: newClientToken
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to regenerate key' });
  }
});

// Revoke API Key permanently
router.delete('/keys/:id/revoke', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const key = db.prepare('SELECT * FROM api_keys WHERE id = ? AND user_id = ?').get(id, req.user.id);
    
    if (!key) {
      return res.status(404).json({ success: false, error: 'API key not found' });
    }

    db.prepare("UPDATE api_keys SET status = 'revoked' WHERE id = ?").run(id);

    return res.json({
      success: true,
      message: 'API Key revoked permanently. All requests from this key will now be blocked.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to revoke key' });
  }
});

// Update Key Details (Name, Allowed IPs)
router.put('/keys/:id/settings', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { key_name, allowed_ips, bot_type } = req.body;

    const key = db.prepare('SELECT * FROM api_keys WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!key) {
      return res.status(404).json({ success: false, error: 'API key not found' });
    }

    db.prepare(`
      UPDATE api_keys
      SET key_name = COALESCE(?, key_name),
          allowed_ips = COALESCE(?, allowed_ips),
          bot_type = COALESCE(?, bot_type)
      WHERE id = ?
    `).run(key_name?.trim(), allowed_ips?.trim(), bot_type?.trim(), id);

    const updated = db.prepare('SELECT * FROM api_keys WHERE id = ?').get(id);
    return res.json({
      success: true,
      message: 'Key settings saved successfully',
      key: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update key settings' });
  }
});

// Get User Orders & Invoices
router.get('/orders', authenticateToken, (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT o.*, p.name as plan_name, p.tier as plan_tier, p.daily_quota, p.total_quota
      FROM orders o
      JOIN plans p ON o.plan_id = p.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `).all(req.user.id);

    return res.json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to load order history' });
  }
});

// Get Detailed Usage Analytics (Time Series)
router.get('/analytics', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    
    // Hourly request counts for past 24h
    const hourlyLogs = db.prepare(`
      SELECT strftime('%H:00', timestamp) as hour, COUNT(*) as count, AVG(latency_ms) as avg_latency
      FROM usage_logs
      WHERE user_id = ? AND timestamp >= datetime('now', '-24 hours')
      GROUP BY hour
      ORDER BY timestamp ASC
    `).all(userId);

    // Endpoints breakdown
    const endpointBreakdown = db.prepare(`
      SELECT endpoint, COUNT(*) as count
      FROM usage_logs
      WHERE user_id = ?
      GROUP BY endpoint
    `).all(userId);

    // Status code distribution
    const statusCodes = db.prepare(`
      SELECT status_code, COUNT(*) as count
      FROM usage_logs
      WHERE user_id = ?
      GROUP BY status_code
    `).all(userId);

    return res.json({
      success: true,
      analytics: {
        hourly: hourlyLogs,
        endpoints: endpointBreakdown,
        statusCodes
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to generate analytics' });
  }
});

// Get User Wallet & Deposit History
router.get('/wallet', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const user = db.prepare('SELECT id, email, name, balance FROM users WHERE id = ?').get(userId);

    const transactions = db.prepare(`
      SELECT o.*, p.name as plan_name
      FROM orders o
      LEFT JOIN plans p ON o.plan_id = p.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `).all(userId);

    const totalDeposited = transactions
      .filter(t => t.payment_status === 'completed' && (!t.plan_id || t.plan_id === 'wallet_deposit'))
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalSpent = transactions
      .filter(t => t.payment_status === 'completed' && t.plan_id && t.plan_id !== 'wallet_deposit')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    return res.json({
      success: true,
      balance: user?.balance || 0.0,
      totalDeposited,
      totalSpent,
      transactions,
      merchantUpi: {
        upiId: 'mohammadhakeeb@fam',
        merchantName: 'Mohammed Hakeeb',
        qrUrl: '/assets/paytm_qr.jpg'
      }
    });
  } catch (error) {
    console.error('Wallet fetch error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch wallet info' });
  }
});

// Submit Wallet Deposit Request
router.post('/wallet/deposit', authenticateToken, (req, res) => {
  try {
    const { amount, utrNumber, paymentMethod } = req.body;
    const userId = req.user.id;

    const depositAmount = parseFloat(amount);
    if (!depositAmount || depositAmount < 10) {
      return res.status(400).json({ success: false, error: 'Minimum deposit amount is ₹10' });
    }

    if (!utrNumber || utrNumber.trim().length < 6) {
      return res.status(400).json({ success: false, error: 'Please enter a valid 12-digit UTR or Transaction ID' });
    }

    // Check for duplicate UTR submission
    const existing = db.prepare('SELECT * FROM orders WHERE transaction_id = ?').get(utrNumber.trim());
    if (existing) {
      return res.status(400).json({ success: false, error: 'This UTR has already been submitted.' });
    }

    const orderId = `dep_${uuidv4().replace(/-/g, '').slice(0, 10)}`;

    db.prepare(`
      INSERT INTO orders (id, user_id, plan_id, plan_name, amount, currency, payment_method, payment_status, transaction_id)
      VALUES (?, ?, 'wallet_deposit', 'Wallet Deposit Top-up', ?, 'INR', ?, 'pending', ?)
    `).run(
      orderId,
      userId,
      depositAmount,
      paymentMethod || 'Paytm UPI QR',
      utrNumber.trim()
    );

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);

    return res.status(201).json({
      success: true,
      message: `Deposit request of ₹${depositAmount} submitted successfully! Balance will be credited upon UTR verification.`,
      order
    });
  } catch (error) {
    console.error('Deposit error:', error);
    return res.status(500).json({ success: false, error: 'Failed to submit deposit request' });
  }
});

export default router;
