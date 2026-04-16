<template>
  <div class="px-3 py-4 sm:px-6">
    <div class="mb-6 flex items-center gap-3">
      <NuxtLink
        :to="`/seller/${storeSlug}/products`"
        class="text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        <Icon name="mdi:arrow-left" size="20" />
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-neutral-100">
        New Product
      </h1>
    </div>

    <!-- Onboarding welcome banner -->
    <div
      v-if="isOnboarding"
      class="mb-6 max-w-3xl rounded-2xl border border-brand/20 bg-gradient-to-r from-brand/10 to-purple-600/10 p-5 dark:from-brand/20 dark:to-purple-600/20"
    >
      <div class="flex items-start gap-4">
        <div
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand shadow-lg shadow-brand/25"
        >
          <span class="text-sm font-black italic text-white">MX</span>
        </div>
        <div>
          <h2 class="font-bold text-gray-900 dark:text-white">
            One last step — add your first product!
          </h2>
          <p class="mt-1 text-sm text-gray-600 dark:text-neutral-400">
            Your store is live. Add a product now so buyers can find you. You
            can add more any time from your dashboard.
          </p>
        </div>
      </div>
    </div>

    <div class="max-w-3xl">
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <!-- Error -->
        <div
          v-if="error"
          class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
        >
          <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
        </div>

        <!-- Media Upload -->
        <div
          class="space-y-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-neutral-700 dark:bg-neutral-800"
        >
          <h2 class="font-semibold text-gray-900 dark:text-neutral-100">
            Product Images
          </h2>
          <p class="text-xs text-gray-500 dark:text-neutral-400">
            Upload up to 5 images. First image becomes the cover.
          </p>

          <!-- Image previews grid -->
          <div class="grid grid-cols-3 gap-3 sm:grid-cols-5">
            <div
              v-for="(img, i) in mediaItems"
              :key="i"
              class="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-900"
            >
              <img :src="img.preview" class="h-full w-full object-cover" />
              <div
                v-if="img.uploading"
                class="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/55"
              >
                <svg width="36" height="36" viewBox="0 0 36 36" class="-rotate-90">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="3" />
                  <circle
                    cx="18" cy="18" r="14" fill="none" stroke="#F43F5E" stroke-width="3"
                    stroke-linecap="round"
                    :stroke-dasharray="`${2 * Math.PI * 14}`"
                    :stroke-dashoffset="`${2 * Math.PI * 14 * (1 - img.progress / 100)}`"
                    style="transition: stroke-dashoffset 0.15s ease"
                  />
                </svg>
                <span class="text-[11px] font-bold text-white">{{ img.progress }}%</span>
              </div>
              <div
                v-if="i === 0"
                class="absolute left-1 top-1 rounded bg-brand px-1.5 py-0.5 text-[10px] font-medium text-white"
              >
                Cover
              </div>
              <button
                type="button"
                class="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                @click="removeMediaItem(i)"
              >
                <Icon name="mdi:close" size="12" />
              </button>
            </div>

            <!-- Add image button -->
            <label
              v-if="mediaItems.length < 5"
              class="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-brand hover:bg-brand/5 dark:border-neutral-600"
            >
              <Icon
                name="mdi:image-plus"
                size="24"
                class="mb-1 text-gray-400 dark:text-neutral-500"
              />
              <span class="text-xs text-gray-400 dark:text-neutral-500"
                >Add</span
              >
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                class="hidden"
                @change="onImagesSelected"
              />
            </label>
          </div>

          <!-- ✨ AI Magic Lister Banner (Shows after image upload) -->
          <div
            v-if="mediaItems.length > 0"
            class="mt-6 flex flex-col items-start justify-between gap-4 rounded-xl border border-brand/20 bg-gradient-to-r from-brand/10 to-purple-600/10 p-5 shadow-sm sm:flex-row sm:items-center dark:from-brand/20 dark:to-purple-600/20"
          >
            <div>
              <h3
                class="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-white"
              >
                <Icon name="mdi:magic-staff" class="text-brand" size="18" />
                AI Magic Lister
              </h3>
              <p class="mt-1 max-w-sm text-xs text-gray-600 dark:text-gray-300">
                Save time! Let our AI analyze your cover image to auto-write
                your title, description, price, and social media captions.
              </p>
            </div>
            <button
              type="button"
              :disabled="isGeneratingAI || mediaItems[0]?.uploading"
              class="flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 sm:w-auto dark:bg-white dark:text-gray-900"
              @click="autoFillWithAI"
            >
              <Icon
                v-if="isGeneratingAI"
                name="eos-icons:loading"
                class="animate-spin"
                size="18"
              />
              <Icon v-else name="mdi:creation" size="18" />
              {{ isGeneratingAI ? 'Generating...' : 'Auto-Fill Form' }}
            </button>
          </div>

          <!-- Background Music -->
          <div
            class="mt-4 border-t border-gray-100 pt-4 dark:border-neutral-700"
          >
            <h3
              class="mb-2 text-sm font-medium text-gray-700 dark:text-neutral-300"
            >
              Background Music
              <span class="font-normal text-gray-400">(optional)</span>
            </h3>

            <!-- Selected music chip -->
            <div
              v-if="selectedMusic"
              class="flex items-center gap-3 rounded-xl border border-pink-100 bg-gradient-to-r from-pink-50 to-purple-50 px-3 py-2.5 dark:border-pink-900/30 dark:from-pink-950/20 dark:to-purple-950/20"
            >
              <div
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-pink-400 to-purple-500"
              >
                <Icon name="mdi:music-note" size="16" class="text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <p
                  class="truncate text-[13px] font-semibold text-gray-900 dark:text-neutral-100"
                >
                  {{ selectedMusic.name }}
                </p>
                <p class="text-[11px] text-pink-400">
                  {{
                    selectedMusic.source === 'jamendo'
                      ? selectedMusic.artist
                      : 'Local file'
                  }}
                </p>
              </div>
              <div
                v-if="bgMusicUploading"
                class="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-brand border-t-transparent"
              />
              <button
                v-else
                type="button"
                class="shrink-0 rounded-full p-1 transition-colors hover:bg-pink-100 dark:hover:bg-pink-900/30"
                @click="removeBgMusic"
              >
                <Icon name="mdi:close" size="16" class="text-gray-500" />
              </button>
            </div>

            <!-- Add button -->
            <button
              v-else
              type="button"
              class="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm text-gray-500 transition-colors hover:border-brand hover:bg-brand/5 dark:border-neutral-600 dark:text-neutral-400"
              @click="showMusicPicker = true"
            >
              <Icon
                name="mdi:music-note-plus"
                size="18"
                class="text-gray-400 dark:text-neutral-500"
              />
              Add background music
            </button>
          </div>
        </div>

        <!-- Basic Info -->
        <div
          class="space-y-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-neutral-700 dark:bg-neutral-800"
        >
          <h2 class="font-semibold text-gray-900 dark:text-neutral-100">
            Basic Information
          </h2>

          <div>
            <label
              class="mb-1 block text-sm font-medium text-gray-700 dark:text-neutral-300"
              >Product Title *</label
            >
            <input
              v-model="form.title"
              type="text"
              required
              placeholder="e.g. Vintage Denim Jacket"
              class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div>
            <label
              class="mb-1 block text-sm font-medium text-gray-700 dark:text-neutral-300"
              >Description *</label
            >
            <ClientOnly>
              <HtmlDescriptionEditor
                v-model="form.description"
                placeholder="Describe your product…"
              />
              <template #fallback>
                <textarea
                  v-model="form.description"
                  rows="4"
                  class="w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                />
              </template>
            </ClientOnly>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                class="mb-1 block text-sm font-medium text-gray-700 dark:text-neutral-300"
                >Price (₦) *</label
              >
              <input
                v-model.number="form.price"
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>
            <div>
              <label
                class="mb-1 block text-sm font-medium text-gray-700 dark:text-neutral-300"
                >Discount (%)</label
              >
              <input
                v-model.number="form.discount"
                type="number"
                min="0"
                max="100"
                placeholder="0"
                class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          <!-- Affiliate Commission -->
          <div
            class="rounded-lg border border-purple-100 bg-purple-50 p-4 dark:border-purple-800/30 dark:bg-purple-900/10"
          >
            <label
              class="mb-1 block text-sm font-medium text-gray-700 dark:text-neutral-300"
            >
              Affiliate Commission (₦)
              <span
                class="ml-1 text-xs font-normal text-gray-400 dark:text-neutral-500"
                >— optional. Set this to let others earn by marketing your
                product.</span
              >
            </label>
            <input
              v-model.number="form.affiliateCommission"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 500"
              class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand sm:w-1/2 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            />
            <p
              v-if="form.affiliateCommission && form.affiliateCommission > 0"
              class="mt-1.5 text-xs text-purple-600 dark:text-purple-400"
            >
              Marketers will see: "Earn ₦{{
                Number(form.affiliateCommission).toLocaleString()
              }}
              by selling this product"
            </p>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                class="mb-1 block text-sm font-medium text-gray-700 dark:text-neutral-300"
                >SKU</label
              >
              <input
                v-model="form.SKU"
                type="text"
                placeholder="Optional"
                class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>
            <div>
              <label
                class="mb-1 block text-sm font-medium text-gray-700 dark:text-neutral-300"
                >Status</label
              >
              <select
                v-model="form.status"
                class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
          </div>
        </div>

        <!-- ✨ AI Generated Social Posts (Only shows if AI was used) -->
        <div
          v-if="hasAiCaptions"
          class="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-[0_0_15px_rgba(240,44,86,0.05)] sm:p-6 dark:border-neutral-700 dark:bg-neutral-800"
        >
          <div class="mb-2 flex items-center gap-2">
            <Icon name="mdi:share-all-outline" size="24" class="text-brand" />
            <div>
              <h2 class="font-semibold text-gray-900 dark:text-neutral-100">
                Social Media Posts
              </h2>
              <p class="text-xs text-gray-500 dark:text-neutral-400">
                These will automatically publish to your linked accounts when
                you create the product.
              </p>
            </div>
          </div>

          <div class="space-y-4">
            <!-- IG -->
            <div
              class="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-neutral-700 dark:bg-neutral-900"
            >
              <label
                class="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-neutral-300"
              >
                <Icon name="mdi:instagram" class="text-pink-600" size="16" />
                Instagram
              </label>
              <textarea
                v-model="form.socialCaptions.instagram"
                rows="4"
                class="w-full resize-none rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
              ></textarea>
            </div>

            <!-- Facebook -->
            <div
              class="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-neutral-700 dark:bg-neutral-900"
            >
              <label
                class="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-neutral-300"
              >
                <Icon name="mdi:facebook" class="text-blue-600" size="16" />
                Facebook
              </label>
              <textarea
                v-model="form.socialCaptions.facebook"
                rows="3"
                class="w-full resize-none rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
              ></textarea>
            </div>

            <!-- Pinterest -->
            <div
              class="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-neutral-700 dark:bg-neutral-900"
            >
              <label
                class="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-neutral-300"
              >
                <Icon name="mdi:pinterest" class="text-red-600" size="16" />
                Pinterest
              </label>
              <textarea
                v-model="form.socialCaptions.pinterest"
                rows="2"
                class="w-full resize-none rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Variants -->
        <div
          class="space-y-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-neutral-700 dark:bg-neutral-800"
        >
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-semibold text-gray-900 dark:text-neutral-100">
                Variants
              </h2>
              <p class="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">
                Sizes, colours, or any option that changes price or stock.
              </p>
            </div>
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-lg border border-brand/30 bg-brand/5 px-3 py-1.5 text-sm font-semibold text-brand transition-colors hover:bg-brand/10"
              @click="addVariant"
            >
              <Icon name="mdi:plus" size="15" /> Add Variant
            </button>
          </div>

          <!-- Variant rows -->
          <div v-if="form.variants.length" class="space-y-2">
            <div
              v-for="(variant, i) in form.variants"
              :key="i"
              class="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-neutral-700 dark:bg-neutral-900"
            >
              <div class="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label
                    class="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400"
                    >Size / Name *</label
                  >
                  <input
                    v-model="variant.size"
                    placeholder="e.g. M, Red, 42"
                    class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                </div>
                <div>
                  <label
                    class="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400"
                    >Price (₦)
                    <span class="font-normal opacity-60"
                      >— blank = base price</span
                    ></label
                  >
                  <input
                    v-model.number="variant.price"
                    type="number"
                    min="0"
                    placeholder="Same as base"
                    class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                </div>
                <div>
                  <label
                    class="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400"
                    >Stock</label
                  >
                  <input
                    v-model.number="variant.stock"
                    type="number"
                    min="0"
                    placeholder="0"
                    class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                </div>
              </div>
              <button
                type="button"
                class="mt-6 flex-shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                @click="removeVariant(i)"
              >
                <Icon name="mdi:trash-can-outline" size="16" />
              </button>
            </div>
          </div>

          <!-- Empty state — prominent CTA -->
          <button
            v-else
            type="button"
            class="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-8 transition-colors hover:border-brand hover:bg-brand/5 dark:border-neutral-700"
            @click="addVariant"
          >
            <Icon
              name="mdi:tag-multiple-outline"
              size="28"
              class="text-gray-400 dark:text-neutral-500"
            />
            <span
              class="text-sm font-medium text-gray-500 dark:text-neutral-400"
              >Click to add your first variant</span
            >
            <span class="text-xs text-gray-400 dark:text-neutral-500"
              >e.g. Small / Medium / Large or Red / Blue</span
            >
          </button>
        </div>

        <!-- Volume Offers -->
        <div
          class="space-y-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-neutral-700 dark:bg-neutral-800"
        >
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-semibold text-gray-900 dark:text-neutral-100">
                Volume Offers
              </h2>
              <p class="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">
                Reward buyers who purchase more. e.g. "Buy 3, get 10% off"
              </p>
            </div>
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
              @click="addOffer"
            >
              <Icon name="mdi:plus" size="15" /> Add Offer
            </button>
          </div>

          <div v-if="form.offers.length" class="space-y-2">
            <div
              v-for="(offer, i) in form.offers"
              :key="i"
              class="flex items-start gap-3 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 dark:border-emerald-900/40 dark:bg-emerald-900/10"
            >
              <div class="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label
                    class="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400"
                    >Min. Quantity *</label
                  >
                  <input
                    v-model.number="offer.minQuantity"
                    type="number"
                    min="2"
                    placeholder="e.g. 3"
                    class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                </div>
                <div>
                  <label
                    class="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400"
                    >Discount % *</label
                  >
                  <input
                    v-model.number="offer.discount"
                    type="number"
                    min="1"
                    max="100"
                    placeholder="e.g. 10"
                    class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                </div>
                <div>
                  <label
                    class="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400"
                    >Label
                    <span class="font-normal opacity-60"
                      >— shown to buyer</span
                    ></label
                  >
                  <input
                    v-model="offer.label"
                    placeholder="e.g. Bundle Deal"
                    class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                </div>
              </div>
              <!-- Preview pill -->
              <div class="flex flex-col items-end gap-1">
                <span
                  v-if="offer.minQuantity && offer.discount"
                  class="whitespace-nowrap rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                >
                  Buy {{ offer.minQuantity }}+ → {{ offer.discount }}% off
                </span>
                <button
                  type="button"
                  class="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                  @click="removeOffer(i)"
                >
                  <Icon name="mdi:trash-can-outline" size="16" />
                </button>
              </div>
            </div>
          </div>

          <button
            v-else
            type="button"
            class="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-6 transition-colors hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-neutral-700"
            @click="addOffer"
          >
            <Icon
              name="mdi:percent-outline"
              size="26"
              class="text-gray-400 dark:text-neutral-500"
            />
            <span
              class="text-sm font-medium text-gray-500 dark:text-neutral-400"
              >No offers yet — add a volume deal</span
            >
          </button>
        </div>

        <!-- Categories -->
        <div
          class="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-neutral-700 dark:bg-neutral-800"
        >
          <h2 class="mb-1 font-semibold text-gray-900 dark:text-neutral-100">
            Categories
          </h2>
          <p class="mb-3 text-xs text-gray-500 dark:text-neutral-400">
            Select all that apply.
          </p>
          <div
            v-if="categoriesLoading"
            class="flex items-center gap-2 text-sm text-gray-400 dark:text-neutral-500"
          >
            <Icon name="mdi:loading" size="16" class="animate-spin" /> Loading
            categories…
          </div>
          <div
            v-else-if="categories.length === 0"
            class="text-sm text-gray-400 dark:text-neutral-500"
          >
            No categories available.
          </div>
          <div v-else class="flex flex-wrap gap-2">
            <button
              v-for="cat in categories"
              :key="cat.id"
              type="button"
              class="rounded-full border px-3 py-1.5 text-sm font-medium transition-colors"
              :class="
                form.categoryIds.includes(cat.id)
                  ? 'border-brand bg-brand text-white'
                  : 'border-gray-200 bg-gray-100 text-gray-700 hover:border-brand dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'
              "
              @click="toggleCategory(cat.id)"
            >
              {{ cat.name }}
            </button>
          </div>
        </div>

        <!-- Tags -->
        <div
          class="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-neutral-700 dark:bg-neutral-800"
        >
          <label
            class="mb-3 block text-sm font-semibold text-gray-900 dark:text-neutral-100"
          >
            Tags
            <span class="ml-1 font-normal text-gray-400 dark:text-neutral-500"
              >(optional, max 10)</span
            >
          </label>
          <!-- Tag pills -->
          <div v-if="form.tagNames.length" class="mb-2 flex flex-wrap gap-1.5">
            <span
              v-for="(tag, i) in form.tagNames"
              :key="i"
              class="flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-sm font-medium text-brand"
            >
              #{{ tag }}
              <button
                type="button"
                class="ml-0.5 rounded-full hover:bg-brand/20"
                @click="form.tagNames.splice(i, 1)"
              >
                <Icon name="mdi:close" size="13" />
              </button>
            </span>
          </div>
          <!-- Tag input -->
          <input
            v-if="form.tagNames.length < 10"
            v-model="tagInput"
            type="text"
            placeholder="Type a tag and press Enter or comma"
            class="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition-all focus:border-brand/50 focus:bg-white focus:ring-2 focus:ring-brand/10 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:bg-neutral-800"
            @keydown.enter.prevent="addTag"
            @keydown.188.prevent="addTag"
          />
          <p class="mt-1.5 text-xs text-gray-400 dark:text-neutral-500">
            Tags help shoppers find your product. E.g. "streetwear", "vintage",
            "summer"
          </p>
        </div>

        <!-- Distribution -->
        <div
          class="rounded-xl border border-brand/20 bg-gradient-to-br from-brand/5 to-purple-600/5 p-4 sm:p-6 dark:from-brand/10 dark:to-purple-600/10"
        >
          <div class="mb-4 flex items-center gap-2">
            <Icon
              name="mdi:share-variant-outline"
              size="20"
              class="text-brand"
            />
            <div>
              <h2 class="font-semibold text-gray-900 dark:text-neutral-100">
                Distribution
              </h2>
              <p class="text-xs text-gray-500 dark:text-neutral-400">
                Choose where this product appears
              </p>
            </div>
          </div>

          <div class="space-y-3">
            <!-- Shop & Discover: always ON, not toggleable -->
            <div
              class="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800"
            >
              <div class="flex items-center gap-3">
                <div
                  class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10"
                >
                  <Icon
                    name="mdi:storefront-outline"
                    size="18"
                    class="text-brand"
                  />
                </div>
                <div>
                  <p
                    class="text-sm font-medium text-gray-900 dark:text-neutral-100"
                  >
                    Shop &amp; Discover
                  </p>
                  <p class="text-xs text-gray-400 dark:text-neutral-500">
                    Always visible in your store and discovery pages
                  </p>
                </div>
              </div>
              <span
                class="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                >Always On</span
              >
            </div>

            <!-- Share to Feed (Premium only) -->
            <div
              class="rounded-xl border bg-white dark:bg-neutral-800"
              :class="
                form.showInFeed
                  ? 'border-brand/30 dark:border-brand/30'
                  : 'border-gray-200 dark:border-neutral-700'
              "
            >
              <button
                type="button"
                class="flex w-full items-center justify-between px-4 py-3"
                :disabled="!isPremiumSeller"
                :title="
                  !isPremiumSeller
                    ? 'Upgrade to Premium to publish products to the social feed'
                    : undefined
                "
                @click="isPremiumSeller && (form.showInFeed = !form.showInFeed)"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-9 w-9 items-center justify-center rounded-lg"
                    :class="
                      form.showInFeed
                        ? 'bg-brand/10'
                        : 'bg-gray-100 dark:bg-neutral-700'
                    "
                  >
                    <Icon
                      name="mdi:image-multiple-outline"
                      size="18"
                      :class="
                        form.showInFeed
                          ? 'text-brand'
                          : 'text-gray-500 dark:text-neutral-400'
                      "
                    />
                  </div>
                  <div class="text-left">
                    <p
                      class="text-sm font-medium text-gray-900 dark:text-neutral-100"
                    >
                      Share to Feed
                      <span
                        v-if="!isPremiumSeller"
                        class="ml-1.5 rounded-full bg-violet px-2 py-0.5 text-[10px] font-bold text-white"
                        >PREMIUM</span
                      >
                    </p>
                    <p class="text-xs text-gray-400 dark:text-neutral-500">
                      {{
                        isPremiumSeller
                          ? 'Post this product as a social feed card'
                          : 'Available on Premium plan'
                      }}
                    </p>
                  </div>
                </div>
                <!-- Toggle pill -->
                <div
                  class="relative h-6 w-11 shrink-0 rounded-full transition-colors"
                  :class="
                    !isPremiumSeller
                      ? 'opacity-40'
                      : form.showInFeed
                        ? 'bg-brand'
                        : 'bg-gray-200 dark:bg-neutral-600'
                  "
                >
                  <div
                    class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
                    :class="
                      form.showInFeed ? 'translate-x-5' : 'translate-x-0.5'
                    "
                  />
                </div>
              </button>
              <!-- Feed caption (shown when toggle is ON) -->
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
                  <label
                    class="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-neutral-400"
                  >
                    Feed caption
                    <span class="font-normal text-gray-400"
                      >— optional, up to 2200 chars</span
                    >
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
              :class="
                form.showInReels
                  ? 'border-brand/30 dark:border-brand/30'
                  : 'border-gray-200 dark:border-neutral-700'
              "
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
                @click="
                  hasVideo &&
                    isPremiumSeller &&
                    (form.showInReels = !form.showInReels)
                "
              >
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-9 w-9 items-center justify-center rounded-lg"
                    :class="
                      form.showInReels
                        ? 'bg-brand/10'
                        : 'bg-gray-100 dark:bg-neutral-700'
                    "
                  >
                    <Icon
                      name="mdi:play-box-multiple-outline"
                      size="18"
                      :class="
                        form.showInReels
                          ? 'text-brand'
                          : 'text-gray-500 dark:text-neutral-400'
                      "
                    />
                  </div>
                  <div class="text-left">
                    <p
                      class="text-sm font-medium text-gray-900 dark:text-neutral-100"
                    >
                      Share to Reels
                      <span
                        v-if="!isPremiumSeller"
                        class="ml-1.5 rounded-full bg-violet px-2 py-0.5 text-[10px] font-bold text-white"
                        >PREMIUM</span
                      >
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
                  :class="
                    !isPremiumSeller || !hasVideo
                      ? 'opacity-40'
                      : form.showInReels
                        ? 'bg-brand'
                        : 'bg-gray-200 dark:bg-neutral-600'
                  "
                >
                  <div
                    class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
                    :class="
                      form.showInReels ? 'translate-x-5' : 'translate-x-0.5'
                    "
                  />
                </div>
              </button>
            </div>

            <!-- Pre-loved (Thrift) toggle -->
            <div
              class="rounded-xl border bg-white dark:bg-neutral-800"
              :class="
                form.isThrift
                  ? 'border-pink-200 dark:border-pink-800/30'
                  : 'border-gray-200 dark:border-neutral-700'
              "
            >
              <button
                type="button"
                class="flex w-full items-center justify-between px-4 py-3"
                @click="form.isThrift = !form.isThrift"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-9 w-9 items-center justify-center rounded-lg"
                    :class="
                      form.isThrift
                        ? 'bg-pink-50 dark:bg-pink-900/20'
                        : 'bg-gray-100 dark:bg-neutral-700'
                    "
                  >
                    <Icon
                      name="mdi:heart-circle-outline"
                      size="18"
                      :class="
                        form.isThrift
                          ? 'text-pink-500'
                          : 'text-gray-500 dark:text-neutral-400'
                      "
                    />
                  </div>
                  <div class="text-left">
                    <p
                      class="text-sm font-medium text-gray-900 dark:text-neutral-100"
                    >
                      Pre-loved / Thrift
                    </p>
                    <p class="text-xs text-gray-400 dark:text-neutral-500">
                      Shows in Pre-loved section — set condition below
                    </p>
                  </div>
                </div>
                <div
                  class="relative h-6 w-11 shrink-0 rounded-full transition-colors"
                  :class="
                    form.isThrift
                      ? 'bg-pink-500'
                      : 'bg-gray-200 dark:bg-neutral-600'
                  "
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
                  <label
                    class="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-neutral-400"
                    >Condition</label
                  >
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="c in CONDITIONS"
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

            <!-- Deal toggle -->
            <div
              class="rounded-xl border bg-white dark:bg-neutral-800"
              :class="
                form.isDeal
                  ? 'border-amber-200 dark:border-amber-800/30'
                  : 'border-gray-200 dark:border-neutral-700'
              "
            >
              <button
                type="button"
                class="flex w-full items-center justify-between px-4 py-3"
                @click="form.isDeal = !form.isDeal"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-9 w-9 items-center justify-center rounded-lg"
                    :class="
                      form.isDeal
                        ? 'bg-amber-50 dark:bg-amber-900/20'
                        : 'bg-gray-100 dark:bg-neutral-700'
                    "
                  >
                    <Icon
                      name="mdi:tag-outline"
                      size="18"
                      :class="
                        form.isDeal
                          ? 'text-amber-500'
                          : 'text-gray-500 dark:text-neutral-400'
                      "
                    />
                  </div>
                  <div class="text-left">
                    <p
                      class="text-sm font-medium text-gray-900 dark:text-neutral-100"
                    >
                      Flash Deal
                    </p>
                    <p class="text-xs text-gray-400 dark:text-neutral-500">
                      Shows in Deals section with countdown timer
                    </p>
                  </div>
                </div>
                <div
                  class="relative h-6 w-11 shrink-0 rounded-full transition-colors"
                  :class="
                    form.isDeal
                      ? 'bg-amber-500'
                      : 'bg-gray-200 dark:bg-neutral-600'
                  "
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
                  <label
                    class="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-neutral-400"
                    >Deal ends at</label
                  >
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

        <!-- Flags -->
        <div
          class="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-neutral-700 dark:bg-neutral-800"
        >
          <h2 class="mb-4 font-semibold text-gray-900 dark:text-neutral-100">
            Product Flags
          </h2>
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <label class="flex cursor-pointer items-center gap-2">
              <input
                v-model="form.isFeatured"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
              />
              <span class="text-sm text-gray-700 dark:text-neutral-300"
                >Featured</span
              >
            </label>
            <label class="flex cursor-pointer items-center gap-2">
              <input
                v-model="form.isAccessory"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
              />
              <span class="text-sm text-gray-700 dark:text-neutral-300"
                >Accessory</span
              >
            </label>
          </div>
        </div>

        <!-- Submit -->
        <div class="flex flex-col gap-3 sm:flex-row">
          <NuxtLink
            :to="`/seller/${storeSlug}/products`"
            class="flex-1 rounded-xl border border-gray-200 py-3 text-center font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Cancel
          </NuxtLink>
          <button
            type="submit"
            :disabled="isLoading || isAnyUploading || isGeneratingAI"
            class="flex-1 rounded-xl bg-brand py-3 font-semibold text-white transition-colors hover:bg-[#d81b36] disabled:opacity-50"
          >
            {{
              isAnyUploading
                ? 'Uploading Media...'
                : isGeneratingAI
                  ? 'AI Processing...'
                  : isLoading
                    ? 'Creating...'
                    : 'Create Product'
            }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <MusicPicker
    :is-open="showMusicPicker"
    @close="showMusicPicker = false"
    @select="onMusicSelected"
  />
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProduct } from '~~/layers/commerce/app/composables/useProduct'
import { useMediaUpload } from '~~/layers/core/app/composables/useMediaUpload'
import { useAiApi } from '~~/layers/core/app/services/ai.api'
import { notify } from '@kyvg/vue3-notification'
import MusicPicker from '~~/layers/core/app/components/MusicPicker.vue'
import type { MusicSelection } from '~~/layers/core/app/components/MusicPicker.vue'
import HtmlDescriptionEditor from '~~/layers/seller/app/components/HtmlDescriptionEditor.vue'

