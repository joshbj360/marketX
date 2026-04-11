<template>
  <Teleport to="body">
    <Transition name="music-modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
        @click.self="$emit('close')"
      >
        <div
          class="relative flex h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:h-[82dvh] sm:rounded-3xl dark:bg-neutral-900"
        >
          <!-- Header -->
          <div
            class="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-neutral-800"
          >
            <div class="flex items-center gap-2.5">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-sm"
              >
                <Icon name="mdi:music-note" size="17" class="text-white" />
              </div>
              <h2
                class="text-[15px] font-bold text-gray-900 dark:text-neutral-100"
              >
                Background Music
              </h2>
            </div>
            <button
              class="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800"
              @click="$emit('close')"
            >
              <Icon name="mdi:close" size="20" />
            </button>
          </div>

          <!-- Tabs -->
          <div
            class="flex shrink-0 gap-0 border-b border-gray-100 px-5 dark:border-neutral-800"
          >
            <button
              v-for="tab in TABS"
              :key="tab.id"
              class="relative flex items-center gap-1.5 px-4 py-3 text-[13px] font-semibold transition-colors"
              :class="
                activeTab === tab.id
                  ? 'text-gray-900 dark:text-neutral-100'
                  : 'text-gray-400 dark:text-neutral-500'
              "
              @click="activeTab = tab.id"
            >
              <Icon :name="tab.icon" size="15" />
              {{ tab.label }}
              <span
                v-if="activeTab === tab.id"
                class="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
              />
            </button>
          </div>

          <!-- ── DISCOVER TAB ────────────────────────────────────────── -->
          <div
            v-if="activeTab === 'discover'"
            class="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <!-- Search -->
            <div class="px-4 pt-3">
              <div class="relative">
                <Icon
                  name="mdi:magnify"
                  size="17"
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search tracks, artists…"
                  class="w-full rounded-xl bg-gray-100 py-2.5 pl-9 pr-3 text-[13px] text-gray-900 placeholder-gray-400 focus:outline-none dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
                  @input="onSearchInput"
                />
              </div>
            </div>

            <!-- Genre pills -->
            <div
              class="flex shrink-0 gap-2 overflow-x-auto px-4 py-3 scrollbar-hide"
            >
              <button
                v-for="g in GENRES"
                :key="g.value"
                class="shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors"
                :class="
                  activeGenre === g.value
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                "
                @click="selectGenre(g.value)"
              >
                {{ g.label }}
              </button>
            </div>

            <!-- Track list -->
            <div class="flex-1 overflow-y-auto px-4 pb-4">
              <!-- Skeleton -->
              <div
                v-if="discoverLoading"
                class="space-y-3"
              >
                <div
                  v-for="i in 5"
                  :key="i"
                  class="flex items-center gap-3"
                >
                  <div
                    class="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-gray-200 dark:bg-neutral-800"
                  />
                  <div class="flex-1 space-y-1.5">
                    <div
                      class="h-3 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-neutral-800"
                    />
                    <div
                      class="h-2.5 w-1/2 animate-pulse rounded bg-gray-100 dark:bg-neutral-700"
                    />
                  </div>
                  <div
                    class="h-3 w-8 animate-pulse rounded bg-gray-100 dark:bg-neutral-700"
                  />
                </div>
              </div>

              <!-- Error -->
              <div
                v-else-if="discoverError"
                class="flex flex-col items-center gap-3 py-12 text-center"
              >
                <Icon
                  name="mdi:music-off"
                  size="40"
                  class="text-gray-300 dark:text-neutral-700"
                />
                <p class="text-sm text-gray-500 dark:text-neutral-400">
                  {{ discoverError }}
                </p>
                <button
                  class="text-xs font-semibold text-brand"
                  @click="loadTracks"
                >
                  Try again
                </button>
              </div>

              <!-- Empty -->
              <div
                v-else-if="tracks.length === 0 && !discoverLoading"
                class="flex flex-col items-center gap-3 py-12 text-center"
              >
                <Icon
                  name="mdi:music-note-off"
                  size="40"
                  class="text-gray-300 dark:text-neutral-700"
                />
                <p class="text-sm text-gray-500 dark:text-neutral-400">
                  No tracks found
                </p>
              </div>

              <!-- Tracks -->
              <div v-else class="space-y-1">
                <div
                  v-for="track in tracks"
                  :key="track.id"
                  class="group flex items-center gap-3 rounded-xl p-2.5 transition-colors"
                  :class="
                    selectedTrack?.id === track.id
                      ? 'bg-pink-50 dark:bg-pink-950/30'
                      : 'hover:bg-gray-50 dark:hover:bg-neutral-800/60'
                  "
                >
                  <!-- Album art / play button -->
                  <button
                    class="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-gray-200 dark:bg-neutral-700"
                    @click="togglePreviewTrack(track)"
                  >
                    <img
                      v-if="track.image"
                      :src="track.image"
                      class="h-full w-full object-cover"
                    />
                    <div
                      v-else
                      class="flex h-full w-full items-center justify-center"
                    >
                      <Icon
                        name="mdi:music"
                        size="20"
                        class="text-gray-400 dark:text-neutral-500"
                      />
                    </div>
                    <!-- Play overlay -->
                    <div
                      class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                      :class="{
                        'opacity-100': previewTrackId === track.id,
                      }"
                    >
                      <Icon
                        :name="
                          previewTrackId === track.id && isPreviewPlaying
                            ? 'mdi:pause'
                            : 'mdi:play'
                        "
                        size="20"
                        class="text-white"
                      />
                    </div>
                  </button>

                  <!-- Track info -->
                  <div class="min-w-0 flex-1">
                    <p
                      class="truncate text-[13px] font-semibold text-gray-900 dark:text-neutral-100"
                    >
                      {{ track.name }}
                    </p>
                    <p
                      class="truncate text-[11px] text-gray-400 dark:text-neutral-500"
                    >
                      {{ track.artist }}
                    </p>
                  </div>

                  <!-- Duration -->
                  <span
                    class="shrink-0 text-[11px] tabular-nums text-gray-400 dark:text-neutral-500"
                  >
                    {{ formatDuration(track.duration) }}
                  </span>

                  <!-- Use button -->
                  <button
                    class="shrink-0 rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors"
                    :class="
                      selectedTrack?.id === track.id
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-300'
                    "
                    @click="selectDiscoverTrack(track)"
                  >
                    {{ selectedTrack?.id === track.id ? '✓' : 'Use' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- ── UPLOAD TAB ──────────────────────────────────────────── -->
          <div
            v-else-if="activeTab === 'upload'"
            class="flex min-h-0 flex-1 flex-col overflow-y-auto p-4"
          >
            <!-- Drop zone -->
            <div
              v-if="!uploadedFile"
              class="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 py-14 transition-colors dark:border-neutral-700"
              :class="
                isDragging
                  ? 'border-pink-400 bg-pink-50 dark:border-pink-700 dark:bg-pink-950/20'
                  : 'hover:border-gray-300 dark:hover:border-neutral-600'
              "
              @click="fileInput?.click()"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="onDrop"
            >
              <div
                class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/15 to-purple-500/15"
              >
                <Icon
                  name="mdi:music-box-outline"
                  size="30"
                  class="text-pink-500"
                />
              </div>
              <div class="text-center">
                <p
                  class="text-sm font-semibold text-gray-800 dark:text-neutral-200"
                >
                  Drop an audio file here
                </p>
                <p class="mt-0.5 text-[12px] text-gray-400 dark:text-neutral-500">
                  or click to browse · MP3, WAV, AAC · max 20 MB
                </p>
              </div>
            </div>
            <input
              ref="fileInput"
              type="file"
              accept="audio/*"
              class="hidden"
              @change="onFileSelected"
            />

            <!-- Waveform + trim UI -->
            <div v-if="uploadedFile" class="space-y-4">
              <!-- File header -->
              <div
                class="flex items-center gap-2 rounded-xl border border-pink-100 bg-gradient-to-r from-pink-50 to-purple-50 px-3 py-2.5 dark:border-pink-900/30 dark:from-pink-950/20 dark:to-purple-950/20"
              >
                <div
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-purple-600"
                >
                  <Icon name="mdi:music-note" size="15" class="text-white" />
                </div>
                <p
                  class="min-w-0 flex-1 truncate text-[12px] font-semibold text-gray-900 dark:text-neutral-100"
                >
                  {{ uploadedFile.name }}
                </p>
                <button
                  class="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-neutral-300"
                  @click="clearUpload"
                >
                  <Icon name="mdi:close" size="16" />
                </button>
              </div>

              <!-- Waveform loading -->
              <div
                v-if="waveformLoading"
                class="flex h-20 items-center justify-center rounded-2xl bg-gray-100 dark:bg-neutral-800"
              >
                <Icon
                  name="eos-icons:loading"
                  size="24"
                  class="animate-spin text-pink-500"
                />
              </div>

              <!-- Waveform canvas + trim handles -->
              <div
                v-else-if="waveformData.length"
                ref="waveformContainer"
                class="relative h-20 select-none rounded-2xl bg-gray-50 dark:bg-neutral-800"
                @mousemove="onDragMove"
                @mouseup="onDragEnd"
                @touchmove.prevent="onDragMove"
                @touchend="onDragEnd"
              >
                <canvas
                  ref="waveformCanvas"
                  class="h-full w-full rounded-2xl"
                />

                <!-- Selected region tint -->
                <div
                  class="pointer-events-none absolute inset-y-0 rounded-2xl bg-gradient-to-r from-pink-400/20 to-purple-400/20"
                  :style="{
                    left: `${startRatio * 100}%`,
                    width: `${(endRatio - startRatio) * 100}%`,
                  }"
                />

                <!-- Start handle -->
                <div
                  class="absolute inset-y-0 z-10 flex cursor-ew-resize items-center"
                  :style="{ left: `${startRatio * 100}%` }"
                  @mousedown.prevent="startDrag('start')"
                  @touchstart.prevent="startDrag('start')"
                >
                  <div
                    class="h-full w-1 rounded-l-full bg-gradient-to-b from-pink-500 to-purple-600"
                  />
                  <div
                    class="-ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-md"
                  >
                    <Icon name="mdi:chevron-left" size="12" class="text-white" />
                  </div>
                </div>

                <!-- End handle -->
                <div
                  class="absolute inset-y-0 z-10 flex cursor-ew-resize items-center"
                  :style="{ left: `${endRatio * 100}%` }"
                  @mousedown.prevent="startDrag('end')"
                  @touchstart.prevent="startDrag('end')"
                >
                  <div
                    class="-mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-md"
                  >
                    <Icon name="mdi:chevron-right" size="12" class="text-white" />
                  </div>
                  <div
                    class="h-full w-1 rounded-r-full bg-gradient-to-b from-pink-500 to-purple-600"
                  />
                </div>

                <!-- Playhead -->
                <div
                  v-if="playheadRatio !== null"
                  class="pointer-events-none absolute inset-y-0 w-0.5 bg-white/80"
                  :style="{ left: `${playheadRatio * 100}%` }"
                />
              </div>

              <!-- Transport controls -->
              <div class="flex items-center gap-3">
                <button
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-sm transition-transform active:scale-95"
                  @click="toggleLocalPreview"
                >
                  <Icon
                    :name="isLocalPlaying ? 'mdi:pause' : 'mdi:play'"
                    size="20"
                  />
                </button>

                <div class="flex-1">
                  <div
                    class="flex items-center justify-between text-[12px] font-semibold text-gray-700 dark:text-neutral-300"
                  >
                    <span>{{ formatDuration(startTime) }}</span>
                    <span class="text-[11px] font-normal text-gray-400 dark:text-neutral-500">
                      {{ formatDuration(endTime - startTime) }} selected
                    </span>
                    <span>{{ formatDuration(endTime) }}</span>
                  </div>
                  <div
                    class="mt-1 h-1 overflow-hidden rounded-full bg-gray-200 dark:bg-neutral-700"
                  >
                    <div
                      class="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-600"
                      :style="{
                        marginLeft: `${startRatio * 100}%`,
                        width: `${(endRatio - startRatio) * 100}%`,
                      }"
                    />
                  </div>
                </div>
              </div>

              <p
                v-if="endTime - startTime > MAX_DURATION"
                class="text-[11px] font-semibold text-amber-500"
              >
                ⚠ Selection exceeds {{ MAX_DURATION }}s. It will be trimmed to
                {{ MAX_DURATION }}s from the start point.
              </p>

              <!-- Select as chosen -->
              <button
                class="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity"
                :class="selectedTrack?.source === 'upload' ? 'opacity-60' : ''"
                @click="selectUploadTrack"
              >
                {{
                  selectedTrack?.source === 'upload'
                    ? '✓ Selected'
                    : 'Use This Clip'
                }}
              </button>
            </div>
          </div>

          <!-- ── FOOTER ─────────────────────────────────────────────── -->
          <div
            class="shrink-0 border-t border-gray-100 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900"
            style="padding-bottom: max(0.75rem, env(safe-area-inset-bottom, 0px))"
          >
            <!-- Selected track preview -->
            <Transition name="selected-bar">
              <div
                v-if="selectedTrack"
                class="mb-3 flex items-center gap-2 rounded-xl border border-pink-100 bg-gradient-to-r from-pink-50 to-purple-50 px-3 py-2 dark:border-pink-900/30 dark:from-pink-950/20 dark:to-purple-950/20"
              >
                <Icon name="mdi:music-note" size="16" class="shrink-0 text-pink-500" />
                <span
                  class="min-w-0 flex-1 truncate text-[12px] font-semibold text-gray-900 dark:text-neutral-100"
                >
                  {{ selectedTrack.name }}
                  <span
                    v-if="selectedTrack.artist"
                    class="font-normal text-gray-400"
                  >
                    · {{ selectedTrack.artist }}
                  </span>
                </span>
                <span class="shrink-0 text-[11px] text-gray-400">
                  {{ formatDuration(selectedTrack.duration) }}
                </span>
                <button
                  class="text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-neutral-300"
                  @click="selectedTrack = null"
                >
                  <Icon name="mdi:close" size="14" />
                </button>
              </div>
            </Transition>

            <div class="flex gap-3">
              <button
                class="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                @click="$emit('close')"
              >
                Cancel
              </button>
              <button
                :disabled="!selectedTrack || isProcessing"
                class="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 py-2.5 text-sm font-bold text-white shadow-sm transition-all disabled:opacity-50"
                @click="confirmSelection"
              >
                <Icon
                  v-if="isProcessing"
                  name="eos-icons:loading"
                  size="16"
                  class="animate-spin"
                />
                <span>{{ isProcessing ? 'Processing…' : 'Use Music' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Hidden audio element for discover preview -->
        <audio
          ref="discoverAudio"
          class="hidden"
          @ended="isPreviewPlaying = false"
          @timeupdate="onDiscoverTimeUpdate"
        />
        <!-- Hidden audio for local preview -->
        <audio
          ref="localAudio"
          class="hidden"
          @ended="isLocalPlaying = false"
          @timeupdate="onLocalTimeUpdate"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'

// ── Types ──────────────────────────────────────────────────────────────────────
interface JamendoTrack {
  id: string
  name: string
  artist: string
  duration: number
  url: string
  downloadUrl: string
  image: string | null
  tags: string[]
}

export interface MusicSelection {
  name: string
  artist?: string
  duration: number
  file?: File       // local upload (caller uploads to Cloudinary)
  url?: string      // API track (ready-to-use URL)
  source: 'upload' | 'jamendo'
}

interface SelectedTrack {
  id: string
  name: string
  artist?: string
  duration: number
  source: 'upload' | 'jamendo'
  // jamendo only
  url?: string
  // upload only
  file?: File
}

// ── Props / emits ──────────────────────────────────────────────────────────────
defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{
  close: []
  select: [music: MusicSelection]
}>()

// ── Constants ──────────────────────────────────────────────────────────────────
const MAX_DURATION = 60 // seconds

const TABS = [
  { id: 'discover', label: 'Discover', icon: 'mdi:compass-outline' },
  { id: 'upload', label: 'Upload', icon: 'mdi:upload-outline' },
]

const GENRES = [
  { value: 'all', label: '✦ All' },
  { value: 'pop', label: 'Pop' },
  { value: 'hiphop', label: 'Hip-Hop' },
  { value: 'electronic', label: 'Electronic' },
  { value: 'ambient', label: 'Ambient' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'rock', label: 'Rock' },
  { value: 'classical', label: 'Classical' },
  { value: 'rnb', label: 'R&B' },
  { value: 'acoustic', label: 'Acoustic' },
]

// ── State ──────────────────────────────────────────────────────────────────────
const activeTab = ref<'discover' | 'upload'>('discover')
const selectedTrack = ref<SelectedTrack | null>(null)
const isProcessing = ref(false)

// Discover
const searchQuery = ref('')
const activeGenre = ref('all')
const tracks = ref<JamendoTrack[]>([])
const discoverLoading = ref(false)
const discoverError = ref<string | null>(null)
const previewTrackId = ref<string | null>(null)
const isPreviewPlaying = ref(false)
const discoverAudio = ref<HTMLAudioElement | null>(null)
let searchTimer: ReturnType<typeof setTimeout> | null = null

// Upload / waveform
const fileInput = ref<HTMLInputElement | null>(null)
const uploadedFile = ref<File | null>(null)
const waveformContainer = ref<HTMLElement | null>(null)
const waveformCanvas = ref<HTMLCanvasElement | null>(null)
const waveformData = ref<number[]>([])
const waveformLoading = ref(false)
const isDragging = ref(false)
const dragging = ref<'start' | 'end' | null>(null)
const startRatio = ref(0)
const endRatio = ref(1)
const totalDuration = ref(0)
const localAudio = ref<HTMLAudioElement | null>(null)
const isLocalPlaying = ref(false)
const playheadRatio = ref<number | null>(null)
const audioBuffer = ref<AudioBuffer | null>(null)

// ── Computed ───────────────────────────────────────────────────────────────────
const startTime = computed(() => startRatio.value * totalDuration.value)
const endTime = computed(() => endRatio.value * totalDuration.value)

// ── Discover methods ───────────────────────────────────────────────────────────
const loadTracks = async () => {
  discoverLoading.value = true
  discoverError.value = null
  try {
    const params: Record<string, any> = { limit: 20 }
    if (searchQuery.value) params.q = searchQuery.value
    if (activeGenre.value !== 'all') params.genre = activeGenre.value
    const res: any = await $fetch('/api/music/search', { query: params })
    tracks.value = res.data ?? []
  } catch (e: any) {
    discoverError.value =
      e?.data?.statusMessage ?? 'Could not load tracks. Check your internet connection.'
  } finally {
    discoverLoading.value = false
  }
}

const onSearchInput = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(loadTracks, 400)
}

const selectGenre = (genre: string) => {
  activeGenre.value = genre
  loadTracks()
}

const togglePreviewTrack = (track: JamendoTrack) => {
  if (!discoverAudio.value) return
  if (previewTrackId.value === track.id) {
    if (isPreviewPlaying.value) {
      discoverAudio.value.pause()
      isPreviewPlaying.value = false
    } else {
      discoverAudio.value.play()
      isPreviewPlaying.value = true
    }
  } else {
    discoverAudio.value.src = track.url
    discoverAudio.value.load()
    discoverAudio.value.play()
    previewTrackId.value = track.id
    isPreviewPlaying.value = true
  }
}

const onDiscoverTimeUpdate = () => {
  // nothing needed currently — could add seek bar later
}

const selectDiscoverTrack = (track: JamendoTrack) => {
  const duration = Math.min(track.duration, MAX_DURATION)
  if (selectedTrack.value?.id === track.id) {
    selectedTrack.value = null
  } else {
    selectedTrack.value = {
      id: `jamendo-${track.id}`,
      name: track.name,
      artist: track.artist,
      duration,
      source: 'jamendo',
      url: track.url,
    }
  }
}

// ── Upload / waveform methods ──────────────────────────────────────────────────
const onDrop = (e: DragEvent) => {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('audio/')) loadAudioFile(file)
}

