<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex flex-col justify-end md:items-center md:justify-center"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="$emit('close')"
        />

        <!-- Sheet -->
        <div
          class="relative w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl md:max-w-sm md:rounded-2xl dark:bg-neutral-900"
        >
          <!-- Handle -->
          <div class="flex justify-center pb-1 pt-3 md:hidden">
            <div
              class="h-1 w-10 rounded-full bg-gray-200 dark:bg-neutral-700"
            />
          </div>

          <div class="px-5 pb-6 pt-3">
            <h3
              class="mb-4 text-center text-[15px] font-bold text-gray-900 dark:text-neutral-100"
            >
              Share
            </h3>

            <!-- Platform buttons -->
            <div class="mb-5 grid grid-cols-4 gap-3">
              <button
                v-for="p in platforms"
                :key="p.id"
                class="flex flex-col items-center gap-1.5 rounded-xl p-2 transition-colors hover:bg-gray-50 active:scale-95 dark:hover:bg-neutral-800"
                @click="share(p)"
              >
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-2xl"
                  :style="{ background: p.bg }"
                >
                  <Icon :name="p.icon" size="24" class="text-white" />
                </div>
                <span
                  class="text-[11px] font-medium text-gray-600 dark:text-neutral-400"
                  >{{ p.label }}</span
                >
              </button>
            </div>

            <!-- Copy link row -->
            <div
              class="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5 dark:bg-neutral-800"
            >
              <Icon
                name="mdi:link-variant"
                size="18"
                class="shrink-0 text-gray-400"
              />
              <span
                class="flex-1 truncate text-[12px] text-gray-600 dark:text-neutral-400"
                >{{ url }}</span
              >
              <button
                :class="
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-brand text-white hover:bg-[#d81b36]'
                "
                class="shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-bold transition-colors"
                @click="copyLink"
              >
                {{ copied ? 'Copied!' : 'Copy' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'
import { computed, ref } from 'vue'

const props = defineProps<{
  isOpen: boolean
  url: string
  title?: string
  text?: string
}>()

defineEmits(['close'])

const copied = ref(false)

const platforms = computed(() => [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: 'mdi:whatsapp',
    bg: '#25D366',
    href: `https://wa.me/?text=${encodeURIComponent((props.title ? props.title + '\n' : '') + props.url)}`,
  },
  {
    id: 'twitter',
    label: 'X / Twitter',
    icon: 'mdi:twitter',
    bg: '#000000',
    href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(props.title || '')}&url=${encodeURIComponent(props.url)}`,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: 'mdi:facebook',
    bg: '#1877F2',
    href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(props.url)}`,
  },
  {
    id: 'telegram',
    label: 'Telegram',
    icon: 'mdi:telegram',
    bg: '#229ED9',
    href: `https://t.me/share/url?url=${encodeURIComponent(props.url)}&text=${encodeURIComponent(props.title || '')}`,
  },
])

const share = (platform: { href: string }) => {
  window.open(platform.href, '_blank', 'noopener,width=600,height=500')
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(props.url)
    copied.value = true
    notify({ type: 'success', text: 'Link copied!' })
    setTimeout(() => {
      copied.value = false
    }, 2500)
  } catch {
    notify({ type: 'error', text: 'Could not copy link' })
  }
}
</script>

<style scoped>
.sheet-enter-active {
  transition:
    transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.2s ease;
}
.sheet-leave-active {
  transition:
    transform 0.2s ease,
    opacity 0.15s ease;
}
.sheet-enter-from,
.sheet-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
@media (min-width: 768px) {
  .sheet-enter-from,
  .sheet-leave-to {
    transform: scale(0.95);
  }
}
</style>
