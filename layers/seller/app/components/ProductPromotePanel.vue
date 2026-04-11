<template>
  <div
    class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-800"
  >
    <!-- Header -->
    <div
      class="border-b border-gray-100 px-4 pb-4 pt-5 sm:px-6 dark:border-neutral-700"
    >
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2
            class="flex items-center gap-2 font-semibold text-gray-900 dark:text-neutral-100"
          >
            <Icon
              name="mdi:rocket-launch-outline"
              size="20"
              class="text-brand"
            />
            Promote on Social Media
          </h2>
          <p class="mt-1 text-xs text-gray-500 dark:text-neutral-400">
            AI-written captions ready to copy. Direct posting coming soon.
          </p>
        </div>
        <!-- Regenerate button (visible when captions exist) -->
        <button
          v-if="hasCaptions && coverImageUrl"
          type="button"
          :disabled="isGenerating"
          @click="$emit('regenerate')"
          class="flex shrink-0 items-center gap-1.5 text-xs font-medium text-brand hover:text-brand/80 disabled:opacity-50"
        >
          <Icon
            :name="isGenerating ? 'eos-icons:loading' : 'mdi:refresh'"
            :class="{ 'animate-spin': isGenerating }"
            size="14"
          />
          {{ isGenerating ? 'Generating...' : 'Regenerate' }}
        </button>
      </div>

      <!-- Platform Tabs -->
      <div class="mt-4 flex gap-1">
        <button
          v-for="p in platforms"
          :key="p.id"
          type="button"
          @click="activeTab = p.id"
          :class="[
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
            activeTab === p.id
              ? 'bg-gray-900 text-white shadow-sm dark:bg-white dark:text-gray-900'
              : 'text-gray-500 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700',
          ]"
        >
          <Icon
            :name="p.icon"
            :class="activeTab === p.id ? '' : p.iconColor"
            size="14"
          />
          {{ p.label }}
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="space-y-4 px-4 py-5 sm:px-6">
      <template v-for="p in platforms" :key="p.id">
        <div v-show="activeTab === p.id">
          <!-- Empty state — no captions yet -->
          <div
            v-if="!captions[p.id as keyof typeof captions]"
            class="py-8 text-center"
          >
            <Icon
              :name="p.icon"
              size="36"
              :class="p.iconColor"
              class="mb-3 opacity-40"
            />
            <p class="mb-1 text-sm text-gray-500 dark:text-neutral-400">
              No {{ p.label }} caption yet
            </p>
            <p class="text-xs text-gray-400 dark:text-neutral-500">
              Upload a product image and click
              <span class="font-medium text-brand">Auto-Fill Form</span> to
              generate one.
            </p>
          </div>

          <template v-else>
            <!-- Caption editor -->
            <div>
              <div class="mb-1.5 flex items-center justify-between">
                <label
                  class="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-neutral-400"
                >
                  <Icon :name="p.icon" :class="p.iconColor" size="13" />
                  {{ p.label }} Caption
                </label>
                <span
                  class="text-[10px]"
                  :class="
                    charCount(p.id) > p.limit
                      ? 'text-red-500'
                      : 'text-gray-400 dark:text-neutral-500'
                  "
                >
                  {{ charCount(p.id) }} / {{ p.limit }}
                </span>
              </div>
              <textarea
                v-model="localCaptions[p.id as keyof typeof localCaptions]"
                :rows="p.rows"
                class="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm leading-relaxed text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
              />
            </div>

            <!-- Hashtag count (Instagram only) -->
            <p
              v-if="p.id === 'instagram'"
              class="-mt-2 text-[11px] text-gray-400 dark:text-neutral-500"
            >
              {{ hashtagCount }} hashtag{{ hashtagCount !== 1 ? 's' : '' }}
              detected
              <span v-if="hashtagCount < 20" class="text-amber-500"
                >&nbsp;— aim for 20+</span
              >
              <span v-else class="text-green-500">&nbsp;✓ good</span>
            </p>

            <!-- Action Row -->
            <div class="flex flex-col gap-2 pt-1 sm:flex-row">
              <!-- Phase 1: Copy button (LIVE) -->
              <button
                type="button"
                @click="copyCaption(p.id)"
                class="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                <Icon
                  :name="copied === p.id ? 'mdi:check' : 'mdi:content-copy'"
                  size="16"
                  :class="copied === p.id ? 'text-green-500' : ''"
                />
                {{ copied === p.id ? 'Copied!' : 'Copy Caption' }}
              </button>

              <!-- Phase 1: Open platform (LIVE) -->
              <a
                :href="p.openUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors"
                :class="p.openBtnClass"
              >
                <Icon :name="p.icon" size="16" />
                Open {{ p.label }}
                <Icon name="mdi:open-in-new" size="12" class="opacity-60" />
              </a>
            </div>

            <!-- Phase 2: Direct Publish (LOCKED — coming soon) -->
            <div
              class="mt-3 flex items-center justify-between gap-3 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 dark:border-neutral-700 dark:bg-neutral-900"
            >
              <div class="flex min-w-0 items-center gap-2">
                <Icon
                  :name="p.icon"
                  :class="p.iconColor"
                  size="16"
                  class="shrink-0"
                />
                <div class="min-w-0">
                  <p
                    class="truncate text-xs font-medium text-gray-700 dark:text-neutral-300"
                  >
                    Post directly to {{ p.label }}
                  </p>
                  <p class="text-[11px] text-gray-400 dark:text-neutral-500">
                    Connect your account to enable one-click publishing
                  </p>
                </div>
              </div>
              <span
                class="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              >
                <Icon name="mdi:lock-outline" size="10" />
                Soon
              </span>
            </div>
          </template>
        </div>
      </template>
    </div>

    <!-- Save captions footer -->
    <div v-if="hasCaptions && productId" class="px-4 pb-5 sm:px-6">
      <button
        type="button"
        :disabled="isSaving"
        @click="saveCaptions"
        class="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d81b36] disabled:opacity-50"
      >
        <Icon
          v-if="isSaving"
          name="eos-icons:loading"
          class="animate-spin"
          size="16"
        />
        <Icon v-else-if="savedOk" name="mdi:check-circle-outline" size="16" />
        <Icon v-else name="mdi:content-save-outline" size="16" />
        {{
          isSaving ? 'Saving...' : savedOk ? 'Captions Saved!' : 'Save Captions'
        }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProductApi } from '~~/layers/commerce/app/services/product.api'

