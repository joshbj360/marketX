<template>
  <HomeLayout :narrow-feed="false">
    <div class="mx-auto max-w-5xl px-4 py-8 pb-24 sm:px-6 sm:py-16 lg:px-8">
      <!-- ─── HERO SECTION ─────────────────────────────────────────────── -->
      <div class="mb-16 text-center lg:mb-24">
        <div
          class="mb-6 inline-flex items-center justify-center rounded-full bg-brand/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand"
        >
          The Commerce Revolution
        </div>
        <h1
          class="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-neutral-100"
        >
          We give the upper hand <br class="hidden sm:block" />
          <span
            class="bg-gradient-to-r from-brand to-purple-600 bg-clip-text text-transparent"
            >back to the seller.</span
          >
        </h1>
        <p
          class="mx-auto max-w-2xl text-lg leading-relaxed text-gray-500 sm:text-xl dark:text-neutral-400"
        >
          {{ config.public.siteName || 'styleX' }} isn't just another
          marketplace. We are a complete Creative Management System built to
          automate your growth, eliminate borders, and turn every scroll into a
          sale.
        </p>
      </div>

      <!-- ─── THE 4 PILLARS (GRID) ──────────────────────────────────────── -->
      <div class="mb-20 grid gap-6 md:grid-cols-2 lg:gap-8">
        <!-- Pillar 1: AI -->
        <div
          class="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl transition-colors group-hover:bg-blue-500/20"
          ></div>
          <div
            class="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20"
          >
            <Icon name="mdi:robot-outline" size="28" />
          </div>
          <h3
            class="relative z-10 mb-3 text-xl font-bold text-gray-900 dark:text-white"
          >
            1. AI-Powered Enhancement
          </h3>
          <p
            class="relative z-10 leading-relaxed text-gray-600 dark:text-neutral-400"
          >
            Upload an image and let our AI do the heavy lifting. From
            auto-generating high-converting product descriptions to optimizing
            pricing and sales strategies, we provide you with a world-class
            marketing team in your pocket.
          </p>
        </div>

        <!-- Pillar 2: Social Reach (The Killer Feature) -->
        <div
          class="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-brand/10 blur-3xl transition-colors group-hover:bg-brand/20"
          ></div>
          <div
            class="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand"
          >
            <Icon name="mdi:share-all-outline" size="28" />
          </div>
          <h3
            class="relative z-10 mb-3 text-xl font-bold text-gray-900 dark:text-white"
          >
            2. Automated Omni-Channel Reach
          </h3>
          <p
            class="relative z-10 leading-relaxed text-gray-600 dark:text-neutral-400"
          >
            Why post manually? Publish your product once on our platform, and we
            automatically blast it across Facebook, Twitter, Instagram, and
            Pinterest. We give you massive, automated reach that legacy
            marketplaces simply can't match.
          </p>
        </div>

        <!-- Pillar 3: Borders & Logistics -->
        <div
          class="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl transition-colors group-hover:bg-emerald-500/20"
          ></div>
          <div
            class="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20"
          >
            <Icon name="mdi:earth" size="28" />
          </div>
          <h3
            class="relative z-10 mb-3 text-xl font-bold text-gray-900 dark:text-white"
          >
            3. Cross-Border Commerce
          </h3>
          <p
            class="relative z-10 leading-relaxed text-gray-600 dark:text-neutral-400"
          >
            Sell globally, effortlessly. We handle the complexities of
            cross-border payments, currency conversions, and international
            logistics, ensuring your products can reach buyers anywhere in the
            world without the headache.
          </p>
        </div>

        <!-- Pillar 4: The Buyer Experience -->
        <div
          class="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-purple-500/10 blur-3xl transition-colors group-hover:bg-purple-500/20"
          ></div>
          <div
            class="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-900/20"
          >
            <Icon name="mdi:shopping-search" size="28" />
          </div>
          <h3
            class="relative z-10 mb-3 text-xl font-bold text-gray-900 dark:text-white"
          >
            4. A Flawless Buyer Experience
          </h3>
          <p
            class="relative z-10 leading-relaxed text-gray-600 dark:text-neutral-400"
          >
            For buyers, discovery is magic. We connect them with exactly what
            they are looking for across various price points—from premium stores
            to thrift finds. Combined with real customer video reviews (Reels),
            we've eliminated the guesswork from online shopping.
          </p>
        </div>
      </div>

      <!-- ─── THE MISSION BLOCK ────────────────────────────────────────── -->
      <div
        class="relative overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-900 to-neutral-950 p-8 text-center shadow-2xl sm:p-12"
      >
        <div
          class="pointer-events-none absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-brand/20 blur-3xl"
        ></div>
        <div
          class="pointer-events-none absolute bottom-0 left-0 h-64 w-64 -translate-x-1/2 translate-y-1/2 rounded-full bg-purple-500/20 blur-3xl"
        ></div>

        <div class="relative z-10">
          <h2
            class="mx-auto mb-8 max-w-3xl text-2xl font-bold leading-tight text-white sm:text-3xl"
          >
            "Our mission is simple: To make every scroll a shopping opportunity
            and every transaction seamless."
          </h2>

          <div
            class="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <NuxtLink
              to="/sellers/create"
              class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-8 py-3.5 font-bold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-[#d81b36] sm:w-auto"
            >
              <Icon name="mdi:store-plus" size="20" />
              Open Your Store
            </NuxtLink>
            <NuxtLink
              to="/discover"
              class="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-8 py-3.5 font-bold text-white transition-colors hover:bg-white/20 sm:w-auto"
            >
              <Icon name="mdi:compass-outline" size="20" />
              Start Shopping
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Sidebar -->
    <template #right-sidebar>
      <RightSideNavLinks />
    </template>
  </HomeLayout>
</template>

<script setup lang="ts">
import HomeLayout from '~~/layers/feed/app/layouts/HomeLayout.vue'
import RightSideNavLinks from '~~/layers/core/app/layouts/children/RightSideNavLinks.vue'

const config = useRuntimeConfig()

useSeoMeta({
  title: `Our Story · ${useRuntimeConfig().public.siteName || 'styleX'}`,
  description:
    'Learn how we are revolutionizing commerce by empowering sellers with AI, automated social reach, and cross-border logistics.',
})
</script>
