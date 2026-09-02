import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';
import { JWT_SECRET, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Rate limiter for authentication routes (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 auth requests per 15 minutes
  message: { success: false, error: 'Too many authentication attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use('/login', authLimiter);
router.use('/register', authLimiter);

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
      VALUES (?, ?, ?, ?, 'user', 0.0, ?)
    `).run(userId, emailClean, passwordHash, name.trim(), `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`);

    // Create a free starter trial API key for new user
    const trialKey = `v-bit-free-${uuidv4().replace(/-/g, '').slice(0, 24)}`;
    const clientToken = `tok_tg_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);

    db.prepare(`
      INSERT INTO api_keys (id, user_id, plan_id, key_name, api_key, client_token, status, daily_quota, total_quota, rps_limit, expires_at)
      VALUES (?, ?, 'plan_free', 'Default YouTube Bot Key', ?, ?, 'active', 500, 15000, 5, ?)
    `).run(`key_${uuidv4().replace(/-/g, '').slice(0, 10)}`, userId, trialKey, clientToken, expires.toISOString());

    const newUser = db.prepare('SELECT id, email, name, role, balance, avatar_url, created_at FROM users WHERE id = ?').get(userId);
    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Free Bot Key provisioned.',
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
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(emailClean);

    // Allow 'admin' alias for administrator login
    if (!user && (emailClean === 'admin' || emailClean === 'administrator')) {
      user = db.prepare("SELECT * FROM users WHERE role = 'admin' LIMIT 1").get();
    }

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    if (user.is_banned) {
      return res.status(403).json({ success: false, error: 'This account is suspended. Contact support.' });
    }

    if (!user.password_hash || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ success: false, error: 'Invalid email or password. If you used Google Sign-In, please continue with Google.' });
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

// Dedicated Admin Login Endpoint
router.post('/admin-login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username/Email and password are required.' });
    }

    const inputClean = username.trim().toLowerCase();
    
    // Find admin user by email or username
    let user = db.prepare(`
      SELECT * FROM users 
      WHERE (email = ? OR email = 'admin@vbit.io' OR email = 'hakeebtravels@gmail.com') 
        AND role = 'admin'
    `).get(inputClean);

    // If still not found and input is 'admin', get the primary admin user
    if (!user && (inputClean === 'admin' || inputClean === 'administrator')) {
      user = db.prepare("SELECT * FROM users WHERE role = 'admin' LIMIT 1").get();
    }

    if (!user || !user.password_hash || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ success: false, error: 'Invalid admin username or password.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied: Administrator privileges required.' });
    }

    const token = generateToken(user);
    const { password_hash, reset_token, ...safeUser } = user;

    return res.json({
      success: true,
      message: 'Admin authentication successful',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ success: false, error: 'Admin login failed.' });
  }
});

// Google OAuth URL generator
router.get('/google/url', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ error: 'GOOGLE_CLIENT_ID is not configured in environment variables.' });
  }

  // Use host from request headers for dynamic redirect matching
  const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:5000';
  const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: redirectUri,
    client_id: clientId,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'select_account',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  };

  const qs = new URLSearchParams(options);
  return res.json({ url: `${rootUrl}?${qs.toString()}` });
});

// Google OAuth Server Callback
router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error || !code) {
    return res.redirect('/login?error=Google authentication was cancelled.');
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:5000';
    const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

    // 1. Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('Google token error:', tokenData);
      return res.redirect('/login?error=Failed to exchange Google token.');
    }

    // 2. Fetch User Profile
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await profileResponse.json();

    if (!profile.email) {
      return res.redirect('/login?error=Could not retrieve email from Google.');
    }

    const emailClean = profile.email.trim().toLowerCase();
    const isAdminUser = emailClean === 'hakeebtravels@gmail.com';
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(emailClean);

    if (!user) {
      const userId = `usr_${uuidv4().replace(/-/g, '').slice(0, 12)}`;
      const avatarUrl = profile.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`;

      db.prepare(`
        INSERT INTO users (id, email, name, role, balance, avatar_url)
        VALUES (?, ?, ?, ?, 0.0, ?)
      `).run(userId, emailClean, profile.name || emailClean.split('@')[0], isAdminUser ? 'admin' : 'user', avatarUrl);

      // Create initial API key
      const trialKey = `v-bit-free-${uuidv4().replace(/-/g, '').slice(0, 24)}`;
      const clientToken = `tok_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);

      db.prepare(`
        INSERT INTO api_keys (id, user_id, plan_id, key_name, api_key, client_token, status, daily_quota, today_requests, rps_limit, expires_at)
        VALUES (?, ?, 'plan_free', 'Default Free Key', ?, ?, 'active', 500, 0, 5, ?)
      `).run(`key_${uuidv4().replace(/-/g, '').slice(0, 10)}`, userId, trialKey, clientToken, expires.toISOString());

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    } else if (isAdminUser && user.role !== 'admin') {
      db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(user.id);
      user.role = 'admin';
    }

    const jwtToken = generateToken(user);
    const { password_hash, ...safeUser } = user;

    // Redirect directly to Dashboard with signed-in Google user payload
    const userEncoded = encodeURIComponent(JSON.stringify(safeUser));
    return res.redirect(`/dashboard?token=${jwtToken}&user=${userEncoded}`);
  } catch (err) {
    console.error('Google Callback Error:', err);
    return res.redirect('/login?error=Google authentication process failed.');
  }
});

// Google Sign-In / 1-Click direct handler
router.post('/google', (req, res) => {
  try {
    const { email, name, avatar } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Google email is required.' });
    }

    const emailClean = email.trim().toLowerCase();
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(emailClean);

    if (!user) {
      const userId = `usr_${uuidv4().replace(/-/g, '').slice(0, 12)}`;
      const avatarUrl = avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`;

      db.prepare(`
        INSERT INTO users (id, email, name, role, balance, avatar_url)
        VALUES (?, ?, ?, 'user', 0.0, ?)
      `).run(userId, emailClean, name || emailClean.split('@')[0], avatarUrl);

      const trialKey = `v-bit-free-${uuidv4().replace(/-/g, '').slice(0, 24)}`;
      const clientToken = `tok_live_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);

      db.prepare(`
        INSERT INTO api_keys (id, user_id, plan_id, key_name, api_key, client_token, status, daily_quota, today_requests, rps_limit, expires_at)
        VALUES (?, ?, 'plan_free', 'Default Free Key', ?, ?, 'active', 500, 0, 5, ?)
      `).run(`key_${uuidv4().replace(/-/g, '').slice(0, 10)}`, userId, trialKey, clientToken, expires.toISOString());

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    }

    if (user.status === 'suspended') {
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