interface SocialCaptions {
  instagram: string
  facebook: string
  pinterest: string
}

const props = defineProps<{
  productId?: number
  initialCaptions?: Partial<SocialCaptions>
  coverImageUrl?: string
  isGenerating?: boolean
}>()

const emit = defineEmits<{
  regenerate: []
  saved: [captions: SocialCaptions]
}>()

const platforms = [
  {
    id: 'instagram',
    label: 'Instagram',
    icon: 'mdi:instagram',
    iconColor: 'text-pink-500',
    rows: 8,
    limit: 2200,
    openUrl: 'https://www.instagram.com/',
    openBtnClass:
      'border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: 'mdi:facebook',
    iconColor: 'text-blue-600',
    rows: 5,
    limit: 63206,
    openUrl: 'https://www.facebook.com/',
    openBtnClass:
      'border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20',
  },
  {
    id: 'pinterest',
    label: 'Pinterest',
    icon: 'mdi:pinterest',
    iconColor: 'text-red-600',
    rows: 4,
    limit: 500,
    openUrl: 'https://www.pinterest.com/',
    openBtnClass:
      'border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
  },
]

const activeTab = ref<'instagram' | 'facebook' | 'pinterest'>('instagram')

const localCaptions = reactive<SocialCaptions>({
  instagram: props.initialCaptions?.instagram ?? '',
  facebook: props.initialCaptions?.facebook ?? '',
  pinterest: props.initialCaptions?.pinterest ?? '',
})

// Sync when parent updates initialCaptions (e.g., after AI regeneration)
watch(
  () => props.initialCaptions,
  (val) => {
    if (val?.instagram !== undefined) localCaptions.instagram = val.instagram
    if (val?.facebook !== undefined) localCaptions.facebook = val.facebook
    if (val?.pinterest !== undefined) localCaptions.pinterest = val.pinterest
  },
  { deep: true },
)

const hasCaptions = computed(
  () =>
    !!(
      localCaptions.instagram ||
      localCaptions.facebook ||
      localCaptions.pinterest
    ),
)

const charCount = (id: string) =>
  localCaptions[id as keyof SocialCaptions]?.length ?? 0

const hashtagCount = computed(
  () => (localCaptions.instagram.match(/#\w+/g) || []).length,
)

// Copy to clipboard
const copied = ref<string | null>(null)
const copyCaption = async (id: string) => {
  const text = localCaptions[id as keyof SocialCaptions]
  if (!text) return
  await navigator.clipboard.writeText(text)
  copied.value = id
  setTimeout(() => {
    copied.value = null
  }, 2000)
}

const productApi = useProductApi()

// Save captions to DB via PATCH
const isSaving = ref(false)
const savedOk = ref(false)

const saveCaptions = async () => {
  if (!props.productId) return
  isSaving.value = true
  savedOk.value = false
  try {
    await productApi.updateProduct(props.productId, {
      socialCaptions: { ...localCaptions },
    })
    savedOk.value = true
    emit('saved', { ...localCaptions })
    setTimeout(() => {
      savedOk.value = false
    }, 3000)
  } catch (err) {
    console.error('Failed to save captions', err)
  } finally {
    isSaving.value = false
  }
}
</script>
