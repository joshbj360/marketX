<template>
  <div class="px-4 py-6 sm:px-6">
    <div class="mb-6 flex items-center gap-3">
      <NuxtLink
        :to="`/seller/${storeSlug}/products`"
        class="text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        <Icon name="mdi:arrow-left" size="20" />
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-neutral-100">
        Edit Product
      </h1>
    </div>

    <div class="max-w-3xl">
      <!-- Loading skeleton -->
      <div v-if="isFetching" class="space-y-6">
        <div
          v-for="i in 3"
          :key="i"
          class="animate-pulse rounded-xl border border-gray-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800"
        >
          <div class="mb-4 h-5 w-1/3 rounded bg-gray-200 dark:bg-neutral-700" />
          <div class="space-y-3">
            <div class="h-10 rounded-lg bg-gray-100 dark:bg-neutral-700" />
            <div class="h-10 rounded-lg bg-gray-100 dark:bg-neutral-700" />
          </div>
        </div>
      </div>

      <!-- Fetch Error -->
      <div v-else-if="fetchError" class="py-20 text-center">
        <p class="mb-3 text-red-500 dark:text-red-400">
          Failed to load product.
        </p>
        <NuxtLink
          :to="`/seller/${storeSlug}/products`"
          class="text-sm text-brand hover:underline"
          >Back to products</NuxtLink
        >
      </div>

      <template v-else>
        <!-- Tab Nav -->
        <div
          class="mb-6 flex w-fit gap-1 rounded-xl bg-gray-100 p-1 dark:bg-neutral-800"
        >
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            @click="activeTab = tab.id"
            :class="[
              'flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100'
                : 'text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-300',
            ]"
          >
            <Icon :name="tab.icon" size="15" />
            {{ tab.label }}
          </button>
        </div>

        <!-- ── DETAILS TAB ── -->
        <form
          v-show="activeTab === 'details'"
          @submit.prevent="handleSubmit"
          class="space-y-6"
        >
          <!-- Error / Success banners -->
          <div
            v-if="error"
            class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
          >
            <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
          </div>
          <div
            v-if="successMsg"
            class="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20"
          >
            <p class="text-sm text-green-600 dark:text-green-400">
              {{ successMsg }}
            </p>
          </div>

          <!-- ── Product Images ── -->
          <div
            class="space-y-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-neutral-700 dark:bg-neutral-800"
          >
            <h2 class="font-semibold text-gray-900 dark:text-neutral-100">
              Product Images
            </h2>
            <p class="text-xs text-gray-500 dark:text-neutral-400">
              Up to 5 images. First image is the cover.
            </p>

            <!-- Image grid -->
            <div class="grid grid-cols-3 gap-3 sm:grid-cols-5">
              <!-- Existing images not yet removed -->
              <div
                v-for="(img, i) in visibleExistingMedia"
                :key="'existing-' + img.id"
                class="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-900"
              >
                <img :src="img.url" class="h-full w-full object-cover" />
                <div
                  v-if="i === 0 && newMediaItems.length === 0"
                  class="absolute left-1 top-1 rounded bg-brand px-1.5 py-0.5 text-[10px] font-medium text-white"
                >
                  Cover
                </div>
                <button
                  type="button"
                  @click="removeExistingMedia(img.id)"
                  class="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <Icon name="mdi:close" size="12" />
                </button>
              </div>

              <!-- New uploaded images -->
              <div
                v-for="(img, i) in newMediaItems"
                :key="'new-' + i"
                class="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-900"
              >
                <img :src="img.preview" class="h-full w-full object-cover" />
                <div
                  v-if="img.uploading"
                  class="absolute inset-0 flex items-center justify-center bg-black/50"
                >
                  <Icon
                    name="mdi:loading"
                    size="20"
                    class="animate-spin text-white"
                  />
                </div>
                <div
                  v-if="visibleExistingMedia.length === 0 && i === 0"
                  class="absolute left-1 top-1 rounded bg-brand px-1.5 py-0.5 text-[10px] font-medium text-white"
                >
                  Cover
                </div>
                <button
                  type="button"
                  @click="removeNewMedia(i)"
                  class="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <Icon name="mdi:close" size="12" />
                </button>
              </div>

              <!-- Add image button -->
              <label
                v-if="totalImageCount < 5"
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

            <!-- Background Music -->
            <div
              class="mt-4 border-t border-gray-100 pt-4 dark:border-neutral-700"
            >
              <h3
                class="mb-2 text-sm font-medium text-gray-700 dark:text-neutral-300"
              >
                Background Music (optional)
              </h3>

              <!-- Existing bg music -->
              <div
                v-if="existingBgMusic && !bgMusicRemoved && !newBgMusic"
                class="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-neutral-900"
              >
                <Icon
                  name="mdi:music-note"
                  size="20"
                  class="flex-shrink-0 text-brand"
                />
                <span
                  class="flex-1 truncate text-sm text-gray-700 dark:text-neutral-300"
                >
                  Current background music
                </span>
                <a
                  :href="existingBgMusic.url"
                  target="_blank"
                  class="flex-shrink-0 text-xs text-brand hover:underline"
                  >Preview</a
                >
                <button
                  type="button"
                  @click="bgMusicRemoved = true"
                  class="flex-shrink-0 text-gray-400 hover:text-red-500"
                >
                  <Icon name="mdi:close" size="16" />
                </button>
              </div>

              <!-- New bg music -->
              <div
                v-else-if="newBgMusic"
                class="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-neutral-900"
              >
                <Icon
                  name="mdi:music-note"
                  size="20"
                  class="flex-shrink-0 text-brand"
                />
                <span
                  class="flex-1 truncate text-sm text-gray-700 dark:text-neutral-300"
                >
                  {{ newBgMusic.name }}
                </span>
                <div v-if="bgMusicUploading" class="flex-shrink-0">
                  <Icon
                    name="mdi:loading"
                    size="16"
                    class="animate-spin text-brand"
                  />
                </div>
                <button
                  type="button"
                  @click="newBgMusic = null"
                  class="flex-shrink-0 text-gray-400 hover:text-red-500"
                >
                  <Icon name="mdi:close" size="16" />
                </button>
              </div>

              <!-- Upload button -->
              <label
                v-else
                class="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 transition-colors hover:border-brand hover:bg-brand/5 dark:border-neutral-600"
              >
                <Icon
                  name="mdi:music-plus"
                  size="18"
                  class="text-gray-400 dark:text-neutral-500"
                />
                <span class="text-sm text-gray-500 dark:text-neutral-400">
                  {{
                    bgMusicRemoved
                      ? 'Add new background music'
                      : 'Add background music'
                  }}
                </span>
                <input
                  type="file"
                  accept="audio/*"
                  class="hidden"
                  @change="onBgMusicSelected"
                />
              </label>
            </div>
          </div>

          <!-- Basic Info -->
          <div
            class="space-y-4 rounded-xl border border-gray-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800"
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
                class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div>
              <label
                class="mb-1 block text-sm font-medium text-gray-700 dark:text-neutral-300"
                >Description *</label
              >
              <textarea
                v-model="form.description"
                required
                minlength="10"
                rows="4"
                class="w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
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
                  class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
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
                  class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
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
                  >— optional.</span
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

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label
                  class="mb-1 block text-sm font-medium text-gray-700 dark:text-neutral-300"
                  >SKU</label
                >
                <input
                  v-model="form.SKU"
                  type="text"
                  class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
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
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>
          </div>

          <!-- ── Variants ── -->
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
                @click="addVariant"
                class="flex items-center gap-1.5 rounded-lg border border-brand/30 bg-brand/5 px-3 py-1.5 text-sm font-semibold text-brand transition-colors hover:bg-brand/10"
              >
                <Icon name="mdi:plus" size="15" /> Add Variant
              </button>
            </div>

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
                  @click="removeVariant(i)"
                  class="mt-6 flex-shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                >
                  <Icon name="mdi:trash-can-outline" size="16" />
                </button>
              </div>
            </div>

            <button
              v-else
              type="button"
              @click="addVariant"
              class="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-8 transition-colors hover:border-brand hover:bg-brand/5 dark:border-neutral-700"
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

          <!-- ── Volume Offers ── -->
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
                @click="addOffer"
                class="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
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
                <div class="flex flex-col items-end gap-1">
                  <span
                    v-if="offer.minQuantity && offer.discount"
                    class="whitespace-nowrap rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                  >
                    Buy {{ offer.minQuantity }}+ → {{ offer.discount }}% off
                  </span>
                  <button
                    type="button"
                    @click="removeOffer(i)"
                    class="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                  >
                    <Icon name="mdi:trash-can-outline" size="16" />
                  </button>
                </div>
              </div>
            </div>

            <button
              v-else
              type="button"
              @click="addOffer"
              class="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-6 transition-colors hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-neutral-700"
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
            class="rounded-xl border border-gray-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800"
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
                @click="toggleCategory(cat.id)"
                class="rounded-full border px-3 py-1.5 text-sm font-medium transition-colors"
                :class="
                  form.categoryIds.includes(cat.id)
                    ? 'border-brand bg-brand text-white'
                    : 'border-gray-200 bg-gray-100 text-gray-700 hover:border-brand dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'
                "
              >
                {{ cat.name }}
              </button>
            </div>
          </div>

          <!-- Tags -->
          <div
            class="rounded-xl border border-gray-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800"
          >
            <h2 class="mb-1 font-semibold text-gray-900 dark:text-neutral-100">
              Tags
              <span
                class="ml-1 text-sm font-normal text-gray-400 dark:text-neutral-500"
                >(optional, max 10)</span
              >
            </h2>
            <p class="mb-3 text-xs text-gray-500 dark:text-neutral-400">
              Tags help shoppers discover your product
            </p>
            <div
              v-if="form.tagNames.length"
              class="mb-2 flex flex-wrap gap-1.5"
            >
              <span
                v-for="(tag, i) in form.tagNames"
                :key="i"
                class="flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-sm font-medium text-brand"
              >
                #{{ tag }}
                <button
                  type="button"
                  @click="form.tagNames.splice(i, 1)"
                  class="ml-0.5 rounded-full hover:bg-brand/20"
                >
                  <Icon name="mdi:close" size="13" />
                </button>
              </span>
            </div>
            <input
              v-if="form.tagNames.length < 10"
              v-model="tagInput"
              type="text"
              placeholder="Type a tag and press Enter or comma"
              class="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition-all focus:border-brand/50 focus:bg-white focus:ring-2 focus:ring-brand/10 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:bg-neutral-800"
              @keydown.enter.prevent="addTag"
              @keydown.188.prevent="addTag"
            />
          </div>

          <!-- Flags -->
          <div
            class="rounded-xl border border-gray-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800"
          >
            <h2 class="mb-4 font-semibold text-gray-900 dark:text-neutral-100">
              Product Flags
            </h2>
            <div class="grid grid-cols-3 gap-4">
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
                  v-model="form.isThrift"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
                />
                <span class="text-sm text-gray-700 dark:text-neutral-300"
                  >Thrift</span
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
          <div class="flex gap-3">
            <NuxtLink
              :to="`/seller/${storeSlug}/products`"
              class="flex-1 rounded-xl border border-gray-200 py-3 text-center font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Cancel
            </NuxtLink>
            <button
              type="submit"
              :disabled="isLoading || isAnyUploading"
              class="flex-1 rounded-xl bg-brand py-3 font-semibold text-white transition-colors hover:bg-[#d81b36] disabled:opacity-50"
            >
              {{
                isAnyUploading
                  ? 'Uploading...'
                  : isLoading
                    ? 'Saving...'
                    : 'Save Changes'
              }}
            </button>
          </div>
        </form>

        <!-- ── PROMOTE TAB ── -->
        <div v-show="activeTab === 'promote'" class="space-y-4">
          <!-- AI Magic Lister trigger (when cover image exists) -->
          <div
            v-if="currentCoverUrl"
            class="flex flex-col items-start justify-between gap-4 rounded-xl border border-brand/20 bg-gradient-to-r from-brand/10 to-purple-600/10 p-4 sm:flex-row sm:items-center dark:from-brand/20 dark:to-purple-600/20"
          >
            <div>
              <h3
                class="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-white"
              >
                <Icon name="mdi:magic-staff" class="text-brand" size="18" />
                AI Magic Lister
              </h3>
              <p class="mt-1 max-w-sm text-xs text-gray-600 dark:text-gray-300">
                Re-analyze your cover image to regenerate all captions from
                scratch.
              </p>
            </div>
            <button
              type="button"
              @click="runAiMagic"
              :disabled="isGeneratingAI"
              class="flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 sm:w-auto dark:bg-white dark:text-gray-900"
            >
              <Icon
                v-if="isGeneratingAI"
                name="eos-icons:loading"
                class="animate-spin"
                size="18"
              />
              <Icon v-else name="mdi:creation" size="18" />
              {{ isGeneratingAI ? 'Generating...' : 'Regenerate Captions' }}
            </button>
          </div>

          <ProductPromotePanel
            :product-id="productId"
            :initial-captions="socialCaptions"
            :cover-image-url="currentCoverUrl"
            :is-generating="isGeneratingAI"
            @regenerate="runAiMagic"
            @saved="onCaptionsSaved"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'
