<template>
  <Teleport to="body">
    <Transition name="upload-bar">
      <div
        v-if="active"
        class="upload-progress-bar pointer-events-none fixed left-0 right-0 top-0 z-[9999] h-[3px]"
        :style="{ '--progress': `${progress}%` }"
        role="progressbar"
        :aria-valuenow="progress"
        aria-valuemin="0"
        aria-valuemax="100"
      />
    </Transition>

    <!-- Upload toast (bottom-left on mobile, bottom-right on desktop) -->
    <Transition name="upload-toast">
      <div
        v-if="active"
        class="pointer-events-none fixed bottom-20 left-4 z-[9998] flex items-center gap-3 rounded-xl bg-neutral-900/90 px-4 py-2.5 shadow-xl backdrop-blur-md dark:bg-neutral-800/90 md:bottom-6 md:left-auto md:right-6"
      >
        <!-- Circular progress -->
        <svg width="22" height="22" viewBox="0 0 22 22" class="shrink-0 -rotate-90">
          <circle
            cx="11" cy="11" r="9"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            stroke-width="2.5"
          />
          <circle
            cx="11" cy="11" r="9"
            fill="none"
            stroke="#F43F5E"
            stroke-width="2.5"
            stroke-linecap="round"
            :stroke-dasharray="`${circumference}`"
            :stroke-dashoffset="`${circumference - (circumference * progress) / 100}`"
            style="transition: stroke-dashoffset 0.2s ease"
          />
        </svg>
        <div>
          <p class="text-[12px] font-semibold text-white">Uploading…</p>
          <p class="text-[11px] text-white/60">{{ progress }}%</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useUploadProgress } from '../composables/useMediaUpload'

const { active, progress } = useUploadProgress()

const circumference = 2 * Math.PI * 9 // r = 9
</script>

<style scoped>
/* Top progress bar */
.upload-progress-bar {
  background: linear-gradient(
    90deg,
    #f43f5e 0%,
    #a855f7 var(--progress, 0%),
    transparent var(--progress, 0%)
  );
  transition: --progress 0.15s ease;
}

/* Glow effect on the leading edge */
.upload-progress-bar::after {
  content: '';
  position: absolute;
  right: calc(100% - var(--progress, 0%));
  top: 0;
  width: 60px;
  height: 3px;
  background: radial-gradient(ellipse at right, rgba(244, 63, 94, 0.8), transparent);
  pointer-events: none;
}

/* Bar enter/leave */
.upload-bar-enter-active { transition: opacity 0.2s ease; }
.upload-bar-leave-active { transition: opacity 0.5s ease 0.2s; }
.upload-bar-enter-from,
.upload-bar-leave-to { opacity: 0; }

/* Toast enter/leave */
.upload-toast-enter-active { transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1); }
.upload-toast-leave-active { transition: all 0.2s ease; }
.upload-toast-enter-from { opacity: 0; transform: translateY(12px) scale(0.95); }
.upload-toast-leave-to { opacity: 0; transform: translateY(8px); }
</style>
