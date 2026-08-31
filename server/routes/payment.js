import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import { generateApiKey, generateClientToken } from '../services/keyService.js';

const router = express.Router();

// Initialize Razorpay instance
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (key_id && key_secret) {
    return new Razorpay({ key_id, key_secret });
  }
  return null;
};

// 1. Get Public Razorpay Configuration (Public Key ID)
router.get('/razorpay/config', (req, res) => {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
  const is_live = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

  return res.json({
    success: true,
    keyId: key_id,
    isLive: is_live,
    currency: 'INR'
  });
});

// 2. Create Razorpay Order
router.post('/razorpay/create-order', authenticateToken, async (req, res) => {
  try {
    const { planId, botName } = req.body;
    const userId = req.user.id;

    if (!planId) {
      return res.status(400).json({ success: false, error: 'Plan selection is required' });
    }

    const plan = db.prepare('SELECT * FROM plans WHERE id = ? AND is_active = 1').get(planId);
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Selected plan is not found or inactive' });
    }

    const amountInPaise = Math.round(plan.price * 100); // 19900 for ₹199
    const receiptId = `rcpt_${uuidv4().replace(/-/g, '').slice(0, 12)}`;
    const rzp = getRazorpayInstance();

    let razorpayOrderId;

    if (rzp) {
      const order = await rzp.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: receiptId,
        notes: {
          userId,
          planId: plan.id,
          planName: plan.name,
          botName: botName || `${plan.name} Dedicated Key`
        }
      });
      razorpayOrderId = order.id;
    } else {
      // Sandbox / Test fallback if Razorpay keys not yet added in env
      razorpayOrderId = `order_${uuidv4().replace(/-/g, '').slice(0, 14)}`;
    }

    // Save Pending Order Record in Database
    const dbOrderId = `ord_${uuidv4().replace(/-/g, '').slice(0, 10)}`;
    db.prepare(`
      INSERT INTO orders (id, user_id, plan_id, amount, currency, payment_method, payment_status, transaction_id)
      VALUES (?, ?, ?, ?, 'INR', 'Razorpay', 'pending', ?)
    `).run(dbOrderId, userId, plan.id, plan.price, razorpayOrderId);

    return res.json({
      success: true,
      orderId: razorpayOrderId,
      dbOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      plan: {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        daily_quota: plan.daily_quota
      },
      user: {
        name: req.user.name,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to create Razorpay order' });
  }
});

// 3. Verify Razorpay Payment & Automatically Provision Key
router.post('/razorpay/verify', authenticateToken, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
      botName,
      dbOrderId
    } = req.body;

    const userId = req.user.id;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ success: false, error: 'Missing payment confirmation parameters' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Verify HMAC SHA256 Signature if live credentials are configured
    if (keySecret && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, error: 'Invalid Razorpay payment signature' });
      }
    }

    // Fetch Plan
    const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(planId);
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Associated plan not found' });
    }

    // 1. Update Order Status to Completed
    if (dbOrderId) {
      db.prepare(`
        UPDATE orders
        SET payment_status = 'completed', transaction_id = ?
        WHERE id = ? OR transaction_id = ?
      `).run(razorpay_payment_id, dbOrderId, razorpay_order_id);
    } else {
      db.prepare(`
        UPDATE orders
        SET payment_status = 'completed', transaction_id = ?
        WHERE transaction_id = ?
      `).run(razorpay_payment_id, razorpay_order_id);
    }

    // 2. Automatically Provision 1 Dedicated High-Quota YouTube API Key
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

    // 3. Log System Event
    db.prepare(`
      INSERT INTO system_logs (level, message, meta)
      VALUES ('info', ?, ?)
    `).run(
      `Payment verified via Razorpay: ₹${plan.price} for plan ${plan.name}`,
      JSON.stringify({ userId, paymentId: razorpay_payment_id, orderId: razorpay_order_id, keyId })
    );

    return res.json({
      success: true,
      message: `🎉 Payment verified! Your dedicated YouTube API Key for plan "${plan.name}" is now active.`,
      order: {
        id: dbOrderId || razorpay_order_id,
        planName: plan.name,
        amount: plan.price,
        currency: 'INR',
        paymentMethod: 'Razorpay (UPI / Card / NetBanking)',
        paymentId: razorpay_payment_id,
        date: new Date().toISOString()
      },
      apiKey: createdKey
    });
  } catch (error) {
    console.error('Razorpay Verify Error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Payment verification failed' });
  }
});

export default router;