import { useProduct } from '~~/layers/commerce/app/composables/useProduct'
import { useProductApi } from '~~/layers/commerce/app/services/product.api'
import { useMediaUpload } from '~~/layers/core/app/composables/useMediaUpload'
import { useAiApi } from '~~/layers/core/app/services/ai.api'

definePageMeta({ middleware: 'auth', layout: 'store-layout' })

const route = useRoute()
const storeSlug = computed(() => route.params.storeSlug as string)
const productId = computed(() => Number(route.params.id))

const { updateProduct, isLoading, error } = useProduct()
const productApi = useProductApi()
const { uploadMedia } = useMediaUpload()
const aiApi = useAiApi()

const tabs = [
  { id: 'details', label: 'Details', icon: 'mdi:pencil-outline' },
  { id: 'promote', label: 'Promote', icon: 'mdi:rocket-launch-outline' },
]
const activeTab = ref<'details' | 'promote'>(
  route.query.tab === 'promote' ? 'promote' : 'details',
)

const isFetching = ref(true)
const fetchError = ref<string | null>(null)
const successMsg = ref<string | null>(null)

// ── Media state ───────────────────────────────────────────────────────────────
interface ExistingMedia {
  id: string
  url: string
  type: string
  isBgMusic: boolean
}

interface NewMediaItem {
  preview: string
  file: File
  uploading: boolean
  result: { url: string; public_id: string; type: string } | null
}