definePageMeta({ middleware: 'auth', layout: 'store-layout' })

const route = useRoute()
const router = useRouter()
const storeSlug = computed(
  () =>
    (route.params.storeSlug as string) || (route.params.store_slug as string),
)
const isOnboarding = computed(() => route.query.onboarding === '1')

const isPremiumSeller = ref(false)
onMounted(async () => {
  try {
    const res: any = await $fetch(`/api/seller/by-slug/${storeSlug.value}`)
    isPremiumSeller.value = res?.data?.isPremium ?? false
  } catch {
    // non-critical — defaults to false
  }
})

const { createProduct, fetchCategories, isLoading, error } = useProduct()
const { uploadMedia } = useMediaUpload()
const aiApi = useAiApi()

// ── Media state ──────────────────────────────────────────────────────────────
interface MediaItem {
  preview: string
  file: File
  uploading: boolean
  progress: number
  result: { url: string; public_id: string; type: string } | null
}

const mediaItems = ref<MediaItem[]>([])
const showMusicPicker = ref(false)
const selectedMusic = ref<MusicSelection | null>(null)
const bgMusicResult = ref<{
  url: string
  public_id: string
  name?: string
} | null>(null)
const bgMusicUploading = ref(false)

const isAnyUploading = computed(
  () => mediaItems.value.some((m) => m.uploading) || bgMusicUploading.value,
)

