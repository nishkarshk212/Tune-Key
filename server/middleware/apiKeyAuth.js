import db from '../database.js';
import { checkAndResetDailyQuotas } from '../services/keyService.js';

// In-memory token bucket rate limiter per API key (requests per second)
const rpsTracker = new Map();

export function authenticateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.api_key || (req.headers.authorization?.startsWith('Bearer tk_') ? req.headers.authorization.slice(7) : null);

  if (!apiKey) {
    return res.status(401).json({
      error: 'Missing API Key',
      message: 'Please provide a valid YouTube Bot API key via "x-api-key" header or ?api_key= parameter.',
      documentation: '/docs'
    });
  }

  checkAndResetDailyQuotas();

  const keyRecord = db.prepare(`
    SELECT k.*, u.is_banned, u.email as user_email
    FROM api_keys k
    JOIN users u ON k.user_id = u.id
    WHERE k.api_key = ? OR k.client_token = ?
  `).get(apiKey, apiKey);

  if (!keyRecord) {
    return res.status(401).json({
      error: 'Invalid API Key',
      message: 'The provided API Key or Bot Client Token does not exist or has been removed.'
    });
  }

  if (keyRecord.is_banned) {
    return res.status(403).json({
      error: 'Account Suspended',
      message: 'The account owning this API Key is currently suspended.'
    });
  }

  if (keyRecord.status === 'revoked') {
    return res.status(403).json({
      error: 'Key Revoked',
      message: 'This YouTube API key has been permanently revoked. Please generate or purchase a new key.'
    });
  }

  if (keyRecord.status === 'inactive') {
    return res.status(403).json({
      error: 'Key Inactive',
      message: 'This API key is deactivated. You can activate it from your TuneKey dashboard.'
    });
  }

  // Check expiration
  if (keyRecord.expires_at) {
    const expiryDate = new Date(keyRecord.expires_at);
    if (new Date() > expiryDate) {
      return res.status(403).json({
        error: 'Key Expired',
        message: 'This subscription key expired on ' + expiryDate.toISOString() + '. Please renew your plan.'
      });
    }
  }

  // Check IP whitelist if configured
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || '127.0.0.1';
  if (keyRecord.allowed_ips && keyRecord.allowed_ips.trim().length > 0) {
    const allowed = keyRecord.allowed_ips.split(',').map(ip => ip.trim());
    if (!allowed.includes(clientIp) && !allowed.includes('0.0.0.0') && !allowed.includes('*')) {
      return res.status(403).json({
        error: 'IP Forbidden',
        message: `Client IP ${clientIp} is not authorized for this API key. Update allowed IPs in dashboard.`
      });
    }
  }

  // Rate Limiting (RPS)
  const now = Math.floor(Date.now() / 1000);
  const tracker = rpsTracker.get(keyRecord.id) || { timestamp: now, count: 0 };
  if (tracker.timestamp === now) {
    tracker.count++;
    if (tracker.count > keyRecord.rps_limit) {
      return res.status(429).json({
        error: 'Rate Limit Exceeded (429)',
        message: `Exceeded ${keyRecord.rps_limit} requests/second for plan limit. Please throttle your Telegram bot requests.`
      });
    }
  } else {
    tracker.timestamp = now;
    tracker.count = 1;
  }
  rpsTracker.set(keyRecord.id, tracker);

  // Check Quotas
  if (keyRecord.daily_quota > 0 && keyRecord.today_requests >= keyRecord.daily_quota) {
    return res.status(429).json({
      error: 'Daily Quota Exhausted',
      message: `Daily quota of ${keyRecord.daily_quota.toLocaleString()} requests reached. Resets at midnight UTC. Upgrade your plan for higher throughput.`
    });
  }

  if (keyRecord.total_quota > 0 && keyRecord.used_quota >= keyRecord.total_quota) {
    return res.status(429).json({
      error: 'Total Quota Exhausted',
      message: `Total quota limit of ${keyRecord.total_quota.toLocaleString()} requests exhausted. Please renew or purchase additional credits.`
    });
  }

  // Record start time for latency tracking
  req.startTime = Date.now();
  req.apiKeyRecord = keyRecord;
  req.clientIp = clientIp;

  // Intercept response finish to update stats and log
  res.on('finish', () => {
    try {
      const latency = Date.now() - req.startTime;
      const botAgent = req.headers['user-agent'] || 'TelegramBot-Client/1.0';

      // Increment usage in database
      db.prepare(`
        UPDATE api_keys
        SET used_quota = used_quota + 1,
            today_requests = today_requests + 1,
            last_used_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(keyRecord.id);

      // Log request
      db.prepare(`
        INSERT INTO usage_logs (api_key_id, user_id, endpoint, query, status_code, latency_ms, ip_address, bot_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        keyRecord.id,
        keyRecord.user_id,
        req.baseUrl + req.path,
        req.query.q || req.query.id || '',
        res.statusCode,
        latency,
        clientIp,
        botAgent
      );
    } catch (e) {
      console.error('Error recording usage log:', e.message);
    }
  });

  next();
}
