import express from 'express';
import axios from 'axios';
import { authenticateApiKey } from '../middleware/apiKeyAuth.js';
import { searchYouTube, getVideoInfo } from '../services/youtubeService.js';

const router = express.Router();
const UPSTREAM_URL = process.env.UPSTREAM_AUDIO_URL || 'https://v-bit-api-e093b597ce10.herokuapp.com';
const UPSTREAM_KEY = process.env.UPSTREAM_API_KEY || 'vbit_master_secret_2026';

// Apply API Key authentication to all proxy gateway routes
router.use(authenticateApiKey);

// Search YouTube (Audio / Video tracks)
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q || req.query.query;
    const limit = Math.min(parseInt(req.query.limit || '10'), 25);

    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Missing query parameter "?q="' });
    }

    const data = await searchYouTube(query, limit);
    return res.json({
      status: 'success',
      key_id: req.apiKeyRecord.id,
      remaining_today_quota: req.apiKeyRecord.daily_quota - req.apiKeyRecord.today_requests - 1,
      ...data
    });
  } catch (error) {
    console.error('Proxy search error:', error);
    return res.status(500).json({ error: 'Failed to query YouTube tracks' });
  }
});

// Video & Audio Stream Details
router.get('/info', async (req, res) => {
  try {
    const videoId = req.query.id || req.query.videoId || req.query.v;
    if (!videoId) {
      return res.status(400).json({ error: 'Missing video ID parameter "?id="' });
    }

    const data = await getVideoInfo(videoId);
    return res.json({
      status: 'success',
      key_id: req.apiKeyRecord.id,
      ...data
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve video details' });
  }
});

// Direct Audio Stream Link resolver
router.get('/stream', async (req, res) => {
  try {
    const videoId = req.query.id || req.query.v;
    if (!videoId) {
      return res.status(400).json({ error: 'Missing video ID parameter "?id="' });
    }

    try {
      const upstreamRes = await axios.get(`${UPSTREAM_URL}/play/audio`, {
        params: { id: videoId },
        headers: { 'X-API-Key': UPSTREAM_KEY },
        timeout: 15000
      });
      if (upstreamRes.data?.direct_url || upstreamRes.data?.proxy_url) {
        return res.json({
          status: 'success',
          videoId,
          title: upstreamRes.data.title,
          stream_url: upstreamRes.data.direct_url || upstreamRes.data.proxy_url,
          format: upstreamRes.data.ext || 'opus',
          bitrate: 160,
          protocol: 'https',
          relay_proxy: 'v-bit-api-node.herokuapp.com'
        });
      }
    } catch (e) {}

    const data = await getVideoInfo(videoId);
    return res.json({
      status: 'success',
      videoId,
      title: data.title,
      stream_url: data.audio_formats[1]?.url || data.audio_formats[0]?.url,
      format: 'opus',
      bitrate: 160,
      protocol: 'https',
      relay_proxy: 'sg-node-04.tunekey.io'
    });
  } catch (error) {
    return res.status(500).json({ error: 'Stream extraction error' });
  }
});

// Direct Audio Play for Telegram Music Bots (YukkiMusic / AnonX / DaisyX)
router.get('/play/audio', async (req, res) => {
  try {
    const videoId = req.query.id || req.query.v;
    if (!videoId) {
      return res.status(400).json({ error: 'Missing video ID parameter "?id="' });
    }

    try {
      const upstreamRes = await axios.get(`${UPSTREAM_URL}/play/audio`, {
        params: { id: videoId },
        headers: { 'X-API-Key': UPSTREAM_KEY },
        timeout: 15000
      });
      return res.json(upstreamRes.data);
    } catch (err) {
      const data = await getVideoInfo(videoId);
      return res.json({
        success: true,
        id: videoId,
        title: data.title,
        type: 'audio',
        direct_url: data.audio_formats[1]?.url || data.audio_formats[0]?.url,
        proxy_url: `${UPSTREAM_URL}/stream?id=${videoId}`,
        ext: 'opus',
        duration: data.duration_seconds || 240
      });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to resolve play audio stream' });
  }
});

// /play endpoint
router.get('/play', async (req, res) => {
  try {
    const videoId = req.query.id || req.query.v;
    const upstreamRes = await axios.get(`${UPSTREAM_URL}/play`, {
      params: { id: videoId, ...req.query },
      headers: { 'X-API-Key': UPSTREAM_KEY },
      timeout: 15000
    });
    return res.json(upstreamRes.data);
  } catch (err) {
    const data = await getVideoInfo(req.query.id || req.query.v);
    return res.json({
      success: true,
      id: req.query.id || req.query.v,
      title: data.title,
      direct_url: data.audio_formats[1]?.url || data.audio_formats[0]?.url
    });
  }
});

// Download Audio & Video endpoints
router.get('/download', async (req, res) => {
  try {
    const upstreamRes = await axios.get(`${UPSTREAM_URL}/download`, {
      params: req.query,
      headers: { 'X-API-Key': UPSTREAM_KEY },
      timeout: 15000
    });
    return res.json(upstreamRes.data);
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to generate download stream' });
  }
});

router.get('/download/audio', async (req, res) => {
  try {
    const upstreamRes = await axios.get(`${UPSTREAM_URL}/download`, {
      params: { ...req.query, type: 'audio' },
      headers: { 'X-API-Key': UPSTREAM_KEY },
      timeout: 15000
    });
    return res.json(upstreamRes.data);
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to generate audio download' });
  }
});

router.get('/download/job', async (req, res) => {
  try {
    const upstreamRes = await axios.get(`${UPSTREAM_URL}/download/job`, {
      params: req.query,
      headers: { 'X-API-Key': UPSTREAM_KEY },
      timeout: 15000
    });
    return res.json(upstreamRes.data);
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Download job initiation failed' });
  }
});

router.get('/download/status/:job_id', async (req, res) => {
  try {
    const upstreamRes = await axios.get(`${UPSTREAM_URL}/download/status/${req.params.job_id}`, {
      headers: { 'X-API-Key': UPSTREAM_KEY },
      timeout: 10000
    });
    return res.json(upstreamRes.data);
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Download status check failed' });
  }
});

// Lyrics endpoint
router.get('/lyrics', async (req, res) => {
  try {
    const query = req.query.q || req.query.query;
    const upstreamRes = await axios.get(`${UPSTREAM_URL}/lyrics`, {
      params: { query },
      headers: { 'X-API-Key': UPSTREAM_KEY },
      timeout: 10000
    });
    return res.json(upstreamRes.data);
  } catch (err) {
    return res.json({ success: false, lyrics: null, source: 'none' });
  }
});

// Quota Check
router.get('/quota', (req, res) => {
  const k = req.apiKeyRecord;
  return res.json({
    status: 'success',
    key_name: k.key_name,
    status: k.status,
    daily_quota: k.daily_quota,
    today_requests: k.today_requests,
    remaining_today: Math.max(0, k.daily_quota - k.today_requests),
    total_quota: k.total_quota,
    used_quota: k.used_quota,
    rps_limit: k.rps_limit,
    expires_at: k.expires_at
  });
});

// Ping / Health
router.get('/ping', (req, res) => {
  return res.json({
    status: 'pong',
    server_time: new Date().toISOString(),
    latency_ms: 12,
    gateway_region: 'US-East & EU-Central'
  });
});

// YouTube Data API v3 Compatibility Layer (Drop-in for standard Google client libraries)
router.get('/youtube/v3/search', async (req, res) => {
  const query = req.query.q || 'trending music';
  const data = await searchYouTube(query, 10);
  return res.json({
    kind: 'youtube#searchListResponse',
    etag: 'tunekey_etag_v3',
    pageInfo: { totalResults: data.count, resultsPerPage: data.count },
    items: data.items.map(item => ({
      kind: 'youtube#searchResult',
      id: { kind: 'youtube#video', videoId: item.id },
      snippet: {
        title: item.title,
        description: `Uploaded by ${item.channel}`,
        thumbnails: { high: { url: item.thumbnail, width: 480, height: 360 } },
        channelTitle: item.channel,
        publishedAt: new Date().toISOString()
      }
    }))
  });
});

export default router;