const onImagesSelected = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || []).slice(
    0,
    5 - mediaItems.value.length,
  )
  input.value = ''

  for (const file of files) {
    const item: MediaItem = {
      preview: URL.createObjectURL(file),
      file,
      uploading: true,
      progress: 0,
      result: null,
    }
    mediaItems.value.push(item)
    const idx = mediaItems.value.length - 1

    try {
      const res = await uploadMedia({ file }, (pct) => {
        if (mediaItems.value[idx]) mediaItems.value[idx].progress = pct
      })
      if (mediaItems.value[idx]) {
        mediaItems.value[idx].result = res
        mediaItems.value[idx].uploading = false
      }
    } catch {
      mediaItems.value.splice(idx, 1)
    }
  }
}

const removeMediaItem = (i: number) => {
  const item = mediaItems.value[i]
  if (item?.preview) URL.revokeObjectURL(item.preview)
  mediaItems.value.splice(i, 1)
}

const onMusicSelected = async (music: MusicSelection) => {
  selectedMusic.value = music
  bgMusicUploading.value = true
  try {
    if (music.source === 'upload' && music.file) {
      const res = await uploadMedia(music.file)
      bgMusicResult.value = {
        url: res.url,
        public_id: res.public_id,
        name: music.name,
      }
    } else if (music.source === 'jamendo' && music.url) {
      bgMusicResult.value = {
        url: music.url,
        public_id: `jamendo-${Date.now()}`,
        name: `${music.name}${music.artist ? ` · ${music.artist}` : ''}`,
      }
    }
  } catch {
    selectedMusic.value = null
    bgMusicResult.value = null
  } finally {
    bgMusicUploading.value = false
  }
}

