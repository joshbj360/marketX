<template>
  <div
    class="min-h-screen overflow-x-hidden bg-white font-sans antialiased selection:bg-brand/20"
  >
    <!-- ── Nav ─────────────────────────────────────────────── -->
    <nav
      class="fixed z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl"
    >
      <div
        class="mx-auto flex h-16 max-w-7xl items-center justify-between px-5"
      >
        <NuxtLink to="/" class="flex items-center gap-2.5">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-xl bg-brand shadow-lg shadow-brand/20"
          >
            <span class="text-sm font-black italic text-white">MX</span>
          </div>
          <span
            class="text-xl font-black uppercase tracking-tighter text-gray-900"
            >MarketX<span class="text-brand">.</span></span
          >
        </NuxtLink>

        <div class="hidden items-center gap-8 lg:flex">
          <a
            href="#features"
            class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 transition-colors hover:text-brand"
            >Platform</a
          >
          <a
            href="#how"
            class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 transition-colors hover:text-brand"
            >How it works</a
          >
          <a
            href="#sellers"
            class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 transition-colors hover:text-brand"
            >Sell on MarketX</a
          >
          <a
            href="#affiliate"
            class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 transition-colors hover:text-brand"
            >Affiliate</a
          >
          <NuxtLink
            to="/discover"
            class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 transition-colors hover:text-brand"
            >Browse feed</NuxtLink
          >
        </div>

        <div class="flex items-center gap-3">
          <NuxtLink
            to="/user-login"
            class="hidden text-xs font-bold text-gray-700 transition-colors hover:text-brand sm:block"
          >
            Sign in
          </NuxtLink>
          <NuxtLink
            to="/user-register"
            class="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white shadow-xl shadow-slate-900/10 transition-all hover:bg-brand"
          >
            Get started
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- ── Ticker ────────────────────────────────────────────── -->
    <div
      class="fixed top-16 z-40 w-full overflow-hidden bg-brand text-white"
      style="height: 28px"
    >
      <div
        class="ticker-track flex h-full items-center gap-0 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.15em]"
      >
        <span v-for="item in tickerItems" :key="item" class="px-8">{{
          item
        }}</span>
        <!-- duplicate for seamless loop -->
        <span v-for="item in tickerItems" :key="'b' + item" class="px-8">{{
          item
        }}</span>
      </div>
    </div>

    <!-- ── Hero ──────────────────────────────────────────────── -->
    <section class="overflow-hidden px-5 pb-20 pt-44">
      <div class="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        <!-- Left copy -->
        <div class="space-y-8">
          <div
            class="inline-flex items-center gap-2 rounded-full border border-brand/10 bg-brand/5 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-brand"
          >
            <span
              class="h-1.5 w-1.5 animate-pulse rounded-full bg-brand"
            ></span>
            A Social Commerce Engine by Indices
          </div>

          <h1
            class="text-6xl font-black uppercase leading-[0.88] tracking-tighter text-gray-900 sm:text-7xl lg:text-8xl"
          >
            See it.<br />
            <span class="font-serif lowercase italic text-brand">Love it.</span
            ><br />
            Buy it.
          </h1>

          <p class="max-w-md text-xl font-light leading-relaxed text-gray-500">
            MarketX is where everyday businesses run, grow, and get discovered.
            Find stores near you, buy directly from the feed, and sell to the
            world — all in one place.
          </p>

          <div class="flex flex-col gap-4 sm:flex-row">
            <NuxtLink
              to="/"
              class="inline-flex items-center justify-center gap-3 rounded-2xl bg-brand px-10 py-5 text-lg font-bold text-white shadow-2xl shadow-brand/30 transition-all hover:scale-[1.03] active:scale-[0.98]"
            >
              Open MarketX
              <span class="text-xl">→</span>
            </NuxtLink>
            <NuxtLink
              to="/discover"
              class="inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-slate-200 px-8 py-4 text-base font-bold text-slate-700 transition-all hover:border-brand hover:text-brand"
            >
              <span>✦</span> Browse feed
            </NuxtLink>
          </div>

          <!-- Stats -->
          <div class="flex items-center gap-8 pt-2">
            <div>
              <p class="text-3xl font-black text-gray-900">10K+</p>
              <p
                class="text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                Verified Sellers
              </p>
            </div>
            <div class="h-10 w-px bg-gray-100"></div>
            <div>
              <p class="text-3xl font-black text-gray-900">50K+</p>
              <p
                class="text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                Products
              </p>
            </div>
            <div class="h-10 w-px bg-gray-100"></div>
            <div>
              <p class="text-3xl font-black text-gray-900">30+</p>
              <p
                class="text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                Countries
              </p>
            </div>
          </div>
        </div>

        <!-- Right: phone mockup -->
        <div class="relative flex justify-center lg:justify-end">
          <div
            class="group relative h-[580px] w-72 overflow-hidden rounded-[3.5rem] border-[10px] border-gray-900 bg-gray-950 shadow-2xl"
          >
            <div class="absolute inset-0 overflow-hidden bg-white">
              <!-- Notch -->
              <div class="flex h-7 items-center justify-center bg-white">
                <div class="h-5 w-24 rounded-b-2xl bg-gray-950"></div>
              </div>
              <!-- App bar -->
              <div
                class="flex h-12 items-center justify-between border-b border-gray-100 px-5"
              >
                <span class="text-sm font-black lowercase italic text-brand"
                  >MarketX.</span
                >
                <div class="flex gap-3 text-lg text-gray-400">
                  <span>🔍</span><span>❤️</span>
                </div>
              </div>
              <!-- Feed post -->
              <div>
                <div class="flex items-center gap-2.5 px-4 py-2.5">
                  <div
                    class="h-8 w-8 rounded-full bg-gradient-to-tr from-brand to-pink-300 ring-2 ring-brand/30"
                  ></div>
                  <div>
                    <p class="text-xs font-bold text-gray-900">amara_styles</p>
                    <p class="text-[9px] font-bold uppercase text-gray-400">
                      Lagos, NG · 2m ago
                    </p>
                  </div>
                  <button
                    class="ml-auto rounded-full border border-brand/30 px-2 py-0.5 text-[9px] font-black text-brand"
                  >
                    Follow
                  </button>
                </div>
                <!-- Image -->
                <div
                  class="relative aspect-square overflow-hidden bg-slate-100"
                >
                  <div
                    class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    :style="{
                      backgroundImage: `url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600')`,
                    }"
                  ></div>
                  <div
                    class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"
                  ></div>
                  <div
                    class="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-[9px] font-black text-gray-900 shadow-xl backdrop-blur"
                  >
                    Ankara Wrap Dress · ₦22,500
                  </div>
                  <div
                    class="absolute bottom-3 right-3 animate-bounce rounded-full bg-brand px-3 py-1.5 text-[9px] font-black text-white shadow-xl"
                  >
                    Shop →
                  </div>
                </div>
                <!-- Actions -->
                <div class="space-y-1.5 px-4 py-2.5">
                  <div class="flex gap-4 text-base">
                    <span>❤️</span><span>💬</span><span>✈️</span
                    ><span class="ml-auto">🔖</span>
                  </div>
                  <p class="text-[10px] font-black text-gray-900">
                    3,241 likes
                  </p>
                  <p class="line-clamp-1 text-[9px] italic text-gray-500">
                    "Found at Balogun market! Last 2 pieces left"
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Floating: payout -->
          <div
            class="animate-float absolute -left-8 -top-4 hidden rounded-2xl border border-slate-100 bg-white px-5 py-3.5 shadow-2xl sm:block"
          >
            <p
              class="mb-0.5 text-[9px] font-black uppercase tracking-widest text-slate-400"
            >
              Live Settlement
            </p>
            <p class="text-lg font-black text-emerald-500">+ ₦240,500</p>
            <p class="text-[8px] text-slate-400">Payout via Indices FinTech</p>
          </div>

          <!-- Floating: shipment -->
          <div
            class="animate-float-delayed absolute -right-8 bottom-16 hidden rounded-2xl bg-slate-900 px-4 py-3.5 shadow-2xl sm:block"
          >
            <div class="flex items-center gap-3">
              <span class="text-xl">📦</span>
              <div>
                <p
                  class="text-[9px] font-bold uppercase tracking-widest text-white"
                >
                  In Transit
                </p>
                <p class="text-[10px] text-slate-400">
                  London, UK · DHL · 3 days
                </p>
              </div>
            </div>
          </div>

          <!-- Floating: new follower -->
          <div
            class="animate-float absolute -left-10 bottom-48 hidden rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-2xl xl:block"
            style="animation-delay: 2.5s"
          >
            <div class="flex items-center gap-2.5">
              <div
                class="h-7 w-7 rounded-full bg-gradient-to-tr from-purple-400 to-pink-300"
              ></div>
              <div>
                <p class="text-[9px] font-black text-gray-900">
                  kemi.fashion followed you
                </p>
                <p class="text-[8px] text-gray-400">Just now</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Marquee logos / trust ──────────────────────────────── -->
    <div class="overflow-hidden border-y border-gray-100 bg-slate-50 py-8">
      <div class="marquee-track flex items-center whitespace-nowrap">
        <span
          v-for="brand in trustItems"
          :key="brand"
          class="shrink-0 px-8 text-xs font-black uppercase tracking-widest text-gray-300"
          >{{ brand }}</span
        >
        <span
          v-for="brand in trustItems"
          :key="'r' + brand"
          class="shrink-0 px-8 text-xs font-black uppercase tracking-widest text-gray-300"
          >{{ brand }}</span
        >
      </div>
    </div>

    <!-- ── Features ───────────────────────────────────────────── -->
    <section id="features" class="px-5 py-24">
      <div class="mx-auto max-w-7xl">
        <div class="mb-16 space-y-3 text-center">
          <p
            class="text-[10px] font-black uppercase tracking-[0.3em] text-brand"
          >
            The Ecosystem
          </p>
          <h2 class="text-4xl font-black tracking-tighter text-gray-900">
            Built for how Africa shops
          </h2>
        </div>

        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            to="/discover"
            class="group block rounded-3xl border border-slate-100 bg-white p-8 transition-all hover:border-brand/30 hover:shadow-2xl"
          >
            <div
              class="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-2xl transition-all group-hover:scale-110 group-hover:bg-brand"
            >
              🛍️
            </div>
            <h3 class="mb-2 text-lg font-black text-gray-900">
              Shoppable Feed
            </h3>
            <p class="text-sm leading-relaxed text-gray-500">
              Scroll a live feed of fashion posts. Every image has a price tag.
              Tap to buy without leaving the app.
            </p>
            <p
              class="mt-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand group-hover:gap-2"
            >
              Browse now <span>→</span>
            </p>
          </NuxtLink>

          <NuxtLink
            to="/thrift"
            class="group block rounded-3xl border border-slate-100 bg-white p-8 transition-all hover:border-brand/30 hover:shadow-2xl"
          >
            <div
              class="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-2xl transition-all group-hover:scale-110 group-hover:bg-amber-500"
            >
              ♻️
            </div>
            <h3 class="mb-2 text-lg font-black text-gray-900">Thrift Market</h3>
            <p class="text-sm leading-relaxed text-gray-500">
              A dedicated section for pre-loved fashion. Sell what you no longer
              wear, discover one-of-a-kind pieces continent-wide.
            </p>
            <p
              class="mt-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand"
            >
              Explore thrift <span>→</span>
            </p>
          </NuxtLink>

          <div
            class="group rounded-3xl border border-slate-100 bg-white p-8 transition-all hover:border-brand/30 hover:shadow-2xl"
          >
            <div
              class="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-2xl transition-all group-hover:scale-110 group-hover:bg-purple-600"
            >
              🧠
            </div>
            <h3 class="mb-2 text-lg font-black text-gray-900">
              RAG Style Intelligence
            </h3>
            <p class="text-sm leading-relaxed text-gray-500">
              Powered by AxiomsAI. Describe your look in plain English. Our AI
              finds it, styles it, and learns your taste over time.
            </p>
          </div>

          <div
            class="group rounded-3xl border border-slate-100 bg-white p-8 transition-all hover:border-brand/30 hover:shadow-2xl"
          >
            <div
              class="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-2xl transition-all group-hover:scale-110 group-hover:bg-green-600"
            >
              🔒
            </div>
            <h3 class="mb-2 text-lg font-black text-gray-900">
              Secure Payments
            </h3>
            <p class="text-sm leading-relaxed text-gray-500">
              Paystack for local cards and bank transfers. PayPal for
              international buyers. Both fully encrypted.
            </p>
          </div>

          <div
            class="group rounded-3xl border border-slate-100 bg-white p-8 transition-all hover:border-brand/30 hover:shadow-2xl"
          >
            <div
              class="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl transition-all group-hover:scale-110 group-hover:bg-blue-600"
            >
              🚢
            </div>
            <h3 class="mb-2 text-lg font-black text-gray-900">
              Live Global Shipping
            </h3>
            <p class="text-sm leading-relaxed text-gray-500">
              Real-time DHL and UPS rates at checkout from the seller's actual
              location. Lagos to London in 3–5 days.
            </p>
          </div>

          <NuxtLink
            to="/sellers/create"
            class="group relative block overflow-hidden rounded-3xl bg-slate-900 p-8 transition-all hover:shadow-2xl"
          >
            <div
              class="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/20 to-transparent"
            ></div>
            <div
              class="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl transition-all group-hover:scale-110"
            >
              🏪
            </div>
            <h3 class="mb-2 text-lg font-black text-white">
              Start Selling Today
            </h3>
            <p class="text-sm leading-relaxed text-slate-400">
              Free storefront. Built-in audience. Orders, payouts, and shipping
              — all in one place.
            </p>
            <p
              class="mt-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand"
            >
              Open your store <span>→</span>
            </p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ── How it works ───────────────────────────────────────── -->
    <section id="how" class="border-y border-slate-100 bg-slate-50 px-5 py-24">
      <div class="mx-auto max-w-5xl">
        <div class="mb-16 space-y-3 text-center">
          <p
            class="text-[10px] font-black uppercase tracking-[0.3em] text-brand"
          >
            Simple by design
          </p>
          <h2 class="text-4xl font-black tracking-tighter text-gray-900">
            From scroll to delivery
          </h2>
        </div>

        <div class="relative grid gap-8 sm:grid-cols-3">
          <!-- Dashed connector -->
          <div
            class="absolute left-[calc(16.66%+1.5rem)] right-[calc(16.66%+1.5rem)] top-8 z-0 hidden border-t-2 border-dashed border-gray-200 sm:block"
          ></div>

          <div class="relative z-10 text-center">
            <div
              class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-brand/20 bg-white text-3xl shadow-lg"
            >
              📱
            </div>
            <p
              class="mb-2 text-[9px] font-black uppercase tracking-widest text-gray-300"
            >
              Step 01
            </p>
            <h3 class="mb-2 text-lg font-black text-gray-900">
              Browse the feed
            </h3>
            <p class="text-sm leading-relaxed text-gray-500">
              Scroll posts from African creators. Like, comment, save — or tap a
              price tag to see the product details.
            </p>
          </div>

          <div class="relative z-10 text-center">
            <div
              class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-brand/20 bg-white text-3xl shadow-lg"
            >
              🛒
            </div>
            <p
              class="mb-2 text-[9px] font-black uppercase tracking-widest text-gray-300"
            >
              Step 02
            </p>
            <h3 class="mb-2 text-lg font-black text-gray-900">Add to cart</h3>
            <p class="text-sm leading-relaxed text-gray-500">
              Pick size, colour, quantity. Bulk discounts apply automatically —
              buy more, pay less.
            </p>
          </div>

          <div class="relative z-10 text-center">
            <div
              class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-brand/20 bg-white text-3xl shadow-lg"
            >
              🎁
            </div>
            <p
              class="mb-2 text-[9px] font-black uppercase tracking-widest text-gray-300"
            >
              Step 03
            </p>
            <h3 class="mb-2 text-lg font-black text-gray-900">
              Delivered to you
            </h3>
            <p class="text-sm leading-relaxed text-gray-500">
              Choose your carrier, pay securely via Paystack or PayPal, and
              track your order to the door.
            </p>
          </div>
        </div>

        <div class="mt-14 text-center">
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-3 rounded-2xl bg-brand px-10 py-4 font-bold text-white shadow-xl shadow-brand/25 transition-all hover:scale-[1.03]"
          >
            Start shopping now <span>→</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ── Sellers CTA ─────────────────────────────────────────── -->
    <section
      id="sellers"
      class="relative overflow-hidden bg-slate-950 px-5 py-24 text-white"
    >
      <div
        class="pointer-events-none absolute inset-0 bg-gradient-to-tr from-brand/10 to-transparent"
      ></div>
      <div
        class="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-brand/5 blur-3xl"
      ></div>

      <div class="relative z-10 mx-auto max-w-5xl">
        <div class="grid items-center gap-16 lg:grid-cols-2">
          <!-- Left -->
          <div class="space-y-8">
            <p
              class="text-[10px] font-black uppercase tracking-[0.3em] text-brand"
            >
              For creators & vendors
            </p>
            <h2
              class="text-4xl font-black uppercase leading-none tracking-tighter sm:text-5xl"
            >
              Your followers are<br />
              <span class="font-serif lowercase italic text-brand"
                >your customers.</span
              >
            </h2>
            <p class="text-lg font-light leading-relaxed text-slate-400">
              Post your collection, manage orders, receive global payments.
              Every post is a storefront. Every follower is a potential buyer.
            </p>
            <div class="flex flex-col gap-3 sm:flex-row">
              <NuxtLink
                to="/sellers/create"
                class="inline-flex items-center justify-center gap-3 rounded-2xl bg-brand px-8 py-4 font-bold text-white shadow-2xl shadow-brand/40 transition-all hover:scale-[1.03]"
              >
                Open your store — it's free 🏪
              </NuxtLink>
              <NuxtLink
                to="/sellers"
                class="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-8 py-4 font-bold text-white transition-all hover:border-brand hover:text-brand"
              >
                View all sellers
              </NuxtLink>
            </div>
          </div>

          <!-- Right: feature checklist -->
          <div class="grid grid-cols-1 gap-3">
            <div
              v-for="feat in sellerFeatures"
              :key="feat"
              class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:border-brand/30"
            >
              <span class="shrink-0 text-lg text-brand">✓</span>
              <span class="text-sm font-medium text-slate-300">{{ feat }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Affiliate Program ──────────────────────────────────── -->
    <section id="affiliate" class="px-5 py-24">
      <div class="mx-auto max-w-7xl">
        <div
          class="overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 shadow-2xl"
        >
          <div class="grid items-center gap-0 lg:grid-cols-2">
            <!-- Left copy -->
            <div class="space-y-8 p-10 sm:p-14 lg:p-16">
              <p
                class="text-[10px] font-black uppercase tracking-[0.3em] text-white/60"
              >
                Earn while you share
              </p>
              <h2
                class="text-4xl font-black uppercase leading-none tracking-tighter text-white sm:text-5xl"
              >
                Turn your<br />
                <span class="font-serif lowercase italic text-white/80"
                  >influence</span
                ><br />
                into income.
              </h2>
              <p class="text-lg font-light leading-relaxed text-white/80">
                Share links to products you love. Every time someone buys
                through your link, you earn a commission — automatically, with
                no minimum payout threshold.
              </p>

              <!-- Perk pills -->
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="perk in affiliatePerks"
                  :key="perk"
                  class="rounded-full bg-white/15 px-3.5 py-1.5 text-[11px] font-bold text-white"
                  >{{ perk }}</span
                >
              </div>

              <NuxtLink
                to="/user-register"
                class="inline-flex items-center gap-3 rounded-2xl bg-white px-10 py-4 font-black text-purple-600 shadow-2xl shadow-black/20 transition-all hover:scale-[1.03] active:scale-[0.98]"
              >
                Start earning — it's free
                <span class="text-base">→</span>
              </NuxtLink>
            </div>

            <!-- Right: stat cards -->
            <div
              class="flex flex-col justify-center gap-4 bg-black/10 p-10 sm:p-14 lg:p-16"
            >
              <div
                v-for="stat in affiliateStats"
                :key="stat.label"
                class="flex items-center gap-5 rounded-2xl bg-white/10 px-6 py-5 backdrop-blur-sm transition-colors hover:bg-white/15"
              >
                <div
                  class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 text-2xl"
                >
                  {{ stat.icon }}
                </div>
                <div>
                  <p class="text-xl font-black text-white">{{ stat.value }}</p>
                  <p class="text-xs font-medium text-white/60">
                    {{ stat.label }}
                  </p>
                </div>
              </div>

              <p
                class="mt-2 text-center text-[10px] font-bold uppercase tracking-widest text-white/40"
              >
                Already earning on MarketX
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Final CTA ───────────────────────────────────────────── -->
    <section class="px-5 py-24 text-center">
      <div class="mx-auto max-w-2xl space-y-7">
        <div
          class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand shadow-2xl shadow-brand/30"
        >
          <span class="text-xl font-black italic text-white">sX</span>
        </div>
        <h2
          class="text-4xl font-black tracking-tighter text-gray-900 sm:text-5xl"
        >
          Africa's feed is open.
        </h2>
        <p class="text-lg font-light leading-relaxed text-gray-500">
          Join thousands of buyers and sellers already on MarketX.
        </p>
        <div
          class="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <NuxtLink
            to="/"
            class="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-brand px-12 py-5 text-lg font-black text-white shadow-2xl shadow-brand/30 transition-all hover:scale-[1.03] sm:w-auto"
          >
            Enter MarketX →
          </NuxtLink>
          <NuxtLink
            to="/user-register"
            class="inline-flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-gray-200 px-10 py-4 text-base font-bold text-gray-700 transition-all hover:border-brand hover:text-brand sm:w-auto"
          >
            Create free account
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ── Footer ─────────────────────────────────────────────── -->
    <footer class="border-t border-slate-100 bg-white px-5 py-14">
      <div class="mx-auto max-w-7xl">
        <div class="mb-12 grid gap-10 sm:grid-cols-3">
          <!-- Brand -->
          <div class="space-y-4">
            <div class="flex items-center gap-2.5">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-black italic text-white shadow-md shadow-brand/20"
              >
                MX
              </div>
              <span
                class="text-base font-black uppercase tracking-tight text-gray-900"
                >MarketX</span
              >
            </div>
            <p class="max-w-xs text-sm leading-relaxed text-gray-400">
              Your business, fully alive. Discover stores, buy local, sell globally.
            </p>
          </div>

          <!-- Shop -->
          <div>
            <p
              class="mb-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-300"
            >
              Shop
            </p>
            <div class="space-y-2.5">
              <NuxtLink
                to="/discover"
                class="block text-sm text-gray-500 transition-colors hover:text-brand"
                >Discover feed</NuxtLink
              >
              <NuxtLink
                to="/thrift"
                class="block text-sm text-gray-500 transition-colors hover:text-brand"
                >Thrift market</NuxtLink
              >
              <NuxtLink
                to="/sellers"
                class="block text-sm text-gray-500 transition-colors hover:text-brand"
                >All sellers</NuxtLink
              >
              <NuxtLink
                to="/reels"
                class="block text-sm text-gray-500 transition-colors hover:text-brand"
                >Reels</NuxtLink
              >
            </div>
          </div>

          <!-- Company -->
          <div>
            <p
              class="mb-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-300"
            >
              Company
            </p>
            <div class="space-y-2.5">
              <NuxtLink
                to="/About"
                class="block text-sm text-gray-500 transition-colors hover:text-brand"
                >About</NuxtLink
              >
              <NuxtLink
                to="/sellers/create"
                class="block text-sm text-gray-500 transition-colors hover:text-brand"
                >Sell on MarketX</NuxtLink
              >
              <NuxtLink
                to="/Help"
                class="block text-sm text-gray-500 transition-colors hover:text-brand"
                >Help center</NuxtLink
              >
              <NuxtLink
                to="/Privacy"
                class="block text-sm text-gray-500 transition-colors hover:text-brand"
                >Privacy</NuxtLink
              >
              <NuxtLink
                to="/Terms"
                class="block text-sm text-gray-500 transition-colors hover:text-brand"
                >Terms</NuxtLink
              >
            </div>
          </div>
        </div>

        <div
          class="flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-6 sm:flex-row"
        >
          <span
            class="text-[10px] font-black uppercase tracking-widest text-gray-300"
            >MarketX by Indices Technology LTD</span
          >
          <a
            href="mailto:support@marketx.app"
            class="text-[10px] font-bold text-gray-400 transition-colors hover:text-brand"
            >support@marketx.app</a
          >
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const tickerItems = [
  'New arrivals daily',
  '✦',
  'Free storefronts for sellers',
  '✦',
  'Ships to 30+ countries',
  '✦',
  'Pay with Paystack or PayPal',
  '✦',
  'Thrift finds from across Africa',
  '✦',
  'AI-powered style search',
  '✦',
  'Live shipping rates at checkout',
  '✦',
]

const trustItems = [
  'DHL',
  '✦',
  'UPS',
  '✦',
  'Paystack',
  '✦',
  'PayPal',
  '✦',
  'AxiomsAI',
  '✦',
  'Indices Logistics',
  '✦',
  'Shippo',
  '✦',
]

const affiliatePerks = [
  'No minimum payout',
  'Instant link generation',
  'Real-time earnings dashboard',
  'Works on any product',
]

const affiliateStats = [
  { icon: '💸', value: '₦2.4M+', label: 'Paid out to affiliates this month' },
  { icon: '🔗', value: '18K+', label: 'Active affiliate links' },
  { icon: '📈', value: 'Up to 15%', label: 'Commission per sale' },
]

const sellerFeatures = [
  'Free storefront with your own custom URL',
  'Post to your social feed & storefront simultaneously',
  'Bulk discount & offer management tools',
  'Real-time order tracking & fulfilment dashboard',
  'Live DHL / UPS shipping rate integration',
  'Wallet with instant NGN & USD payouts',
  'Buyer notifications & review management',
  'AI-matched product discovery for your listings',
]
</script>

<style scoped>
@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-18px) rotate(1.5deg);
  }
}
@keyframes float-delayed {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-12px) rotate(-1deg);
  }
}
.animate-float {
  animation: float 5s ease-in-out infinite;
}
.animate-float-delayed {
  animation: float-delayed 5s ease-in-out infinite 2s;
}

@keyframes scroll-left {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}
.ticker-track {
  animation: scroll-left 30s linear infinite;
}
.marquee-track {
  animation: scroll-left 20s linear infinite;
}
</style>
