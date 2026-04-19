// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      charset: 'utf-8',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'theme-color', content: '#F43F5E' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'MarketX' },
        { name: 'application-name', content: 'MarketX' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [
        { rel: 'apple-touch-icon', sizes: '192x192', href: '/icons/icon-192.svg' },
        { rel: 'icon', type: 'image/svg+xml', href: '/icons/icon-512.svg' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'preconnect', href: 'https://res.cloudinary.com' },
        // Non-blocking font load — preload first, swap to stylesheet on load
        {
          rel: 'preload',
          as: 'style',
          href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Sora:wght@700;800&display=swap',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Sora:wght@700;800&display=swap',
          media: 'print',
          onload: "this.media='all'",
        },
      ],
    },
  },

  extends: [
    './layers/ai',
    './layers/core',
    './layers/feed',
    './layers/seller',
    './layers/profile',
    './layers/commerce',
    './layers/social',
    './layers/map',
    './layers/square',
  ],

  modules: [
    '@nuxt/icon',
    '@pinia/nuxt',
    'nuxt3-notifications',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    'pinia-plugin-persistedstate/nuxt',
    '@nuxt/image',
    '@nuxtjs/i18n',
    '@vite-pwa/nuxt',
  ],

  // ── PWA ─────────────────────────────────────────────────────────────────────
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'MarketX',
      short_name: 'MarketX',
      description: 'Your business, fully alive. Discover stores, buy local, sell globally.',
      theme_color: '#F43F5E',
      background_color: '#0f172a',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/?source=pwa',
      id: '/',
      categories: ['shopping', 'business', 'social'],
      icons: [
        { src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
        { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
        { src: '/icons/icon-maskable-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
      ],
      shortcuts: [
        {
          name: 'Discover', short_name: 'Discover',
          description: 'Browse trending products and stores',
          url: '/discover?source=pwa-shortcut',
          icons: [{ src: '/icons/shortcut-discover.svg', sizes: '96x96' }],
        },
        {
          name: 'Near Me', short_name: 'Near Me',
          description: 'Find stores around you',
          url: '/map?source=pwa-shortcut',
          icons: [{ src: '/icons/shortcut-map.svg', sizes: '96x96' }],
        },
        {
          name: 'My Store', short_name: 'Sell',
          description: 'Manage your store',
          url: '/seller/dashboard?source=pwa-shortcut',
          icons: [{ src: '/icons/shortcut-sell.svg', sizes: '96x96' }],
        },
      ],
    },
    workbox: {
      // Cache strategy: network-first for API, cache-first for static assets
      navigateFallback: '/offline',
      globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,woff2}'],
      runtimeCaching: [
        {
          // Cloudinary images — cache-first, 30 day TTL
          urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'cloudinary-images',
            expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
          },
        },
        {
          // API responses — network-first, fall back to cache
          urlPattern: /^https?:\/\/.*\/api\/.*/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 5 },
            networkTimeoutSeconds: 10,
          },
        },
      ],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: false, // disable in dev to avoid noise
      type: 'module',
    },
  },

  // ── i18n ─────────────────────────────────────────────────────────────────────
  i18n: {
    defaultLocale: 'en',
    langDir: 'locales/',
    lazy: true,
    strategy: 'no_prefix',
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'fr', name: 'Français', file: 'fr.json' },
      { code: 'es', name: 'Español', file: 'es.json' },
      { code: 'de', name: 'Deutsch', file: 'de.json' },
      { code: 'pt', name: 'Português', file: 'pt.json' },
      { code: 'zh', name: '中文', file: 'zh.json' },
      { code: 'ar', name: 'العربية', file: 'ar.json', dir: 'rtl' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      fallbackLocale: 'en',
    },
  },

  // ── Image ────────────────────────────────────────────────────────────────────
  image: {
    provider: 'cloudinary',
    cloudinary: {
      baseURL: 'https://res.cloudinary.com/dcci05bzj',
    },
  },

  // ── Nitro ────────────────────────────────────────────────────────────────────
  nitro: {
    plugins: ['plugins/monitoring', 'plugins/workers'],
    compressPublicAssets: true,
    minify: true,
    experimental: {
      websocket: true,
      tasks: true,
    },
    scheduledTasks: {
      '* * * * *': ['processQueues'],
      '0 */6 * * *': ['releaseShippedOrders'],
    },
    routeRules: {
      '/**': {
        headers: {
          'X-Frame-Options': 'SAMEORIGIN',
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
          'Permissions-Policy': 'geolocation=(self), camera=(), microphone=()',
          'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        },
      },
      // Long-lived cache for hashed static assets
      '/_nuxt/**': {
        headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
      },
    },
  },

  // ── Vite ─────────────────────────────────────────────────────────────────────
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-vue': ['vue', 'vue-router', 'pinia'],
            'vendor-ui': ['@vueuse/core'],
          },
        },
      },
    },
  },

  // ── Color mode ───────────────────────────────────────────────────────────────
  colorMode: {
    preference: 'system',
    fallback: 'light',
    globalName: '__NUXT_COLOR_MODE__',
    componentName: 'ColorScheme',
    classPrefix: 'theme-',
    classSuffix: '-mode',
    storageKey: 'nuxt-color-mode',
  },

  // ── Runtime config ───────────────────────────────────────────────────────────
  runtimeConfig: {
    jamendoClientId: process.env.JAMENDO_CLIENT_ID || '',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
    grokApiKey: process.env.GROK_API_KEY,
    googleApiKey: process.env.GOOGLE_API_KEY,
    paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
    upstashRedisUrl: process.env.UPSTASH_REDIS_REST_URL,
    upstashRedisToken: process.env.UPSTASH_REDIS_REST_TOKEN,
    platformCommissionRate: process.env.PLATFORM_COMMISSION_RATE,
    resendApiKey: process.env.RESEND_API_KEY,
    shippoApiKey: process.env.SHIPPO_API_KEY,
    shippoWebhookSecret: process.env.SHIPPO_WEBHOOK_SECRET,
    sendboxAccessToken: process.env.SENDBOX_ACCESS_TOKEN,
    sendboxClientSecret: process.env.SENDBOX_CLIENT_SECRET,
    sendboxWebhookSecret: process.env.SENDBOX_WEBHOOK_SECRET,
    paypalClientId: process.env.PAYPAL_CLIENT_ID,
    paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET,
    soketiAppId: process.env.SOKETI_APP_ID || '1',
    soketiKey: process.env.SOKETI_KEY || 'app-key',
    soketiSecret: process.env.SOKETI_SECRET || 'app-secret',
    soketiHost: process.env.SOKETI_HOST || '127.0.0.1',
    soketiPort: process.env.SOKETI_PORT || '6001',
    soketiUseTLS: process.env.SOKETI_USE_TLS || 'false',
    public: {
      // Brand — all UI fallbacks read from here. Change .env, not component code.
      siteName: process.env.NUXT_PUBLIC_SITE_NAME || 'MarketX',
      brandDomain: process.env.NUXT_PUBLIC_BRAND_DOMAIN || 'marketx.app',
      supportEmail: process.env.NUXT_PUBLIC_SUPPORT_EMAIL || 'support@marketx.app',
      privacyEmail: process.env.NUXT_PUBLIC_PRIVACY_EMAIL || 'privacy@marketx.app',
      legalEmail: process.env.NUXT_PUBLIC_LEGAL_EMAIL || 'legal@marketx.app',
      baseURL: process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      // Payments
      paystackPk: process.env.PAYSTACK_PUBLIC_KEY,
      // Cloudinary
      CloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      cloudinaryUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
      // Email
      senderEmail: process.env.SENDER_EMAIL,
      // Soketi / Pusher (client-side only — no secret)
      soketiKey: process.env.SOKETI_KEY || 'app-key',
      soketiHost: process.env.SOKETI_HOST || '127.0.0.1',
      soketiPort: process.env.SOKETI_PORT || '6001',
      soketiUseTLS: process.env.SOKETI_USE_TLS || 'false',
    },
    private: {
      cloudinary: {
        apiSecret: process.env.CLOUDINARY_API_SECRET,
      },
    },
  },
})
