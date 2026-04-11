<!-- layers/map/app/components/MapBottomSheet.vue -->
<!-- Snapchat-style bottom sheet that slides up when a pin is tapped -->
<template>
  <!-- Collapsed peek bar (always visible when a seller is selected) -->
  <Transition name="sheet-in">
    <div
      v-if="seller"
      class="sheet-container"
      :class="{ expanded: isExpanded }"
    >
      <!-- Drag handle -->
      <div class="sheet-handle-area" @click="isExpanded = !isExpanded">
        <div class="sheet-handle" />
      </div>

      <!-- ── Peek view (always shown) ─────────────────────────────────── -->
      <div class="px-4 pb-3">
        <div class="flex items-center gap-3">
          <!-- Logo -->
          <div class="store-avatar">
            <img
              v-if="seller.store_logo"
              :src="seller.store_logo"
              :alt="seller.store_name ?? ''"
              class="h-full w-full rounded-xl object-cover"
            />
            <span v-else class="text-sm font-black text-white">
              {{ (seller.store_name ?? seller.store_slug ?? '?').slice(0, 2).toUpperCase() }}
            </span>
          </div>

          <!-- Name + meta -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5">
              <p class="truncate text-[15px] font-bold text-white">
                {{ seller.store_name || seller.store_slug }}
              </p>
              <Icon
                v-if="seller.is_verified"
                name="mdi:shield-check"
                size="14"
                class="shrink-0 text-blue-400"
              />
              <span
                v-if="seller.hasActiveDeal"
                class="shrink-0 rounded-full bg-brand px-1.5 py-0.5 text-[9px] font-black text-white"
              >DEAL</span>
            </div>
            <p class="text-[12px] text-white/60 flex flex-wrap items-center gap-1">
              <span>{{ seller.locationLabel || seller.city || 'Nearby' }} · {{ seller.distanceKm.toFixed(1) }}km</span>
              <span
                v-if="seller.isOpenNow"
                class="rounded-full bg-green-500/15 px-1.5 py-0.5 text-[9px] font-bold text-green-400"
              >Open{{ seller.closesAt ? ` · til ${seller.closesAt}` : '' }}</span>
              <span
                v-else-if="seller.businessHours"
                class="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold text-white/40"
              >Closed</span>
              <span
                v-if="!seller.isOnline && seller.lastSeenLabel"
                class="text-[10px] text-white/30"
              >· {{ seller.lastSeenLabel }}</span>
            </p>
          </div>

          <!-- CTA buttons -->
          <div class="flex shrink-0 gap-2">
            <NuxtLink
              :to="`/messages?seller=${seller.store_slug}`"
              class="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Message seller"
            >
              <Icon name="mdi:message-outline" size="18" />
            </NuxtLink>
            <NuxtLink
              :to="`/sellers/profile/${seller.store_slug}`"
              class="flex h-9 items-center justify-center rounded-full bg-brand px-4 text-[12px] font-bold text-white shadow-lg shadow-brand/30 transition hover:bg-brand/90"
            >
              Visit
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- ── Expanded view ─────────────────────────────────────────────── -->
      <div v-if="isExpanded" class="expanded-content">

        <!-- Loading preview -->
        <div v-if="loadingPreview" class="flex items-center justify-center py-8">
          <Icon name="mdi:loading" size="24" class="animate-spin text-white/40" />
        </div>

        <template v-else-if="preview">
          <!-- Stats row -->
          <div class="mx-4 mb-4 flex gap-3">
            <div class="stat-chip">
              <p class="stat-value">{{ preview.followerCount }}</p>
              <p class="stat-label">Followers</p>
            </div>
            <div class="stat-chip">
              <p class="stat-value">{{ preview.productCount }}</p>
              <p class="stat-label">Products</p>
            </div>
            <div v-if="preview.avgRating" class="stat-chip">
              <p class="stat-value flex items-center gap-1">
                <Icon name="mdi:star" size="12" class="text-amber-400" />
                {{ preview.avgRating.toFixed(1) }}
              </p>
              <p class="stat-label">Rating</p>
            </div>
            <div v-if="preview.hasActiveDeal" class="stat-chip border-brand/30 bg-brand/10">
              <p class="stat-value text-brand">Active</p>
              <p class="stat-label text-brand/70">Deal</p>
            </div>
          </div>

          <!-- Description -->
          <p
            v-if="preview.description"
            class="mx-4 mb-4 text-[13px] leading-relaxed text-white/60"
          >{{ preview.description }}</p>

          <!-- Top products -->
          <div v-if="preview.topProducts.length" class="mb-4">
            <p class="mb-2 px-4 text-[11px] font-bold uppercase tracking-wider text-white/40">
              Top Products
            </p>
            <div class="flex gap-2.5 overflow-x-auto px-4 pb-1 scrollbar-hide">
              <NuxtLink
                v-for="product in preview.topProducts"
                :key="product.id"
                :to="`/product/${product.id}`"
                class="group flex w-[100px] shrink-0 flex-col overflow-hidden rounded-xl bg-white/5"
              >
                <div class="relative aspect-square overflow-hidden bg-white/5">
                  <img
                    v-if="product.media?.[0]?.url"
                    :src="product.media[0].url"
                    :alt="product.title"
                    class="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div v-else class="flex h-full items-center justify-center">
                    <Icon name="mdi:image-outline" size="20" class="text-white/20" />
                  </div>
                </div>
                <div class="p-1.5">
                  <p class="line-clamp-1 text-[10px] text-white/70">{{ product.title }}</p>
                  <p class="text-[11px] font-bold text-brand">
                    {{ formatPrice(product.discount
                      ? Math.round(product.price * (1 - product.discount / 100))
                      : product.price)
                    }}
                  </p>
                </div>
              </NuxtLink>
            </div>
          </div>
        </template>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { IMapSeller, IMapSellerPreview } from '../types/map.types'