const removeBgMusic = () => {
  selectedMusic.value = null
  bgMusicResult.value = null
}

// ── Form state ───────────────────────────────────────────────────────────────
const form = reactive({
  title: '',
  description: '',
  price: null as number | null,
  discount: 0,
  affiliateCommission: null as number | null,
  SKU: '',
  status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
  isFeatured: false,
  isAccessory: false,
  variants: [] as Array<{ size: string; price: number | null; stock: number }>,
  offers: [] as Array<{
    minQuantity: number | null
    discount: number | null
    label: string
  }>,
  categoryIds: [] as number[],
  tagNames: [] as string[],
  // Added social captions to hold AI outputs
  socialCaptions: {
    instagram: '',
    facebook: '',
    pinterest: '',
    feedCaption: '',
  },
  // Distribution
  showInFeed: false,
  showInReels: false,
  // Pre-loved
  isThrift: false,
  condition: '' as string,
  // Deal
  isDeal: false,
  dealEndsAt: '' as string,
})

const CONDITIONS = [
  { value: 'NEW_WITH_TAGS', label: 'New with tags' },
  { value: 'LIKE_NEW', label: 'Like new' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'POOR', label: 'Poor' },
]

const hasVideo = computed(() =>
  mediaItems.value.some(
    (m) => m.result?.type === 'VIDEO' || m.file.type.startsWith('video/'),
  ),
)