const existingMedia = ref<ExistingMedia[]>([])
const removedMediaIds = ref<string[]>([])
const newMediaItems = ref<NewMediaItem[]>([])

const existingBgMusic = ref<ExistingMedia | null>(null)
const bgMusicRemoved = ref(false)
const newBgMusic = ref<{
  name: string
  file: File
  result: { url: string; public_id: string } | null
} | null>(null)
const bgMusicUploading = ref(false)

const visibleExistingMedia = computed(() =>
  existingMedia.value.filter((m) => !removedMediaIds.value.includes(m.id)),
)

const totalImageCount = computed(
  () => visibleExistingMedia.value.length + newMediaItems.value.length,
)

const currentCoverUrl = computed(
  () =>
    visibleExistingMedia.value[0]?.url ||
    newMediaItems.value[0]?.result?.url ||
    null,
)

const isAnyUploading = computed(
  () => newMediaItems.value.some((m) => m.uploading) || bgMusicUploading.value,
)

const onImagesSelected = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || []).slice(
    0,
    5 - totalImageCount.value,
  )
  input.value = ''

  for (const file of files) {
    const item: NewMediaItem = {
      preview: URL.createObjectURL(file),
      file,
      uploading: true,
      result: null,
    }
    newMediaItems.value.push(item)
    const idx = newMediaItems.value.length - 1

    try {
      const res = await uploadMedia({ file })
      if (newMediaItems.value[idx]) {
        newMediaItems.value[idx].result = res
        newMediaItems.value[idx].uploading = false
      }
    } catch {
      newMediaItems.value.splice(idx, 1)
    }
  }
}

