#!/usr/bin/env python3
"""
YouTube API Music - Telegram Music Bot Client Module (youtube.py)

This module provides a production-ready Python SDK for Telegram Music Bots
(YukkiMusic, AnonXMusic, DaisyXMusic, PyTgCalls) to search, stream, and download
YouTube audio tracks with anti-ban quota bypassing.

Gateway URL: https://vbit-api-store.vercel.app/api/v1/yt
Documentation: https://vbit-api-store.vercel.app/docs
Support: https://t.me/VAMPIREUPDATES
"""

import os
import time
import requests
from typing import Dict, List, Optional, Any


class YouTubeMusicAPI:
    """Client for the TuneKey / VBIT-API-STORE YouTube Music API Gateway."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None
    ):
        """
        Initialize the API client.

        Args:
            api_key: Your VBIT-API-STORE bot API key (or reads from env YOUTUBE_API_KEY / API_KEY)
            base_url: Gateway endpoint URL (default: https://vbit-api-store.vercel.app/api/v1/yt)
        """
        self.api_key = api_key or os.getenv("API_KEY") or os.getenv("YOUTUBE_API_KEY", "")
        self.base_url = (base_url or os.getenv("API_URL") or "https://vbit-api-store.vercel.app/api/v1/yt").rstrip("/")
        self.headers = {
            "X-API-Key": self.api_key,
            "User-Agent": "TuneKey-TelegramMusicBot/3.0"
        }

    def _make_request(
        self,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Make an authenticated HTTP GET request to the gateway."""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        req_params = params.copy() if params else {}
        if self.api_key:
            req_params["api_key"] = self.api_key

        response = requests.get(url, headers=self.headers, params=req_params, timeout=12)
        response.raise_for_status()
        return response.json()

    def check_quota(self) -> Dict[str, Any]:
        """
        Check real-time daily quota and used requests for your key.

        Returns:
            Dict with daily_quota, today_requests, remaining_today, total_quota, used_quota
        """
        return self._make_request("/quota")

    def search(
        self,
        query: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Search for YouTube tracks (Hindi, English, Regional, etc.).

        Args:
            query: Song name, artist, or YouTube URL
            limit: Maximum search results (default: 10, max: 25)

        Returns:
            List of track dicts with id, title, duration, channel, views, thumbnail, url
        """
        result = self._make_request(
            "/search",
            params={
                "q": query,
                "limit": limit
            }
        )
        return result.get("items", [])

    def get_track_info(self, video_id: str) -> Dict[str, Any]:
        """
        Get detailed video and audio stream metadata.

        Args:
            video_id: YouTube video ID (e.g. 'Umqb9KENgmk')

        Returns:
            Metadata dict including title, duration, channels, views, and audio formats
        """
        return self._make_request("/info", params={"id": video_id})

    def get_audio_stream(self, video_id: str) -> Dict[str, Any]:
        """
        Get direct Opus 160kbps stream URL for Telegram Voice Chat (PyTgCalls).

        Args:
            video_id: YouTube video ID

        Returns:
            Dict with direct stream_url, format, bitrate, and protocol
        """
        return self._make_request("/stream", params={"id": video_id})

    def download_audio(
        self,
        video_id: str,
        output_filename: Optional[str] = None
    ) -> str:
        """
        Download high-quality audio file directly.

        Args:
            video_id: YouTube video ID
            output_filename: Destination filename (default: <video_id>.opus)

        Returns:
            Path to downloaded audio file
        """
        stream_info = self.get_audio_stream(video_id)
        stream_url = stream_info.get("stream_url")
        if not stream_url:
            raise ValueError(f"Could not retrieve audio stream for video {video_id}")

        dest_file = output_filename or f"{video_id}.opus"
        resp = requests.get(stream_url, headers=self.headers, stream=True, timeout=30)
        resp.raise_for_status()

        with open(dest_file, "wb") as f:
            for chunk in resp.iter_content(chunk_size=65536):
                if chunk:
                    f.write(chunk)

        return dest_file


# --- Quick Command Line Demonstration ---
if __name__ == "__main__":
    # Replace with your active API key from https://vbit-api-store.vercel.app/dashboard
    DEMO_KEY = os.getenv("API_KEY", "v-bit-free-861a16fa79c346ec8b9b9720")
    
    print("=" * 60)
    print(" 🎵 TuneKey / VBIT-API-STORE YouTube Music Bot Client")
    print("=" * 60)

    client = YouTubeMusicAPI(api_key=DEMO_KEY)

    # 1. Check Quota
    print("\n[1] Checking Key Quota:")
    try:
        quota = client.check_quota()
        print(f"    • Status: {quota.get('status')}")
        print(f"    • Today Requests: {quota.get('today_requests')} / {quota.get('daily_quota')}")
        print(f"    • Remaining Today: {quota.get('remaining_today')}")
    except Exception as e:
        print(f"    Error: {e}")

    # 2. Search Song
    query = "Kesariya Arijit Singh"
    print(f"\n[2] Searching for: '{query}':")
    tracks = client.search(query, limit=3)
    for idx, t in enumerate(tracks, 1):
        print(f"    {idx}. {t.get('title')} ({t.get('duration')}) [ID: {t.get('id')}]")

    # 3. Resolve Stream Link
    if tracks:
        first_id = tracks[0]["id"]
        print(f"\n[3] Resolving Stream URL for ID: {first_id}:")
        stream = client.get_audio_stream(first_id)
        print(f"    • Stream URL: {stream.get('stream_url')}")
        print(f"    • Format: {stream.get('format')} @ {stream.get('bitrate')}kbps")

    print("\n" + "=" * 60)
    print(" ✅ Client ready for YukkiMusic, AnonX, and PyTgCalls bots!")
    print("=" * 60)
