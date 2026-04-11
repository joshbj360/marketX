<template>
  <div class="offline-page">
    <div class="offline-card">
      <!-- Animated icon -->
      <div class="icon-wrap">
        <div class="icon-ring" />
        <div class="icon-ring icon-ring--2" />
        <svg class="icon-store" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="34" width="60" height="36" rx="5" fill="white" opacity="0.9"/>
          <path d="M4 34 Q4 14 22 14 L58 14 Q76 14 76 34 Z" fill="white" opacity="0.7"/>
          <rect x="28" y="48" width="24" height="22" rx="4" fill="#F43F5E"/>
          <rect x="12" y="39" width="18" height="13" rx="3" fill="#F43F5E" opacity="0.5"/>
          <rect x="50" y="39" width="18" height="13" rx="3" fill="#F43F5E" opacity="0.5"/>
          <rect x="16" y="16" width="48" height="13" rx="4" fill="#F43F5E"/>
          <text x="40" y="25" font-family="system-ui,sans-serif" font-weight="900" font-size="7" fill="white" text-anchor="middle" dominant-baseline="middle">MarketX</text>
        </svg>
      </div>

      <h1>You're offline</h1>
      <p>Check your internet connection and try again. Your recent pages are still available from cache.</p>

      <button @click="retry">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
        </svg>
        Try again
      </button>

      <div class="cached-links">
        <p class="cached-label">Quick links</p>
        <div class="link-row">
          <a href="/">Home</a>
          <a href="/discover">Discover</a>
          <a href="/map">Near Me</a>
          <a href="/reels">Reels</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

useSeoMeta({ title: 'Offline | MarketX', robots: 'noindex' })

const retry = () => window.location.reload()
</script>

<style scoped>
.offline-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f172a;
  padding: 24px;
}

.offline-card {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
}

/* ── Animated icon ── */
.icon-wrap {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.icon-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgba(244, 63, 94, 0.3);
  animation: ringPulse 2.4s ease-out infinite;
}
.icon-ring--2 {
  animation-delay: 1.2s;
}
@keyframes ringPulse {
  0%   { transform: scale(0.7); opacity: 0.8; }
  70%  { transform: scale(1.3); opacity: 0; }
  100% { transform: scale(1.3); opacity: 0; }
}

.icon-store {
  position: relative;
  z-index: 1;
  width: 80px;
  height: 80px;
  background: #F43F5E;
  border-radius: 22px;
  padding: 8px;
  box-shadow: 0 8px 32px rgba(244, 63, 94, 0.4);
}

/* ── Text ── */
h1 {
  font-size: 22px;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.3px;
  margin: 0;
}

p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.6;
  margin: 0;
  max-width: 280px;
}

/* ── Retry button ── */
button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  padding: 12px 28px;
  border-radius: 9999px;
  background: #F43F5E;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(244, 63, 94, 0.4);
  transition: transform 0.15s, box-shadow 0.15s;
}
button:hover  { transform: scale(1.04); box-shadow: 0 6px 24px rgba(244, 63, 94, 0.5); }
button:active { transform: scale(0.97); }
button svg { width: 16px; height: 16px; }

/* ── Cached links ── */
.cached-links {
  margin-top: 12px;
  width: 100%;
  border-top: 1px solid rgba(255,255,255,0.07);
  padding-top: 20px;
}

.cached-label {
  font-size: 11px !important;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.25) !important;
  margin-bottom: 12px !important;
}

.link-row {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.link-row a {
  padding: 8px 16px;
  border-radius: 9999px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.7);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}
.link-row a:hover {
  background: rgba(255,255,255,0.1);
  color: #fff;
}
</style>