const removeExistingMedia = (id: string) => {
  removedMediaIds.value.push(id)
}

const removeNewMedia = (i: number) => {
  const item = newMediaItems.value[i]
  if (item?.preview) URL.revokeObjectURL(item.preview)
  newMediaItems.value.splice(i, 1)
}

const onBgMusicSelected = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  newBgMusic.value = { name: file.name, file, result: null }
  bgMusicUploading.value = true

  try {
    const res = await uploadMedia({ file })
    if (newBgMusic.value) newBgMusic.value.result = res
  } catch {
    newBgMusic.value = null
  } finally {
    bgMusicUploading.value = false
  }
}

// ── Form state ────────────────────────────────────────────────────────────────
const form = reactive({
  title: '',
  description: '',
  price: 0,
  discount: 0,
  affiliateCommission: null as number | null,
  SKU: '',
  status: 'DRAFT' as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
  isFeatured: false,
  isThrift: false,
  isAccessory: false,
  categoryIds: [] as number[],
  tagNames: [] as string[],
  variants: [] as Array<{ size: string; price: number | null; stock: number }>,
  offers: [] as Array<{
    minQuantity: number | null
    discount: number | null
    label: string
  }>,
})

const socialCaptions = reactive({
  instagram: '',
  facebook: '',
  pinterest: '',
})