const minDealDate = computed(() => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
})

// ── AI Magic Lister Integration ───────────────────────────────────────────────
const isGeneratingAI = ref(false)
const hasAiCaptions = computed(
  () =>
    !!(
      form.socialCaptions.instagram ||
      form.socialCaptions.facebook ||
      form.socialCaptions.pinterest
    ),
)

// Helper to convert File to Base64 for the Gemini API
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      // The API expects pure base64 without the data:image prefix
      const base64Data = result.split(',')[1]
      resolve(base64Data)
    }
    reader.onerror = (error) => reject(error)
  })
}

const autoFillWithAI = async () => {
  if (!mediaItems.value.length) return

  isGeneratingAI.value = true
  try {
    // 1. Get the first image (cover image)
    const coverFile = mediaItems.value[0]?.file
    if (!coverFile) return

    const base64Image = await fileToBase64(coverFile)
    // 2. Call AI service
    const response = await aiApi.generateListing(
      base64Image,
      coverFile.type,
      form.isThrift ? 'This is a thrift/vintage item.' : '',
    )

    // 3. Populate the reactive form fields
    if (response.success && response.data) {
      const aiData = response.data

      // Only overwrite fields if they are empty, or fully overwrite if you prefer
      form.title = aiData.title || form.title
      form.description = aiData.description || form.description

      // Don't overwrite price if they already typed one
      if (!form.price && aiData.suggestedPrice) {
        // Convert suggested USD price to NGN (Rough mock conversion, adjust as needed)
        // Assuming 1 USD = ~1500 NGN for placeholder logic
        form.price = Math.round((aiData.suggestedPrice * 1500) / 100) * 100
      }

      form.socialCaptions.instagram = aiData.socialCaptions?.instagram || ''
      form.socialCaptions.facebook = aiData.socialCaptions?.facebook || ''
      form.socialCaptions.pinterest = aiData.socialCaptions?.pinterest || ''

      notify({ type: 'success', text: '✨ AI has filled out your listing!' })
    }
  } catch (err: any) {
    console.error('AI Generation Failed:', err)
    notify({
      type: 'error',
      text: 'Failed to generate listing with AI. Please try again.',
    })
  } finally {
    isGeneratingAI.value = false
  }
}