const onFileSelected = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) loadAudioFile(file)
}

const loadAudioFile = async (file: File) => {
  uploadedFile.value = file
  waveformLoading.value = true
  startRatio.value = 0
  endRatio.value = 1
  selectedTrack.value = null

  try {
    const arrayBuffer = await file.arrayBuffer()
    const ctx = new AudioContext()
    const decoded = await ctx.decodeAudioData(arrayBuffer)
    audioBuffer.value = decoded
    totalDuration.value = decoded.duration

    // Cap end ratio so default selection is MAX_DURATION
    if (decoded.duration > MAX_DURATION) {
      endRatio.value = MAX_DURATION / decoded.duration
    }

    // Build waveform data (80 bars)
    const channel = decoded.getChannelData(0)
    const bars = 80
    const step = Math.floor(channel.length / bars)
    const data: number[] = []
    for (let i = 0; i < bars; i++) {
      let sum = 0
      for (let j = 0; j < step; j++) {
        sum += Math.abs(channel[i * step + j])
      }
      data.push(sum / step)
    }
    // Normalise
    const max = Math.max(...data, 0.01)
    waveformData.value = data.map((v) => v / max)

    await nextTick()
    drawWaveform()

    // Set local audio src for preview
    if (localAudio.value) {
      const url = URL.createObjectURL(file)
      localAudio.value.src = url
    }

    await ctx.close()
  } catch {
    waveformData.value = []
  } finally {
    waveformLoading.value = false
  }
}

