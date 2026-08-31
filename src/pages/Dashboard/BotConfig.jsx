import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import CodeBlock from '../../components/CodeBlock';
import { Bot, Radio, Headphones, Download, Copy, Check, Sparkles, Terminal, FileCode, CheckCircle2 } from 'lucide-react';

export default function BotConfig() {
  const [keys, setKeys] = useState([]);
  const [selectedKey, setSelectedKey] = useState('');
  const [framework, setFramework] = useState('yukki');
  const [apiId, setApiId] = useState('12345678');
  const [apiHash, setApiHash] = useState('abcdef0123456789abcdef0123456789');
  const [botToken, setBotToken] = useState('123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11');
  const [bitrate, setBitrate] = useState('160');

  useEffect(() => {
    async function loadKeys() {
      try {
        const res = await api.get('/user/keys');
        const active = res.data.keys || [];
        setKeys(active);
        if (active.length > 0) {
          setSelectedKey(active[0].api_key);
        }
      } catch (err) {
        console.error('Failed to load keys:', err);
      }
    }
    loadKeys();
  }, []);

  const generateConfigContent = () => {
    const keyVal = selectedKey || 'tk_live_yt_YOUR_API_KEY';

    if (framework === 'yukki') {
      return `# YukkiMusic Bot - Config.env
API_ID = ${apiId}
API_HASH = "${apiHash}"
BOT_TOKEN = "${botToken}"
OWNER_ID = 987654321
STRING_SESSION = "your_pyrogram_string_session"

# TuneKey Dedicated YouTube API Credentials
YOUTUBE_API_KEY = "${keyVal}"
YOUTUBE_API_PROXY = "https://api.tunekey.io/api/v1/yt"
AUDIO_STREAM_BITRATE = ${bitrate}
AUTO_LEAVING_ASSISTANT = True
SUPPORT_CHANNEL = "https://t.me/VAMPIREUPDATES"`;
    } else if (framework === 'anonx') {
      return `# AnonXMusic Bot - config.py
import os
from os import getenv

API_ID = int(getenv("API_ID", "${apiId}"))
API_HASH = getenv("API_HASH", "${apiHash}")
BOT_TOKEN = getenv("BOT_TOKEN", "${botToken}")
OWNER_ID = int(getenv("OWNER_ID", "987654321"))

# TuneKey Dedicated YouTube Engine
YOUTUBE_API_KEY = getenv("YOUTUBE_API_KEY", "${keyVal}")
YT_STREAM_GATEWAY = "https://api.tunekey.io/api/v1/yt"
STREAM_BITRATE = ${bitrate}
AUTO_LEAVING_ASSISTANT = True`;
    } else if (framework === 'pytgcalls') {
      return `# PyTgCalls Raw Audio Streaming Client
from pytgcalls import PyTgCalls
from pytgcalls.types.input_stream import AudioPiped
import aiohttp

TUNEKEY_API_KEY = "${keyVal}"
GATEWAY_URL = "https://api.tunekey.io/api/v1/yt"

async def play_voice_stream(pytgcalls, chat_id, query):
    """
    Direct zero-CPU stream resolution via TuneKey Opus node
    """
    async with aiohttp.ClientSession() as session:
        endpoint = f"{GATEWAY_URL}/stream?id={query}&api_key={TUNEKEY_API_KEY}"
        async with session.get(endpoint) as resp:
            data = await resp.json()
            stream_url = data.get('stream_url')
            
    await pytgcalls.join_group_call(
        chat_id,
        AudioPiped(stream_url)
    )
    print(f"Streaming connected at ${bitrate}kbps Opus.")`;
    } else {
      return `# Custom Environment Variables
API_ID=${apiId}
API_HASH=${apiHash}
BOT_TOKEN=${botToken}
YOUTUBE_API_KEY=${keyVal}
YOUTUBE_API_PROXY=https://api.tunekey.io/api/v1/yt
STREAM_BITRATE=${bitrate}`;
    }
  };

  const handleDownload = () => {
    const filename = framework === 'yukki' ? 'config.env' : framework === 'anonx' ? 'config.py' : 'stream_bot.py';
    const content = generateConfigContent();
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Bot Configuration Generator</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Select your active TuneKey API key and framework to generate ready-to-run `.env` or `config.py` files.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls Column */}
        <div className="glass-panel rounded-3xl p-6 space-y-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-slate-800">
            1. Select Bot Parameters
          </h3>

          {/* Select Active Key */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Inject API Key
            </label>
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="w-full bg-slate-100 dark:bg-[#070A10] border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:border-brand-500 focus:outline-none"
            >
              {keys.map((k) => (
                <option key={k.id} value={k.api_key}>
                  {k.key_name} ({k.api_key.substring(0, 18)}...)
                </option>
              ))}
              {keys.length === 0 && <option value="">No keys found (using placeholder)</option>}
            </select>
          </div>

          {/* Framework Choice */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Bot Framework
            </label>
            <select
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              className="w-full bg-slate-100 dark:bg-[#070A10] border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
            >
              <option value="yukki">YukkiMusic Bot v3.x (.env)</option>
              <option value="anonx">AnonX / DaisyBot (config.py)</option>
              <option value="pytgcalls">PyTgCalls Voice Client (Python)</option>
              <option value="generic">Generic .env format</option>
            </select>
          </div>

          {/* Telegram Credentials */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">API ID</label>
            <input
              type="text"
              value={apiId}
              onChange={(e) => setApiId(e.target.value)}
              className="w-full bg-slate-100 dark:bg-[#070A10] border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">API HASH</label>
            <input
              type="text"
              value={apiHash}
              onChange={(e) => setApiHash(e.target.value)}
              className="w-full bg-slate-100 dark:bg-[#070A10] border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Audio Bitrate (kbps)</label>
            <select
              value={bitrate}
              onChange={(e) => setBitrate(e.target.value)}
              className="w-full bg-slate-100 dark:bg-[#070A10] border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:border-brand-500 focus:outline-none"
            >
              <option value="160">160kbps Opus (Telegram VC standard)</option>
              <option value="128">128kbps AAC (Low latency)</option>
              <option value="320">320kbps High Definition</option>
            </select>
          </div>

          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Configuration File</span>
          </button>
        </div>

        {/* Code Preview Column */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-brand-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Generated Configuration Output</h3>
              </div>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">Ready to Deploy</span>
            </div>

            <div className="mt-4">
              <CodeBlock
                code={generateConfigContent()}
                language={framework === 'yukki' ? 'env' : 'python'}
                title={framework === 'yukki' ? 'config.env' : 'config.py'}
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Drop this file directly onto your bot VPS and restart with `bash start` or `pm2 restart`.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
