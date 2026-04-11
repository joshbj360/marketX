<template>
  <div
    class="relative w-full select-none overflow-hidden rounded-2xl"
    :class="compact ? 'px-4 py-3' : 'px-5 py-5'"
    :style="{
      background:
        'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    }"
  >
    <!-- Waveform bars (decorative) -->
    <div class="mb-3 flex h-10 items-center gap-[3px] px-1">
      <div
        v-for="(h, i) in bars"
        :key="i"
        class="flex-1 rounded-full transition-all duration-100"
        :style="{
          height: `${h}%`,
          background: barColor(i),
          opacity: played(i) ? 1 : 0.35,
        }"
      />
    </div>

    <!-- Controls row -->
    <div class="flex items-center gap-3">
      <!-- Play / Pause -->
      <button
        @click.stop="togglePlay"
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform active:scale-90"
        style="
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(8px);
        "
      >
        <Icon
          :name="isPlaying ? 'mdi:pause' : 'mdi:play'"
          size="22"
          class="text-white"
          :class="isPlaying ? '' : 'ml-0.5'"
        />
      </button>

      <!-- Progress + timestamps -->
      <div class="min-w-0 flex-1">
        <!-- Seek bar -->
        <div
          class="relative mb-1.5 h-1.5 cursor-pointer overflow-hidden rounded-full"
          style="background: rgba(255, 255, 255, 0.2)"
          @click.stop="seek"
          ref="progressBar"
        >
          <div
            class="absolute inset-y-0 left-0 rounded-full transition-all"
            style="background: linear-gradient(90deg, #f02c56, #ff9a3c)"
            :style="{ width: `${progress}%` }"
          />
        </div>
        <!-- Time -->
        <div
          class="flex justify-between text-[10px] font-medium"
          style="color: rgba(255, 255, 255, 0.6)"
        >
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>

      <!-- Volume / mute -->
      <button
        @click.stop="toggleMute"
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style="background: rgba(255, 255, 255, 0.1)"
      >
        <Icon
          :name="isMuted ? 'mdi:volume-off' : 'mdi:volume-high'"
          size="16"
          class="text-white"
        />
      </button>
    </div>

    <!-- Audio element (hidden) -->
    <audio
      ref="audioRef"
      :src="src"
      preload="metadata"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onMetadata"
      @ended="isPlaying = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

const props = defineProps<{ src: string; compact?: boolean }>()

const audioRef = ref<HTMLAudioElement | null>(null)
const progressBar = ref<HTMLElement | null>(null)
const isPlaying = ref(false)
const isMuted = ref(false)
const currentTime = ref(0)
const duration = ref(0)

// 40 decorative bars with pseudo-random heights
const bars = Array.from(
  { length: 40 },
  (_, i) =>
    20 + Math.abs(Math.sin(i * 1.3 + 0.5) * 60 + Math.cos(i * 0.7) * 20),
)

const progress = computed(() =>
  duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0,
)

const played = (i: number) => (i / bars.length) * 100 < progress.value

const barColor = (i: number) =>
  played(i) ? `hsl(${340 + i * 0.8}, 90%, 60%)` : 'rgba(255,255,255,0.5)'

const togglePlay = () => {
  if (!audioRef.value) return
  if (isPlaying.value) {
    audioRef.value.pause()
    isPlaying.value = false
  } else {
    audioRef.value.play()
    isPlaying.value = true
  }
}

const toggleMute = () => {
  if (!audioRef.value) return
  isMuted.value = !isMuted.value
  audioRef.value.muted = isMuted.value
}

const seek = (e: MouseEvent) => {
  if (!progressBar.value || !audioRef.value || !duration.value) return
  const rect = progressBar.value.getBoundingClientRect()
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  audioRef.value.currentTime = ratio * duration.value
}

const onTimeUpdate = () => {
  currentTime.value = audioRef.value?.currentTime ?? 0
}
const onMetadata = () => {
  duration.value = audioRef.value?.duration ?? 0
}

const formatTime = (s: number) => {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

onUnmounted(() => {
  audioRef.value?.pause()
})
</script>