const drawWaveform = () => {
  const canvas = waveformCanvas.value
  const container = waveformContainer.value
  if (!canvas || !container || !waveformData.value.length) return

  const dpr = window.devicePixelRatio || 1
  canvas.width = container.clientWidth * dpr
  canvas.height = container.clientHeight * dpr
  canvas.style.width = `${container.clientWidth}px`
  canvas.style.height = `${container.clientHeight}px`

  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)

  const W = container.clientWidth
  const H = container.clientHeight
  const bars = waveformData.value.length
  const barW = (W / bars) * 0.6
  const gap = (W / bars) * 0.4
  const midY = H / 2

  ctx.clearRect(0, 0, W, H)

  for (let i = 0; i < bars; i++) {
    const x = i * (barW + gap)
    const ratio = i / bars
    const isSelected = ratio >= startRatio.value && ratio <= endRatio.value
    const barH = Math.max(2, waveformData.value[i] * (H * 0.8))

    if (isSelected) {
      const grad = ctx.createLinearGradient(0, midY - barH / 2, 0, midY + barH / 2)
      grad.addColorStop(0, 'rgba(236, 72, 153, 0.9)')
      grad.addColorStop(1, 'rgba(147, 51, 234, 0.9)')
      ctx.fillStyle = grad
    } else {
      ctx.fillStyle = 'rgba(156, 163, 175, 0.35)'
    }

    ctx.beginPath()
    ctx.roundRect(x, midY - barH / 2, barW, barH, 2)
    ctx.fill()
  }
}