// ── Categories ────────────────────────────────────────────────────────────────
const categories = ref<Array<{ id: number; name: string; slug: string }>>([])
const categoriesLoading = ref(false)

onMounted(async () => {
  categoriesLoading.value = true
  try {
    categories.value = await fetchCategories()
  } catch {
    // non-fatal
  } finally {
    categoriesLoading.value = false
  }
})

const toggleCategory = (id: number) => {
  const idx = form.categoryIds.indexOf(id)
  if (idx === -1) form.categoryIds.push(id)
  else form.categoryIds.splice(idx, 1)
}

const tagInput = ref('')
const addTag = () => {
  const name = tagInput.value.trim().toLowerCase().replace(/,/g, '')
  if (
    name &&
    name.length <= 50 &&
    !form.tagNames.includes(name) &&
    form.tagNames.length < 10
  ) {
    form.tagNames.push(name)
  }
  tagInput.value = ''
}

const addVariant = () => {
  form.variants.push({ size: '', price: null, stock: 0 })
}

const removeVariant = (index: number) => {
  form.variants.splice(index, 1)
}

const addOffer = () => {
  form.offers.push({ minQuantity: null, discount: null, label: '' })
}

const removeOffer = (index: number) => {
  form.offers.splice(index, 1)
}

const handleSubmit = async () => {
  try {
    const payload: any = {
      storeSlug: storeSlug.value,
      title: form.title,
      description: form.description,
      price: form.price,
      discount: form.discount || 0,
      status: form.status,
      isFeatured: form.isFeatured,
      isThrift: form.isThrift,
      isAccessory: form.isAccessory,
      showInFeed: form.showInFeed,
      showInReels: form.showInReels,
      isDeal: form.isDeal,
      dealEndsAt:
        form.isDeal && form.dealEndsAt
          ? new Date(form.dealEndsAt).toISOString()
          : undefined,
      condition: form.isThrift && form.condition ? form.condition : undefined,
      // Include the social captions in the payload to save them to the DB
      socialCaptions: form.socialCaptions,
    }

    if (form.affiliateCommission && form.affiliateCommission > 0)
      payload.affiliateCommission = form.affiliateCommission
    if (form.SKU) payload.SKU = form.SKU
    if (form.categoryIds.length) payload.categoryIds = form.categoryIds
    if (form.tagNames.length) payload.tagNames = form.tagNames

    if (form.variants.length) {
      payload.variants = form.variants
        .filter((v) => v.size)
        .map((v) => ({
          size: v.size,
          price: v.price ?? undefined,
          stock: v.stock,
        }))
    }

    const validOffers = form.offers.filter(
      (o) =>
        o.minQuantity && o.minQuantity >= 2 && o.discount && o.discount > 0,
    )
    if (validOffers.length) {
      payload.offers = validOffers.map((o) => ({
        minQuantity: o.minQuantity!,
        discount: o.discount!,
        label: o.label || undefined,
      }))
    }

    // Attach uploaded media
    const uploaded = mediaItems.value.filter((m) => m.result)
    if (uploaded.length) {
      payload.mediaItems = uploaded.map((m) => ({
        url: m.result!.url,
        public_id: m.result!.public_id,
        type: m.result!.type || 'IMAGE',
      }))
    }

    if (bgMusicResult.value) {
      payload.bgMusic = {
        url: bgMusicResult.value.url,
        public_id: bgMusicResult.value.public_id,
        name: bgMusicResult.value.name,
      }
    }

    await createProduct(payload)
    notify({ type: 'success', text: 'Product created successfully!' })
    if (isOnboarding.value) {
      await router.push(`/seller/${storeSlug.value}/dashboard?welcome=1`)
    } else {
      await router.push(`/seller/${storeSlug.value}/products`)
    }
  } catch {
    // error is reactive from composable
    notify({ type: 'error', text: 'Failed to create product' })
  }
}
</script>
