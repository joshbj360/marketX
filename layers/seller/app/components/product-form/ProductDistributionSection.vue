<template>
  <!-- Distribution -->
  <div
    class="rounded-xl border border-brand/20 bg-gradient-to-br from-brand/5 to-purple-600/5 p-4 sm:p-6 dark:from-brand/10 dark:to-purple-600/10"
  >
    <div class="mb-4 flex items-center gap-2">
      <Icon name="mdi:share-variant-outline" size="20" class="text-brand" />
      <div>
        <h2 class="font-semibold text-gray-900 dark:text-neutral-100">Distribution</h2>
        <p class="text-xs text-gray-500 dark:text-neutral-400">Choose where this product appears</p>
      </div>
    </div>

    <div class="space-y-3">
      <!-- Shop & Discover: always ON -->
      <div
        class="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800"
      >
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10">
            <Icon name="mdi:storefront-outline" size="18" class="text-brand" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-neutral-100">Shop &amp; Discover</p>
            <p class="text-xs text-gray-400 dark:text-neutral-500">Always visible in your store and discovery pages</p>
          </div>
        </div>
        <span
          class="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
        >Always On</span>
      </div>

      <!-- Share to Feed (Premium only) -->
      <div
        class="rounded-xl border bg-white dark:bg-neutral-800"
        :class="form.showInFeed ? 'border-brand/30 dark:border-brand/30' : 'border-gray-200 dark:border-neutral-700'"
      >
        <button
          type="button"
          class="flex w-full items-center justify-between px-4 py-3"
          :disabled="!isPremiumSeller"
          :title="!isPremiumSeller ? 'Upgrade to Premium to publish products to the social feed' : undefined"
          @click="isPremiumSeller && (form.showInFeed = !form.showInFeed)"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-lg"
              :class="form.showInFeed ? 'bg-brand/10' : 'bg-gray-100 dark:bg-neutral-700'"
            >
              <Icon
                name="mdi:image-multiple-outline"
                size="18"
                :class="form.showInFeed ? 'text-brand' : 'text-gray-500 dark:text-neutral-400'"
              />
            </div>
            <div class="text-left">
              <p class="text-sm font-medium text-gray-900 dark:text-neutral-100">
                Share to Feed
                <span
                  v-if="!isPremiumSeller"
                  class="ml-1.5 rounded-full bg-violet px-2 py-0.5 text-[10px] font-bold text-white"
                >PREMIUM</span>
              </p>
              <p class="text-xs text-gray-400 dark:text-neutral-500">
                {{ isPremiumSeller ? 'Post this product as a social feed card' : 'Available on Premium plan' }}
              </p>
            </div>
          </div>
          <div
            class="relative h-6 w-11 shrink-0 rounded-full transition-colors"
            :class="!isPremiumSeller ? 'opacity-40' : form.showInFeed ? 'bg-brand' : 'bg-gray-200 dark:bg-neutral-600'"
          >
            <div
              class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
              :class="form.showInFeed ? 'translate-x-5' : 'translate-x-0.5'"
            />
          </div>
        </button>
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-150"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="form.showInFeed"
            class="border-t border-brand/10 px-4 pb-4 pt-3 dark:border-brand/20"
          >
            <label class="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-neutral-400">
              Feed caption
              <span class="font-normal text-gray-400">— optional, up to 2200 chars</span>
            </label>
            <textarea
              v-model="form.socialCaptions.feedCaption"
              rows="3"
              maxlength="2200"
              placeholder="Write a caption for the feed post… #hashtags work too"
              class="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm placeholder-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            />
            <p class="mt-0.5 text-right text-[11px] text-gray-400">
              {{ (form.socialCaptions.feedCaption || '').length }}/2200
            </p>
          </div>
        </Transition>
      </div>

      <!-- Share to Reels (Premium + video required) -->
      <div
        class="rounded-xl border bg-white dark:bg-neutral-800"
        :class="form.showInReels ? 'border-brand/30 dark:border-brand/30' : 'border-gray-200 dark:border-neutral-700'"
      >
        <button
          type="button"
          class="flex w-full items-center justify-between px-4 py-3"
          :disabled="!hasVideo || !isPremiumSeller"
          :title="
            !isPremiumSeller
              ? 'Upgrade to Premium to publish products to Reels'
              : !hasVideo
                ? 'Upload a video to enable Reels'
                : undefined
          "
          @click="hasVideo && isPremiumSeller && (form.showInReels = !form.showInReels)"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-lg"
              :class="form.showInReels ? 'bg-brand/10' : 'bg-gray-100 dark:bg-neutral-700'"
            >
              <Icon
                name="mdi:play-box-multiple-outline"
                size="18"
                :class="form.showInReels ? 'text-brand' : 'text-gray-500 dark:text-neutral-400'"
              />
            </div>
            <div class="text-left">
              <p class="text-sm font-medium text-gray-900 dark:text-neutral-100">
                Share to Reels
                <span
                  v-if="!isPremiumSeller"
                  class="ml-1.5 rounded-full bg-violet px-2 py-0.5 text-[10px] font-bold text-white"
                >PREMIUM</span>
              </p>
              <p class="text-xs text-gray-400 dark:text-neutral-500">
                {{
                  !isPremiumSeller
                    ? 'Available on Premium plan'
                    : hasVideo
                      ? 'Feature as a shoppable Reel'
                      : 'Requires a video upload'
                }}
              </p>
            </div>
          </div>
          <div
            class="relative h-6 w-11 shrink-0 rounded-full transition-colors"
            :class="!isPremiumSeller || !hasVideo ? 'opacity-40' : form.showInReels ? 'bg-brand' : 'bg-gray-200 dark:bg-neutral-600'"
          >
            <div
              class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
              :class="form.showInReels ? 'translate-x-5' : 'translate-x-0.5'"
            />
          </div>
        </button>
      </div>

      <!-- Pre-loved / Thrift toggle -->
      <div
        class="rounded-xl border bg-white dark:bg-neutral-800"
        :class="form.isThrift ? 'border-pink-200 dark:border-pink-800/30' : 'border-gray-200 dark:border-neutral-700'"
      >
        <button
          type="button"
          class="flex w-full items-center justify-between px-4 py-3"
          @click="form.isThrift = !form.isThrift"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-lg"
              :class="form.isThrift ? 'bg-pink-50 dark:bg-pink-900/20' : 'bg-gray-100 dark:bg-neutral-700'"
            >
              <Icon
                name="mdi:heart-circle-outline"
                size="18"
                :class="form.isThrift ? 'text-pink-500' : 'text-gray-500 dark:text-neutral-400'"
              />
            </div>
            <div class="text-left">
              <p class="text-sm font-medium text-gray-900 dark:text-neutral-100">Pre-loved / Thrift</p>
              <p class="text-xs text-gray-400 dark:text-neutral-500">Shows in Pre-loved section — set condition below</p>
            </div>
          </div>
          <div
            class="relative h-6 w-11 shrink-0 rounded-full transition-colors"
            :class="form.isThrift ? 'bg-pink-500' : 'bg-gray-200 dark:bg-neutral-600'"
          >
            <div
              class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
              :class="form.isThrift ? 'translate-x-5' : 'translate-x-0.5'"
            />
          </div>
        </button>
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-150"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="form.isThrift"
            class="border-t border-pink-100 px-4 pb-4 pt-3 dark:border-pink-900/30"
          >
            <label class="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-neutral-400">Condition</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="c in conditions"
                :key="c.value"
                type="button"
                class="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                :class="
                  form.condition === c.value
                    ? 'border-pink-400 bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-pink-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400'
                "
                @click="form.condition = c.value"
              >
                {{ c.label }}
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Flash Deal toggle -->
      <div
        class="rounded-xl border bg-white dark:bg-neutral-800"
        :class="form.isDeal ? 'border-amber-200 dark:border-amber-800/30' : 'border-gray-200 dark:border-neutral-700'"
      >
        <button
          type="button"
          class="flex w-full items-center justify-between px-4 py-3"
          @click="form.isDeal = !form.isDeal"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-lg"
              :class="form.isDeal ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-gray-100 dark:bg-neutral-700'"
            >
              <Icon
                name="mdi:tag-outline"
                size="18"
                :class="form.isDeal ? 'text-amber-500' : 'text-gray-500 dark:text-neutral-400'"
              />
            </div>
            <div class="text-left">
              <p class="text-sm font-medium text-gray-900 dark:text-neutral-100">Flash Deal</p>
              <p class="text-xs text-gray-400 dark:text-neutral-500">Shows in Deals section with countdown timer</p>
            </div>
          </div>
          <div
            class="relative h-6 w-11 shrink-0 rounded-full transition-colors"
            :class="form.isDeal ? 'bg-amber-500' : 'bg-gray-200 dark:bg-neutral-600'"
          >
            <div
              class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
              :class="form.isDeal ? 'translate-x-5' : 'translate-x-0.5'"
            />
          </div>
        </button>
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-150"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="form.isDeal"
            class="border-t border-amber-100 px-4 pb-4 pt-3 dark:border-amber-900/30"
          >
            <label class="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-neutral-400">Deal ends at</label>
            <input
              v-model="form.dealEndsAt"
              type="datetime-local"
              :min="minDealDate"
              class="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            />
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  form: {
    showInFeed: boolean
    showInReels: boolean
    isThrift: boolean
    condition: string
    isDeal: boolean
    dealEndsAt: string
    socialCaptions: { feedCaption: string }
  }
  isPremiumSeller: boolean
  hasVideo: boolean
  conditions: Array<{ value: string; label: string }>
  minDealDate: string
}>()
</script>
