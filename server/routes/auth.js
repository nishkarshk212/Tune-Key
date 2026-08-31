import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';
import { JWT_SECRET, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper to sign JWT
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Register
router.post('/register', (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    const emailClean = email.trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(emailClean);
    if (existing) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const userId = `usr_${uuidv4().replace(/-/g, '').slice(0, 12)}`;

    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, balance, avatar_url)
      VALUES (?, ?, ?, ?, 'user', 10.0, ?)
    `).run(userId, emailClean, passwordHash, name.trim(), `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`);

    // Create a free starter trial API key for new user
    const trialKey = `tk_live_yt_${uuidv4().replace(/-/g, '').slice(0, 24)}`;
    const clientToken = `tok_tg_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
    const expires = new Date();
    expires.setDate(expires.getDate() + 7); // 7 day trial

    db.prepare(`
      INSERT INTO api_keys (id, user_id, plan_id, key_name, api_key, client_token, status, daily_quota, total_quota, rps_limit, expires_at)
      VALUES (?, ?, 'plan_starter', 'Default Telegram Bot Key', ?, ?, 'active', 5000, 35000, 5, ?)
    `).run(`key_${uuidv4().replace(/-/g, '').slice(0, 10)}`, userId, trialKey, clientToken, expires.toISOString());

    const newUser = db.prepare('SELECT id, email, name, role, balance, avatar_url, created_at FROM users WHERE id = ?').get(userId);
    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! $10 trial bonus & Free Bot Key provisioned.',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, error: 'Registration failed. Please try again.' });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const emailClean = email.trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(emailClean);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    if (user.is_banned) {
      return res.status(403).json({ success: false, error: 'This account is suspended. Contact support.' });
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const { password_hash, reset_token, ...safeUser } = user;

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Internal login error.' });
  }
});

// Google Sign-In / 1-Click Auth
router.post('/google', (req, res) => {
  try {
    const { email, name, googleId, avatar } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Google email is required.' });
    }

    const emailClean = email.trim().toLowerCase();
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(emailClean);

    if (!user) {
      // Create new user via Google
      const userId = `usr_${uuidv4().replace(/-/g, '').slice(0, 12)}`;
      const avatarUrl = avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`;

      db.prepare(`
        INSERT INTO users (id, email, name, role, balance, avatar_url)
        VALUES (?, ?, ?, 'user', 10.0, ?)
      `).run(userId, emailClean, name || emailClean.split('@')[0], avatarUrl);

      // Provision starter trial key
      const trialKey = `tk_live_yt_${uuidv4().replace(/-/g, '').slice(0, 24)}`;
      const clientToken = `tok_tg_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);

      db.prepare(`
        INSERT INTO api_keys (id, user_id, plan_id, key_name, api_key, client_token, status, daily_quota, total_quota, rps_limit, expires_at)
        VALUES (?, ?, 'plan_starter', 'Google Bot Key', ?, ?, 'active', 5000, 35000, 5, ?)
      `).run(`key_${uuidv4().replace(/-/g, '').slice(0, 10)}`, userId, trialKey, clientToken, expires.toISOString());

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    }

    if (user.is_banned) {
      return res.status(403).json({ success: false, error: 'Account suspended.' });
    }

    const token = generateToken(user);
    const { password_hash, reset_token, ...safeUser } = user;

    return res.json({
      success: true,
      message: 'Authenticated with Google',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(500).json({ success: false, error: 'Google authentication failed.' });
  }
});

// Forgot Password - Initiate Reset
router.post('/forgot-password', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required.' });
    }

    const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email.trim().toLowerCase());
    if (!user) {
      // Return success to prevent email enumeration
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password recovery code and instructions have been prepared.'
      });
    }

    const resetToken = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code
    const expiry = Date.now() + (1000 * 60 * 30); // 30 minutes

    db.prepare('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?')
      .run(resetToken, expiry, user.id);

    return res.json({
      success: true,
      message: 'A 6-digit recovery code has been generated.',
      // We also include recovery code in dev/demo payload for seamless user experience!
      demo_reset_code: resetToken
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Error generating reset token.' });
  }
});

// Reset Password with Code
router.post('/reset-password', (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ success: false, error: 'Email, recovery code, and new password are required.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase());
    if (!user || user.reset_token !== code.trim()) {
      return res.status(400).json({ success: false, error: 'Invalid or expired recovery code.' });
    }

    if (Date.now() > user.reset_token_expiry) {
      return res.status(400).json({ success: false, error: 'Recovery code has expired. Please request a new one.' });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?')
      .run(newHash, user.id);

    return res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Password reset failed.' });
  }
});

// Current User Profile
router.get('/me', authenticateToken, (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
});

// Update Profile
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (name) {
      db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name.trim(), userId);
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, error: 'Current password is required to change password.' });
      }

      const userFull = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId);
      if (userFull.password_hash && !bcrypt.compareSync(currentPassword, userFull.password_hash)) {
        return res.status(400).json({ success: false, error: 'Current password is incorrect.' });
      }

      const newHash = bcrypt.hashSync(newPassword, 10);
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, userId);
    }

    const updatedUser = db.prepare('SELECT id, email, name, role, balance, avatar_url FROM users WHERE id = ?').get(userId);
    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update profile.' });
  }
});

export default router;
