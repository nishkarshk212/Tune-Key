import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import { generateApiKey, generateClientToken } from '../services/keyService.js';

const router = express.Router();

// Get Public & User Plans
router.get('/list', (req, res) => {
  try {
    const plans = db.prepare('SELECT * FROM plans WHERE is_active = 1 ORDER BY price ASC').all();
    const formatted = plans.map(p => ({
      ...p,
      features: JSON.parse(p.features_json || '[]')
    }));

    return res.json({ success: true, plans: formatted });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch plans' });
  }
});

// Checkout / Purchase Plan
router.post('/checkout', authenticateToken, (req, res) => {
  try {
    const { planId, paymentMethod, botName } = req.body;
    const userId = req.user.id;

    if (!planId) {
      return res.status(400).json({ success: false, error: 'Plan selection is required' });
    }

    const plan = db.prepare('SELECT * FROM plans WHERE id = ? AND is_active = 1').get(planId);
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Selected plan is not available' });
    }

    const method = paymentMethod || 'Credit Card / Stripe';
    const orderId = `ord_${uuidv4().replace(/-/g, '').slice(0, 10)}`;
    const txnId = `txn_${method.toLowerCase().replace(/[^a-z0-9]/g, '')}_${uuidv4().replace(/-/g, '').slice(0, 14)}`;

    // Create Order Record
    db.prepare(`
      INSERT INTO orders (id, user_id, plan_id, amount, currency, payment_method, payment_status, transaction_id)
      VALUES (?, ?, ?, ?, 'USD', ?, 'completed', ?)
    `).run(orderId, userId, plan.id, plan.price, method, txnId);

    // Provision new High-Quota API Key for the plan
    const apiKey = generateApiKey();
    const clientToken = generateClientToken();
    const keyId = `key_${uuidv4().replace(/-/g, '').slice(0, 10)}`;

    const expires = new Date();
    expires.setDate(expires.getDate() + (plan.billing_period === 'yearly' ? 365 : 30));

    db.prepare(`
      INSERT INTO api_keys (
        id, user_id, plan_id, key_name, api_key, client_token, status,
        daily_quota, total_quota, rps_limit, bot_type, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, 'Telegram Music Bot (Dedicated)', ?)
    `).run(
      keyId,
      userId,
      plan.id,
      botName?.trim() || `${plan.name} Dedicated Key`,
      apiKey,
      clientToken,
      plan.daily_quota,
      plan.total_quota,
      plan.rps_limit,
      expires.toISOString()
    );

    const createdKey = db.prepare('SELECT * FROM api_keys WHERE id = ?').get(keyId);

    return res.status(201).json({
      success: true,
      message: `Congratulations! Plan "${plan.name}" activated and API Key provisioned instantly.`,
      order: {
        id: orderId,
        amount: plan.price,
        planName: plan.name,
        paymentMethod: method,
        transactionId: txnId,
        date: new Date().toISOString()
      },
      apiKey: createdKey
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({ success: false, error: 'Checkout processing failed' });
  }
});

export default router;