// Watch ratio changes to redraw
watch([startRatio, endRatio], drawWaveform)

// ── Trim drag ──────────────────────────────────────────────────────────────────
const startDrag = (handle: 'start' | 'end') => {
  dragging.value = handle
}

const onDragMove = (e: MouseEvent | TouchEvent) => {
  if (!dragging.value || !waveformContainer.value) return
  const rect = waveformContainer.value.getBoundingClientRect()
  const clientX =
    'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
  const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))

  if (dragging.value === 'start') {
    startRatio.value = Math.min(ratio, endRatio.value - 0.02)
  } else {
    endRatio.value = Math.max(ratio, startRatio.value + 0.02)
  }
}

const onDragEnd = () => {
  dragging.value = null
}

// ── Local audio preview ────────────────────────────────────────────────────────
const toggleLocalPreview = () => {
  const audio = localAudio.value
  if (!audio) return
  if (isLocalPlaying.value) {
    audio.pause()
    isLocalPlaying.value = false
  } else {
    audio.currentTime = startTime.value
    audio.play()
    isLocalPlaying.value = true
  }
}

const onLocalTimeUpdate = () => {
  const audio = localAudio.value
  if (!audio || !totalDuration.value) return
  playheadRatio.value = audio.currentTime / totalDuration.value

  // Stop at end trim point
  if (audio.currentTime >= endTime.value) {
    audio.pause()
    isLocalPlaying.value = false
    playheadRatio.value = null
  }
}

