import jwt from 'jsonwebtoken';
import db from '../database.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'tunekey_super_secret_jwt_key_2026_music_bot_production';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid or expired session token.' });
    }

    const user = db.prepare('SELECT id, email, name, role, balance, is_banned, avatar_url FROM users WHERE id = ?').get(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User no longer exists.' });
    }

    if (user.is_banned) {
      return res.status(403).json({ success: false, error: 'Your account has been suspended by an administrator.' });
    }

    // Auto-promote super-admin email
    if (user.email === 'hakeebtravels@gmail.com') {
      user.role = 'admin';
    }

    req.user = user;
    next();
  });
}

export function requireAdmin(req, res, next) {
  if (!req.user || (req.user.role !== 'admin' && req.user.email !== 'hakeebtravels@gmail.com')) {
    return res.status(403).json({ success: false, error: 'Access denied. Administrator privileges required.' });
  }
  next();
}