const categories = ref<Array<{ id: number; name: string; slug: string }>>([])
const categoriesLoading = ref(false)

const tagInput = ref('')
const addTag = () => {
  const tag = tagInput.value.trim().toLowerCase().replace(/,/g, '')
  if (tag && !form.tagNames.includes(tag) && form.tagNames.length < 10) {
    form.tagNames.push(tag)
  }
  tagInput.value = ''
}

const toggleCategory = (id: number) => {
  const idx = form.categoryIds.indexOf(id)
  if (idx === -1) form.categoryIds.push(id)
  else form.categoryIds.splice(idx, 1)
}

const addVariant = () => form.variants.push({ size: '', price: null, stock: 0 })
const removeVariant = (i: number) => form.variants.splice(i, 1)
const addOffer = () =>
  form.offers.push({ minQuantity: null, discount: null, label: '' })
const removeOffer = (i: number) => form.offers.splice(i, 1)

onMounted(async () => {
  categoriesLoading.value = true

  const [, catRes] = await Promise.allSettled([
    (async () => {
      try {
        // Fetch fresh from API — bypass cache for edit page
        const result: any = await productApi.getProductById(productId.value)
        const product = result.data
        if (product) {
          form.title = product.title || ''
          form.description = product.description || ''
          form.price = Number(product.price) || 0
          form.discount = Number(product.discount) || 0
          form.SKU = product.SKU || ''
          form.status = product.status || 'DRAFT'
          form.isFeatured = product.isFeatured ?? false
          form.isThrift = product.isThrift ?? false
          form.isAccessory = product.isAccessory ?? false
          form.affiliateCommission = product.affiliateCommission ?? null
          form.categoryIds = (product.category || []).map(
            (c: any) => c.category.id,
          )
          form.tagNames = (product.tags || [])
            .map((t: any) => t.tag?.name ?? t.name)
            .filter(Boolean)

          // Load existing media
          const allMedia: ExistingMedia[] = (product.media || []).map(
            (m: any) => ({
              id: m.id,
              url: m.url,
              type: m.type,
              isBgMusic: m.isBgMusic,
            }),
          )
          existingMedia.value = allMedia.filter((m) => !m.isBgMusic)
          existingBgMusic.value = allMedia.find((m) => m.isBgMusic) ?? null

          // Load variants
          form.variants = (product.variants || []).map((v: any) => ({
            size: v.size || '',
            price: v.price ?? null,
            stock: v.stock ?? 0,
          }))

          // Load offers
          form.offers = (product.offers || []).map((o: any) => ({
            minQuantity: o.minQuantity,
            discount: o.discount,
            label: o.label || '',
          }))

          // Load social captions
          const sc = product.socialCaptions as any
          if (sc) {
            socialCaptions.instagram = sc.instagram || ''
            socialCaptions.facebook = sc.facebook || ''
            socialCaptions.pinterest = sc.pinterest || ''
          }
        }
      } catch (e: any) {
        fetchError.value = e.message || 'Failed to load product'
      } finally {
        isFetching.value = false
      }
    })(),
    productApi.getCategories(),
  ])

  if (catRes.status === 'fulfilled')
    categories.value = (catRes.value as any).data || []
  categoriesLoading.value = false
})