const selectUploadTrack = () => {
  if (!uploadedFile.value) return
  const duration = Math.min(endTime.value - startTime.value, MAX_DURATION)
  selectedTrack.value = {
    id: `upload-${uploadedFile.value.name}`,
    name: uploadedFile.value.name.replace(/\.[^.]+$/, ''),
    duration,
    source: 'upload',
    file: uploadedFile.value,
  }
}

const clearUpload = () => {
  uploadedFile.value = null
  waveformData.value = []
  audioBuffer.value = null
  isLocalPlaying.value = false
  playheadRatio.value = null
  if (selectedTrack.value?.source === 'upload') selectedTrack.value = null
  if (localAudio.value) {
    localAudio.value.pause()
    localAudio.value.src = ''
  }
  if (fileInput.value) fileInput.value.value = ''
}

// ── WAV encoder (browser-side audio crop) ─────────────────────────────────────
const cropAndEncode = (
  source: AudioBuffer,
  start: number,
  end: number,
): File => {
  const sampleRate = source.sampleRate
  const startSample = Math.floor(start * sampleRate)
  const endSample = Math.floor(Math.min(end, start + MAX_DURATION) * sampleRate)
  const frameCount = endSample - startSample
  const numCh = source.numberOfChannels

  // Build WAV
  const byteDepth = 2
  const dataSize = frameCount * numCh * byteDepth
  const buf = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buf)
  const write = (off: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i))
  }

  write(0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  write(8, 'WAVE')
  write(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, numCh, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * numCh * byteDepth, true)
  view.setUint16(32, numCh * byteDepth, true)
  view.setUint16(34, 16, true)
  write(36, 'data')
  view.setUint32(40, dataSize, true)

  let offset = 44
  for (let i = 0; i < frameCount; i++) {
    for (let ch = 0; ch < numCh; ch++) {
      const s = Math.max(-1, Math.min(1, source.getChannelData(ch)[startSample + i]))
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
      offset += 2
    }
  }

  return new File([buf], 'clip.wav', { type: 'audio/wav' })
}