const props = defineProps<{
  seller: IMapSeller | null
  fetchPreview: (slug: string) => Promise<IMapSellerPreview | null>
}>()

const emit = defineEmits<{ close: [] }>()

const isExpanded = ref(false)
const preview = ref<IMapSellerPreview | null>(null)
const loadingPreview = ref(false)

const { formatPrice } = useCurrency()

// Fetch preview when expanded
watch(isExpanded, async (expanded) => {
  if (expanded && props.seller && !preview.value) {
    loadingPreview.value = true
    preview.value = await props.fetchPreview(props.seller.store_slug)
    loadingPreview.value = false
  }
})

// Reset when seller changes
watch(() => props.seller?.store_slug, () => {
  isExpanded.value = false
  preview.value = null
})
</script>

<style scoped>
/* ── Sheet container ─────────────────────────────────────────────────────── */
.sheet-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 40;
  background: rgba(15, 23, 42, 0.92);
  backdrop-filter: blur(20px);
  border-radius: 24px 24px 0 0;
  border-top: 1px solid rgba(255,255,255,0.08);
  transition: all 0.35s cubic-bezier(0.34, 1.4, 0.64, 1);
  max-height: 85dvh;
  overflow: hidden;
}

/* ── Drag handle ─────────────────────────────────────────────────────────── */
.sheet-handle-area {
  display: flex;
  justify-content: center;
  padding: 12px 0 8px;
  cursor: pointer;
}
.sheet-handle {
  width: 36px;
  height: 4px;
  border-radius: 9999px;
  background: rgba(255,255,255,0.2);
}

/* ── Store avatar ────────────────────────────────────────────────────────── */
.store-avatar {
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  border-radius: 12px;
  background: rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* ── Expanded content ────────────────────────────────────────────────────── */
.expanded-content {
  overflow-y: auto;
  max-height: calc(85dvh - 120px);
  padding-bottom: env(safe-area-inset-bottom, 16px);
}

/* ── Stat chips ──────────────────────────────────────────────────────────── */
.stat-chip {
  flex: 1;
  border-radius: 10px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  padding: 8px 10px;
  text-align: center;
}
.stat-value {
  font-size: 14px;
  font-weight: 800;
  color: white;
  line-height: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-label {
  font-size: 10px;
  color: rgba(255,255,255,0.4);
  margin-top: 2px;
  font-weight: 600;
}

/* ── Scrollbar hide ──────────────────────────────────────────────────────── */
.scrollbar-hide { scrollbar-width: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }

/* ── Transition ──────────────────────────────────────────────────────────── */
.sheet-in-enter-active {
  transition: transform 0.38s cubic-bezier(0.34, 1.4, 0.64, 1), opacity 0.25s ease;
}
.sheet-in-leave-active {
  transition: transform 0.28s ease-in, opacity 0.2s ease;
}
.sheet-in-enter-from,
.sheet-in-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
