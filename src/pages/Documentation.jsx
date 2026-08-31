import React, { useState } from 'react';
import CodeBlock from '../components/CodeBlock';
import { 
  BookOpen, 
  Terminal, 
  Radio, 
  Bot, 
  Send, 
  Key, 
  CheckCircle2, 
  Zap, 
  Play, 
  ShieldCheck, 
  Copy, 
  ExternalLink,
  Code,
  Layers,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';

export default function Documentation() {
  const [activeTab, setActiveTab] = useState('quickstart');

  // Interactive API Console Runner
  const [testEndpoint, setTestEndpoint] = useState('/api/v1/yt/search');
  const [testQuery, setTestQuery] = useState('Alan Walker Faded');
  const [testApiKey, setTestApiKey] = useState('vbit_live_yt_sample_key_9f83a0');
  const [testLoading, setTestLoading] = useState(false);
  const [testResponse, setTestResponse] = useState(null);
  const [testLatency, setTestLatency] = useState(null);

  const runApiTest = async () => {
    setTestLoading(true);
    const start = Date.now();
    try {
      let url = `${testEndpoint}?api_key=${encodeURIComponent(testApiKey)}`;
      if (testEndpoint === '/api/v1/yt/search') {
        url += `&q=${encodeURIComponent(testQuery)}`;
      } else if (testEndpoint === '/api/v1/yt/info' || testEndpoint === '/api/v1/yt/stream') {
        url += `&id=${encodeURIComponent(testQuery || '60ItHLz5WEA')}`;
      }

      const res = await axios.get(url);
      setTestResponse(res.data);
      setTestLatency(Date.now() - start);
    } catch (err) {
      setTestResponse(err.response?.data || { error: err.message });
      setTestLatency(Date.now() - start);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#08090D] text-slate-900 dark:text-slate-100 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-white/[0.08] pb-8">
          <div className="flex items-center space-x-2.5 text-purple-500 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Developer Documentation & Integration Reference</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mt-2">
            Telegram Music Bot Integration Guide
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-2 max-w-3xl">
            Learn how to authenticate, resolve YouTube audio streams, integrate with YukkiMusic, AnonX, and PyTgCalls, and handle voice chat streams with zero 429 quota bans using <strong className="text-purple-400">VBIT-API-STORE</strong>.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-10">
          
          {/* Sidebar Nav */}
          <div className="space-y-1 text-sm font-medium">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
              Getting Started
            </div>
            <button
              onClick={() => setActiveTab('quickstart')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                activeTab === 'quickstart' ? 'bg-purple-600/15 text-purple-400 border border-purple-500/30' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/50'
              }`}
            >
              <span>1. Quickstart & Key Setup</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('yukki')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                activeTab === 'yukki' ? 'bg-purple-600/15 text-purple-400 border border-purple-500/30' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/50'
              }`}
            >
              <span>2. YukkiMusic Bot Setup</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('anonx')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                activeTab === 'anonx' ? 'bg-purple-600/15 text-purple-400 border border-purple-500/30' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/50'
              }`}
            >
              <span>3. AnonX & Daisy Music</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('pytgcalls')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                activeTab === 'pytgcalls' ? 'bg-purple-600/15 text-purple-400 border border-purple-500/30' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/50'
              }`}
            >
              <span>4. PyTgCalls Voice Client</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 mt-6 mb-2">
              API Reference
            </div>

            <button
              onClick={() => setActiveTab('endpoints')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                activeTab === 'endpoints' ? 'bg-purple-600/15 text-purple-400 border border-purple-500/30' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/50'
              }`}
            >
              <span>REST Endpoints Spec</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('console')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                activeTab === 'console' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Play className="w-3.5 h-3.5" />
                <span>Interactive API Sandbox</span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">LIVE</span>
            </button>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* TAB: Quickstart */}
            {activeTab === 'quickstart' && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.08]">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Authentication & API Keys</h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    Every request sent from your Telegram bot to the <strong className="text-purple-400">VBIT-API-STORE</strong> gateway must include your provisioned API key. You can authenticate using either the HTTP Header <code className="text-purple-400 font-mono">x-api-key</code>, Bearer Authorization, or the URL query parameter <code className="text-purple-400 font-mono">?api_key=</code>.
                  </p>

                  <div className="mt-4 space-y-4">
                    <CodeBlock
                      code={`# Method 1: HTTP Header (Recommended for Python Bots)
curl -X GET "http://v-bit-api.com/search?q=Alan+Walker" \\
     -H "x-api-key: v-bit-free-YOUR_API_KEY"

# Method 2: Query Parameter
curl -X GET "http://v-bit-api.com/search?q=Alan+Walker&api_key=v-bit-free-YOUR_API_KEY"`}
                      language="bash"
                      title="cURL Authentication Example"
                    />
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.08]">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Rate Limits & Quota Headers</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    VBIT-API-STORE automatically returns real-time quota telemetry in the response payload:
                  </p>
                  <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                      <span><code className="text-slate-900 dark:text-white font-mono">remaining_today_quota</code>: Real-time count of daily requests remaining until 00:00 UTC.</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                      <span><code className="text-slate-900 dark:text-white font-mono">provider</code>: Shows the active low-latency resolver node handling your request.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB: Yukki */}
            {activeTab === 'yukki' && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.08]">
                  <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold uppercase">
                    <Bot className="w-4 h-4" />
                    <span>YukkiMusic Bot v3.x Configuration</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">Connecting to YukkiMusic Bot</h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    YukkiMusic is one of the most popular open-source Telegram music bots. Follow these steps to connect your dedicated VBIT-API-STORE key and prevent search timeouts.
                  </p>

                  <div className="mt-6 space-y-4">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Step 1: Open your sample.env or config.env</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Add the VBIT-API-STORE credentials to your environment variables:</p>
                    <CodeBlock
                      code={`# YukkiMusic Bot Environment Configuration
API_ID = 12345678
API_HASH = "0123456789abcdef0123456789abcdef"
BOT_TOKEN = "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
OWNER_ID = 987654321
STRING_SESSION = "1BVtsOGwBu7f..."

# VBIT-API-STORE Dedicated YouTube API Key
YOUTUBE_API_KEY = "v-bit-free-YOUR_UNIQUE_API_KEY"
YOUTUBE_API_PROXY = "http://v-bit-api.com/"
AUDIO_STREAM_BITRATE = 160`}
                      language="env"
                      title="config.env"
                    />

                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-6">Step 2: Restart your bot process</h4>
                    <CodeBlock
                      code={`# If running via Bash
bash start

# If running via Systemd / PM2
pm2 restart YukkiMusic --update-env`}
                      language="bash"
                      title="Terminal"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: AnonX */}
            {activeTab === 'anonx' && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.08]">
                  <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase">
                    <Radio className="w-4 h-4" />
                    <span>AnonXMusic / DaisyBot Integration</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">AnonX Music Bot Setup</h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    AnonX uses YouTube Data API endpoints to fetch track lists and duration metadata. Our drop-in compatibility gateway works seamlessly without changing bot source code.
                  </p>

                  <div className="mt-6 space-y-4">
                    <CodeBlock
                      code={`# config.py in AnonXMusic repository
import os
from os import getenv

API_ID = int(getenv("API_ID", "12345678"))
API_HASH = getenv("API_HASH", "your_hash")
BOT_TOKEN = getenv("BOT_TOKEN", "123456:ABC-DEF")

# Set VBIT-API-STORE YouTube API Key
YOUTUBE_API_KEY = getenv("YOUTUBE_API_KEY", "v-bit-free-YOUR_UNIQUE_API_KEY")
YT_STREAM_GATEWAY = getenv("YT_STREAM_GATEWAY", "http://v-bit-api.com/")
AUTO_LEAVING_ASSISTANT = bool(getenv("AUTO_LEAVING_ASSISTANT", True))`}
                      language="python"
                      title="config.py"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PyTgCalls */}
            {activeTab === 'pytgcalls' && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.08]">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Direct PyTgCalls Audio Streaming Pipeline</h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    By fetching pre-muxed Opus streams from VBIT-API-STORE's endpoint, you bypass heavy local FFmpeg audio decoding and play directly in Telegram Voice Chats.
                  </p>

                  <div className="mt-6 space-y-4">
                    <CodeBlock
                      code={`from pytgcalls import PyTgCalls
from pytgcalls.types.input_stream import AudioPiped
import aiohttp

VBIT_API_KEY = "v-bit-free-YOUR_API_KEY"

async def play_youtube_track(pytgcalls_app, chat_id, query):
    """
    1. Resolve search query via VBIT-API-STORE
    2. Obtain direct Opus 160kbps stream URL
    3. Stream directly to Telegram Voice Chat
    """
    # Step 1: Search & Get Video ID
    async with aiohttp.ClientSession() as session:
        search_url = f"http://v-bit-api.com/search?q={query}&api_key={VBIT_API_KEY}"
        async with session.get(search_url) as resp:
            data = await resp.json()
            video_id = data['items'][0]['id']
            title = data['items'][0]['title']

        # Step 2: Get Direct Audio Stream
        stream_url_endpoint = f"http://v-bit-api.com/stream?id={video_id}&api_key={VBIT_API_KEY}"
        async with session.get(stream_url_endpoint) as stream_resp:
            stream_data = await stream_resp.json()
            direct_audio_url = stream_data['stream_url']

    # Step 3: Stream to Telegram Group Call
    await pytgcalls_app.join_group_call(
        chat_id,
        AudioPiped(direct_audio_url)
    )
    print(f"Now playing in {chat_id}: {title}")`}
                      language="python"
                      title="stream_helper.py"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Endpoints */}
            {activeTab === 'endpoints' && (
              <div className="space-y-6">
                
                {/* Endpoint 1 */}
                <div className="p-6 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.08] space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs">GET</span>
                    <span className="font-mono text-sm text-slate-900 dark:text-white font-semibold">/api/v1/yt/search</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Performs ultra-fast YouTube music search with cached metadata and thumbnail artwork.
                  </p>

                  <div className="text-xs space-y-1.5 pt-2">
                    <p className="font-bold text-slate-700 dark:text-slate-400">Parameters:</p>
                    <p><code className="text-purple-400 font-mono">q</code> (string, required): Search query or song title.</p>
                    <p><code className="text-purple-400 font-mono">limit</code> (integer, optional): Max results (1 to 25, default: 10).</p>
                    <p><code className="text-purple-400 font-mono">api_key</code> (string, required if header not set): VBIT-API-STORE API key.</p>
                  </div>
                </div>

                {/* Endpoint 2 */}
                <div className="p-6 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.08] space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs">GET</span>
                    <span className="font-mono text-sm text-slate-900 dark:text-white font-semibold">/api/v1/yt/info</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Retrieves detailed video/track metadata, duration in seconds, and available audio formats.
                  </p>
                </div>

                {/* Endpoint 3 */}
                <div className="p-6 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.08] space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs">GET</span>
                    <span className="font-mono text-sm text-slate-900 dark:text-white font-semibold">/api/v1/yt/stream</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Extracts high-speed direct Opus audio streaming URL optimized for Telegram Voice Calls.
                  </p>
                </div>

                {/* Endpoint 4 */}
                <div className="p-6 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.08] space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs">GET</span>
                    <span className="font-mono text-sm text-slate-900 dark:text-white font-semibold">/api/v1/yt/quota</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Returns real-time daily quota usage, remaining requests, and rate limit status for the API key.
                  </p>
                </div>

              </div>
            )}

            {/* TAB: Interactive API Sandbox */}
            {activeTab === 'console' && (
              <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/[0.08] space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/[0.08]">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Live API Request Console</h2>
                  </div>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Endpoint Sandbox</span>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-400 font-semibold mb-1">Target Endpoint</label>
                    <select
                      value={testEndpoint}
                      onChange={(e) => setTestEndpoint(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-[#070A10] border border-slate-300 dark:border-white/[0.08] rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:border-purple-500 focus:outline-none"
                    >
                      <option value="/api/v1/yt/search">GET /api/v1/yt/search (Search Tracks)</option>
                      <option value="/api/v1/yt/info">GET /api/v1/yt/info (Track Details)</option>
                      <option value="/api/v1/yt/stream">GET /api/v1/yt/stream (Direct Opus Stream)</option>
                      <option value="/api/v1/yt/quota">GET /api/v1/yt/quota (Check Quota Remaining)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-400 font-semibold mb-1">Query / Video ID</label>
                    <input
                      type="text"
                      value={testQuery}
                      onChange={(e) => setTestQuery(e.target.value)}
                      placeholder="e.g. Alan Walker Faded or 60ItHLz5WEA"
                      className="w-full bg-slate-100 dark:bg-[#070A10] border border-slate-300 dark:border-white/[0.08] rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 dark:text-slate-400 font-semibold mb-1">API Key Credential</label>
                    <input
                      type="text"
                      value={testApiKey}
                      onChange={(e) => setTestApiKey(e.target.value)}
                      placeholder="yt_live_..."
                      className="w-full bg-slate-100 dark:bg-[#070A10] border border-slate-300 dark:border-white/[0.08] rounded-xl px-3 py-2 text-purple-400 font-mono focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Send Button */}
                <button
                  onClick={runApiTest}
                  disabled={testLoading}
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl btn-gradient-purple text-white font-bold text-xs shadow-lg transition-all"
                >
                  {testLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Execute Sandbox Request</span>
                    </>
                  )}
                </button>

                {/* Response Viewer */}
                {testResponse && (
                  <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-white/[0.08]">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-600 dark:text-slate-400">Response Payload:</span>
                      <span className="text-emerald-400 font-bold">Latency: {testLatency}ms</span>
                    </div>
                    <CodeBlock
                      code={JSON.stringify(testResponse, null, 2)}
                      language="json"
                      title="Response JSON"
                    />
                  </div>
                )}

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
