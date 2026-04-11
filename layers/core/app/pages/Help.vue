<template>
  <HomeLayout :narrow-feed="false">
    <div class="mx-auto max-w-4xl px-4 py-8 pb-24 sm:px-6 sm:py-12 lg:px-8">
      <!-- ─── HERO & SEARCH ─────────────────────────────────────────────── -->
      <div class="mb-12 text-center">
        <div
          class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 text-brand"
        >
          <Icon name="mdi:lifebuoy" size="32" />
        </div>
        <h1
          class="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl dark:text-neutral-100"
        >
          How can we help you?
        </h1>
        <p
          class="mx-auto mb-8 max-w-lg text-base text-gray-500 dark:text-neutral-400"
        >
          Search our knowledge base or browse categories below to find answers
          to your questions, policies, and contact information.
        </p>

        <!-- Search Bar -->
        <div
          class="group relative mx-auto max-w-2xl rounded-2xl shadow-sm transition-shadow hover:shadow-md"
        >
          <div
            class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5"
          >
            <Icon
              name="mdi:magnify"
              size="24"
              class="text-gray-400 transition-colors group-focus-within:text-brand"
            />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search for articles, tracking, returns..."
            class="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-14 pr-12 text-lg text-gray-900 transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute inset-y-0 right-0 flex items-center pr-5 text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300"
          >
            <Icon name="mdi:close-circle" size="22" />
          </button>
        </div>
      </div>

      <!-- ─── HELP TOPICS GRID ──────────────────────────────────────────── -->
      <div class="mb-16 grid grid-cols-2 gap-4 md:grid-cols-4">
        <NuxtLink
          to="/help/getting-started"
          class="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-5 text-center transition-all hover:border-brand/30 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-500 transition-transform group-hover:scale-110 dark:bg-blue-900/20"
          >
            <Icon name="mdi:rocket-launch-outline" size="24" />
          </div>
          <span class="text-sm font-bold text-gray-900 dark:text-neutral-100"
            >Getting Started</span
          >
        </NuxtLink>

        <NuxtLink
          to="/help/orders"
          class="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-5 text-center transition-all hover:border-brand/30 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 transition-transform group-hover:scale-110 dark:bg-emerald-900/20"
          >
            <Icon name="mdi:package-variant-closed" size="24" />
          </div>
          <span class="text-sm font-bold text-gray-900 dark:text-neutral-100"
            >Orders & Tracking</span
          >
        </NuxtLink>

        <NuxtLink
          to="/help/returns"
          class="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-5 text-center transition-all hover:border-brand/30 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-500 transition-transform group-hover:scale-110 dark:bg-orange-900/20"
          >
            <Icon name="mdi:keyboard-return" size="24" />
          </div>
          <span class="text-sm font-bold text-gray-900 dark:text-neutral-100"
            >Returns & Refunds</span
          >
        </NuxtLink>

        <NuxtLink
          to="/help/sellers"
          class="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-5 text-center transition-all hover:border-brand/30 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-500 transition-transform group-hover:scale-110 dark:bg-purple-900/20"
          >
            <Icon name="mdi:storefront-outline" size="24" />
          </div>
          <span class="text-sm font-bold text-gray-900 dark:text-neutral-100"
            >Seller Guide</span
          >
        </NuxtLink>
      </div>

      <!-- ─── FAQ SECTION ───────────────────────────────────────────────── -->
      <div class="mb-16">
        <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-neutral-100">
          Frequently Asked Questions
        </h2>

        <!-- Category Filters -->
        <div
          class="custom-scrollbar -mx-4 mb-8 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0"
        >
          <button
            v-for="category in categories"
            :key="category.id"
            @click="activeCategory = category.id"
            class="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all"
            :class="
              activeCategory === category.id
                ? 'border-brand bg-brand text-white shadow-md shadow-brand/20'
                : 'border-gray-200 bg-white text-gray-600 hover:border-brand/30 hover:bg-brand/5 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-brand/10'
            "
          >
            <Icon :name="category.icon" size="18" />
            {{ category.label }}
          </button>
        </div>

        <!-- FAQ Accordions -->
        <div class="min-h-[250px] space-y-4">
          <div
            v-if="filteredFaqs.length === 0"
            class="rounded-2xl border border-gray-100 bg-white py-16 text-center dark:border-neutral-800 dark:bg-neutral-900"
          >
            <Icon
              name="mdi:file-search-outline"
              size="48"
              class="mb-3 text-gray-300 dark:text-neutral-600"
            />
            <h3 class="text-lg font-bold text-gray-900 dark:text-neutral-100">
              No results found
            </h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-neutral-400">
              We couldn't find any articles matching "{{ searchQuery }}"
            </p>
            <button
              @click="searchQuery = ''; activeCategory = 'all'"
              class="mt-4 font-semibold text-brand hover:underline"
            >
              Clear Search
            </button>
          </div>

          <details
            v-for="(faq, index) in filteredFaqs"
            :key="index"
            class="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary
              class="flex cursor-pointer select-none items-center justify-between p-5 text-[15px] font-bold text-gray-900 sm:p-6 dark:text-neutral-100"
            >
              <span class="pr-4">{{ faq.question }}</span>
              <span
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-50 transition-colors group-hover:bg-brand/10 group-hover:text-brand dark:bg-neutral-800"
              >
                <Icon
                  name="mdi:chevron-down"
                  class="transition-transform duration-300 group-open:-rotate-180"
                  size="20"
                />
              </span>
            </summary>
            <div
              class="mt-2 border-t border-gray-100 px-5 pb-6 pt-0 pt-4 text-sm leading-relaxed text-gray-600 sm:px-6 dark:border-neutral-800 dark:text-neutral-400"
            >
              {{ faq.answer }}
            </div>
          </details>
        </div>
      </div>

      <!-- ─── LEGAL & POLICIES ──────────────────────────────────────────── -->
      <div class="mb-16 border-t border-gray-200 pt-10 dark:border-neutral-800">
        <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-neutral-100">
          Legal & Policies
        </h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NuxtLink
            to="/terms"
            class="group flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:border-brand/50 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors group-hover:text-brand dark:bg-neutral-800 dark:text-neutral-400"
              >
                <Icon name="mdi:file-document-outline" size="20" />
              </div>
              <div>
                <h3
                  class="text-sm font-bold text-gray-900 dark:text-neutral-100"
                >
                  Terms of Service
                </h3>
                <p class="mt-0.5 text-xs text-gray-500 dark:text-neutral-500">
                  Rules and guidelines for using
                  {{ $config.public.siteName || 'styleX' }}
                </p>
              </div>
            </div>
            <Icon
              name="mdi:chevron-right"
              class="text-gray-400 transition-colors group-hover:text-brand"
            />
          </NuxtLink>

          <NuxtLink
            to="/privacy"
            class="group flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:border-brand/50 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors group-hover:text-brand dark:bg-neutral-800 dark:text-neutral-400"
              >
                <Icon name="mdi:shield-check-outline" size="20" />
              </div>
              <div>
                <h3
                  class="text-sm font-bold text-gray-900 dark:text-neutral-100"
                >
                  Privacy Policy
                </h3>
                <p class="mt-0.5 text-xs text-gray-500 dark:text-neutral-500">
                  How we handle and protect your data
                </p>
              </div>
            </div>
            <Icon
              name="mdi:chevron-right"
              class="text-gray-400 transition-colors group-hover:text-brand"
            />
          </NuxtLink>

          <NuxtLink
            to="/policy/returns"
            class="group flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:border-brand/50 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors group-hover:text-brand dark:bg-neutral-800 dark:text-neutral-400"
              >
                <Icon name="mdi:keyboard-return" size="20" />
              </div>
              <div>
                <h3
                  class="text-sm font-bold text-gray-900 dark:text-neutral-100"
                >
                  Return Policy
                </h3>
                <p class="mt-0.5 text-xs text-gray-500 dark:text-neutral-500">
                  Information on returns and refunds
                </p>
              </div>
            </div>
            <Icon
              name="mdi:chevron-right"
              class="text-gray-400 transition-colors group-hover:text-brand"
            />
          </NuxtLink>

          <NuxtLink
            to="/policy/cookies"
            class="group flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:border-brand/50 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors group-hover:text-brand dark:bg-neutral-800 dark:text-neutral-400"
              >
                <Icon name="mdi:cookie-outline" size="20" />
              </div>
              <div>
                <h3
                  class="text-sm font-bold text-gray-900 dark:text-neutral-100"
                >
                  Cookie Policy
                </h3>
                <p class="mt-0.5 text-xs text-gray-500 dark:text-neutral-500">
                  How we use cookies and tracking
                </p>
              </div>
            </div>
            <Icon
              name="mdi:chevron-right"
              class="text-gray-400 transition-colors group-hover:text-brand"
            />
          </NuxtLink>
        </div>
      </div>

      <!-- ─── STILL NEED HELP (CONTACT) ─────────────────────────────────── -->
      <div
        class="relative overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-center shadow-xl sm:p-10 dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-950"
      >
        <div
          class="pointer-events-none absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-brand/20 blur-3xl"
        ></div>
        <div
          class="pointer-events-none absolute bottom-0 left-0 h-64 w-64 -translate-x-1/2 translate-y-1/2 rounded-full bg-purple-500/20 blur-3xl"
        ></div>

        <div class="relative z-10">
          <div
            class="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/10 backdrop-blur-md"
          >
            <Icon name="mdi:headset" size="40" class="text-white" />
          </div>
          <h2 class="mb-3 text-2xl font-bold text-white">Still need help?</h2>
          <p
            class="mx-auto mb-2 max-w-md text-sm leading-relaxed text-gray-300"
          >
            Can't find the answer you're looking for? Our support team is here
            to assist you with any questions.
          </p>
          <p
            class="mb-8 text-xs font-semibold uppercase tracking-wider text-brand-light"
          >
            Average response time: Under 24 hours
          </p>

          <div
            class="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <a
              :href="`mailto:${config.public.supportEmail || 'support@stylex.indicestech.com'}`"
              class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-8 py-3.5 font-bold text-white transition-all hover:bg-[#d81b36] hover:shadow-lg hover:shadow-brand/20 active:scale-95 sm:w-auto"
            >
              <Icon name="mdi:email-fast-outline" size="20" />
              Email Support
            </a>
            <button
              class="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-8 py-3.5 font-bold text-white transition-all hover:bg-white/20 active:scale-95 sm:w-auto"
            >
              <Icon name="mdi:chat-processing-outline" size="20" />
              Live Chat
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Sidebar Slot -->
    <template #right-sidebar>
      <RightSideNavLinks />
    </template>
  </HomeLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import HomeLayout from '~~/layers/feed/app/layouts/HomeLayout.vue'
import RightSideNavLinks from '~~/layers/core/app/layouts/children/RightSideNavLinks.vue'
const config = useRuntimeConfig()

// State
const searchQuery = ref('')
const activeCategory = ref('all')

// Categories
const categories = [
  { id: 'all', label: 'All Topics', icon: 'mdi:view-grid-outline' },
  { id: 'shopping', label: 'Shopping & Orders', icon: 'mdi:shopping-outline' },
  {
    id: 'selling',
    label: `Selling on ${config.public.siteName || 'styleX'}`,
    icon: 'mdi:storefront-outline',
  },
  {
    id: 'account',
    label: 'Account & Security',
    icon: 'mdi:shield-account-outline',
  },
  { id: 'ai', label: 'Dasah AI', icon: 'mdi:robot-happy-outline' },
]

// FAQ Data
const faqs = [
  {
    category: 'selling',
    question: 'How do I connect my Instagram Business Account?',
    answer:
      "Go to your Dashboard, select the 'Social & Marketing' tab, and click 'Connect Instagram.' You will be redirected to Facebook to grant necessary posting permissions. Remember, you must have an Instagram Business Account linked to a Facebook Page.",
  },
  {
    category: 'selling',
    question: 'How do payouts work for sellers?',
    answer:
      'When a buyer purchases an item, the funds are held securely in escrow until the item is delivered. Once the buyer confirms delivery (or after a 3-day dispute window), the funds are released to your Seller Wallet. You can then withdraw to your bank account.',
  },
  {
    category: 'ai',
    question: 'How does the Dasah AI Assistant find products?',
    answer:
      'Dasah uses advanced vector embeddings (RAG) to search our entire product catalog based on concept, not just keywords. This allows her to understand complex style queries like "a dress for a summer beach wedding" and provide highly relevant recommendations.',
  },
  {
    category: 'shopping',
    question: 'What is the Thrift section?',
    answer:
      "The Thrift section features pre-owned, gently-used fashion items. These products are marked with a 'Thrift' tag and can be browsed by your existing categories (Shoes, Jackets, etc.) for affordable and sustainable shopping.",
  },
  {
    category: 'shopping',
    question: 'How do I track my order?',
    answer:
      'Once your order ships, you will receive a tracking link via email. You can also track your order status in real-time from the "My Orders" section of your user profile.',
  },
  {
    category: 'account',
    question: 'How do I reset my password?',
    answer:
      'Click on "Forgot Password" at the login screen. We will send a reset link to your registered email. If you are already logged in, you can update your password in Account Settings -> Security.',
  },
  {
    category: 'account',
    question: 'How do I delete my account?',
    answer:
      'You can request account deletion from your Account Settings. Please note that this action is permanent and will remove all your data, including order history and saved items. Any active seller profiles must be deactivated first.',
  },
]

// Computed Search & Filter
const filteredFaqs = computed(() => {
  let filtered = faqs

  // Filter by Category
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter((faq) => faq.category === activeCategory.value)
  }

  // Filter by Search Query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query),
    )
  }

  return filtered
})
</script>

<style scoped>
/* Custom horizontal scrollbar for categories on mobile */
.custom-scrollbar::-webkit-scrollbar {
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #404040;
}
</style>