// ── Confirm ────────────────────────────────────────────────────────────────────
const confirmSelection = async () => {
  if (!selectedTrack.value) return
  isProcessing.value = true

  try {
    const sel = selectedTrack.value

    if (sel.source === 'jamendo' && sel.url) {
      emit('select', {
        name: sel.name,
        artist: sel.artist,
        duration: sel.duration,
        url: sel.url,
        source: 'jamendo',
      })
    } else if (sel.source === 'upload' && uploadedFile.value && audioBuffer.value) {
      const croppedFile = cropAndEncode(
        audioBuffer.value,
        startTime.value,
        endTime.value,
      )
      emit('select', {
        name: sel.name,
        duration: sel.duration,
        file: croppedFile,
        source: 'upload',
      })
    }

    emit('close')
  } finally {
    isProcessing.value = false
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const formatDuration = (seconds: number) => {
  const s = Math.floor(seconds)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// ── Lifecycle ──────────────────────────────────────────────────────────────────
watch(
  () => activeTab.value,
  (tab) => {
    if (tab === 'discover' && tracks.value.length === 0) loadTracks()
  },
  { immediate: true },
)

onUnmounted(() => {
  discoverAudio.value?.pause()
  localAudio.value?.pause()
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<style scoped>
.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.music-modal-enter-active,
.music-modal-leave-active {
  transition: opacity 0.25s ease;
}
.music-modal-enter-from,
.music-modal-leave-to {
  opacity: 0;
}
.music-modal-enter-active > div,
.music-modal-leave-active > div {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.music-modal-enter-from > div,
.music-modal-leave-to > div {
  transform: translateY(40px) scale(0.97);
}

.selected-bar-enter-active,
.selected-bar-leave-active {
  transition: all 0.2s ease;
}
.selected-bar-enter-from,
.selected-bar-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