const handleSubmit = async () => {
  successMsg.value = null
  try {
    const payload: any = {
      title: form.title,
      description: form.description,
      price: form.price,
      discount: form.discount,
      status: form.status,
      isFeatured: form.isFeatured,
      isThrift: form.isThrift,
      isAccessory: form.isAccessory,
    }

    if (form.SKU) payload.SKU = form.SKU
    payload.affiliateCommission =
      form.affiliateCommission && form.affiliateCommission > 0
        ? form.affiliateCommission
        : null
    payload.categoryIds = form.categoryIds
    payload.tagNames = form.tagNames

    // Variants (replace all)
    payload.variants = form.variants
      .filter((v) => v.size)
      .map((v) => ({
        size: v.size,
        price: v.price ?? undefined,
        stock: v.stock,
      }))

    // Offers (replace all)
    const validOffers = form.offers.filter(
      (o) =>
        o.minQuantity && o.minQuantity >= 2 && o.discount && o.discount > 0,
    )
    payload.offers = validOffers.map((o) => ({
      minQuantity: o.minQuantity!,
      discount: o.discount!,
      label: o.label || undefined,
    }))

    // New media to add
    const uploaded = newMediaItems.value.filter((m) => m.result)
    if (uploaded.length) {
      payload.mediaItems = uploaded.map((m) => ({
        url: m.result!.url,
        public_id: m.result!.public_id,
        type: m.result!.type || 'IMAGE',
      }))
    }

    // Existing media to remove
    if (removedMediaIds.value.length) {
      payload.removeMediaIds = removedMediaIds.value
    }

    // New bg music
    if (newBgMusic.value?.result) {
      payload.bgMusic = {
        url: newBgMusic.value.result.url,
        public_id: newBgMusic.value.result.public_id,
      }
    }

    // Remove existing bg music
    if (bgMusicRemoved.value && !newBgMusic.value) {
      payload.removeBgMusic = true
    }

    await updateProduct(productId.value, payload)
    successMsg.value = 'Product updated successfully!'
    setTimeout(() => {
      successMsg.value = null
    }, 3000)
  } catch {
    // error is reactive from composable
  }
}

// ── AI Magic on the Promote tab ───────────────────────────────────────────────
const isGeneratingAI = ref(false)

const fileToBase64 = (
  url: string,
): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((r) => r.blob())
      .then((blob) => {
        const reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onload = () => {
          const result = reader.result as string
          resolve({ base64: result.split(',')[1], mimeType: blob.type })
        }
        reader.onerror = reject
      })
      .catch(reject)
  })
}

const runAiMagic = async () => {
  if (!currentCoverUrl.value) return
  isGeneratingAI.value = true
  try {
    const { base64, mimeType } = await fileToBase64(currentCoverUrl.value)
    const response = await aiApi.generateListing(
      base64,
      mimeType,
      form.isThrift ? 'This is a thrift/vintage item.' : '',
    )

    if (response.success && response.data?.socialCaptions) {
      const sc = response.data.socialCaptions
      socialCaptions.instagram = sc.instagram || ''
      socialCaptions.facebook = sc.facebook || ''
      socialCaptions.pinterest = sc.pinterest || ''
      notify({
        type: 'success',
        text: '✨ Captions regenerated! Review and save.',
      })
    }
  } catch {
    notify({ type: 'error', text: 'AI generation failed. Please try again.' })
  } finally {
    isGeneratingAI.value = false
  }
}

const onCaptionsSaved = (captions: any) => {
  socialCaptions.instagram = captions.instagram
  socialCaptions.facebook = captions.facebook
  socialCaptions.pinterest = captions.pinterest
}
</script>
