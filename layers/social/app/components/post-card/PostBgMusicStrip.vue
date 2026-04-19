<template>
  <div class="pointer-events-none absolute inset-x-0 bottom-0 z-10">
    <!-- Soft gradient fade -->
    <div
      class="h-14 bg-gradient-to-t from-black/75 via-black/30 to-transparent"
    />
    <!-- Content row — pointer-events-auto so the pill is tappable -->
    <div
      class="pointer-events-auto flex cursor-pointer items-center gap-2.5 bg-gradient-to-r from-black/80 to-black/50 px-3 pb-3 pt-1"
      @click.stop="emit('toggle')"
    >
      <!-- Spinning vinyl disc -->
      <div class="vinyl-disc shrink-0" :class="{ spinning: playing }">
        <div class="vinyl-hole" />
      </div>
      <!-- Track name -->
      <div class="min-w-0 flex-1">
        <p
          class="mb-[3px] text-[9px] font-medium uppercase leading-none tracking-widest text-white/50"
        >
          <Icon name="mdi:music-note" size="9" class="-mt-0.5 inline" />
          {{ $t('music.backgroundMusic') }}
        </p>
        <div class="overflow-hidden">
          <!-- Duplicate text creates seamless loop -->
          <span
            v-if="shouldScrollMusic"
            class="marquee-text inline-block text-[11px] font-semibold leading-tight text-white"
          >
            {{ musicDisplayName }}&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;{{
              musicDisplayName
            }}
          </span>
          <span
            v-else
            class="block truncate text-[11px] font-semibold leading-tight text-white"
          >
            {{ musicDisplayName }}
          </span>
        </div>
      </div>
      <!-- Equalizer bars -->
      <div class="eq-bars shrink-0" :class="{ playing: playing }">
        <div class="eq-bar" style="--h: 40%; --d: 0s" />
        <div class="eq-bar" style="--h: 100%; --d: 0.12s" />
        <div class="eq-bar" style="--h: 65%; --d: 0.07s" />
        <div class="eq-bar" style="--h: 85%; --d: 0.18s" />
        <div class="eq-bar" style="--h: 50%; --d: 0.03s" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  bgMusic: { name?: string; url: string }
  playing: boolean
  soundEnabled: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
}>()

const musicDisplayName = computed(() => {
  const name = props.bgMusic?.name
  if (!name) return 'Background Music'
  return name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
})
const shouldScrollMusic = computed(() => musicDisplayName.value.length > 22)
</script>

<style scoped>
/* ── Vinyl disc ─────────────────────────────────────────────────── */
.vinyl-disc {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: conic-gradient(
    #1c1c1c 0deg,
    #333 45deg,
    #1c1c1c 90deg,
    #2a2a2a 135deg,
    #1c1c1c 180deg,
    #333 225deg,
    #1c1c1c 270deg,
    #2a2a2a 315deg,
    #1c1c1c 360deg
  );
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 0 0 3px rgba(244, 114, 182, 0.15),
    inset 0 0 8px rgba(0, 0, 0, 0.6);
}
.vinyl-disc.spinning {
  animation: vinylSpin 3s linear infinite;
}
.vinyl-hole {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 40%, #fb7185, #e11d48);
  box-shadow: 0 0 6px rgba(244, 114, 182, 0.9);
}

/* ── Equalizer bars ─────────────────────────────────────────────── */
.eq-bars {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 16px;
}
.eq-bar {
  width: 3px;
  height: var(--h);
  background: linear-gradient(to top, #f43f5e, #fb923c);
  border-radius: 2px;
  transition: height 0.4s ease;
}
.eq-bars.playing .eq-bar {
  animation: eqBounce 0.65s ease-in-out var(--d) infinite alternate;
}

/* ── Marquee text ───────────────────────────────────────────────── */
.marquee-text {
  animation: marquee 9s linear infinite;
  padding-right: 3rem;
}

/* ── Keyframes ──────────────────────────────────────────────────── */
@keyframes vinylSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes eqBounce {
  from {
    height: 18%;
  }
  to {
    height: var(--h);
  }
}
@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>
