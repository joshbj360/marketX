/**
 * useMediaUpload
 * Shared composable for uploading files.
 * Includes client-side image compression before upload, and XHR-based
 * progress tracking (per-upload and globally shared across all uploads).
 */

import { uploadToCloudinary } from '../services/media.api'
import type { ICloudinaryUploadResult } from '../types/media.types'

/**
 * Compress an image file using canvas before upload.
 * Skips GIFs and non-image files. Returns a WebP blob capped at maxPx on
 * the longest edge. Typical phone photo: 5 MB → 150–300 KB.
 */
export async function compressImage(
  file: File,
  maxPx = 1920,
  quality = 0.82,
): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file

  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Canvas toBlob failed'))
          const name = file.name.replace(/\.[^.]+$/, '.webp')
          resolve(new File([blob], name, { type: 'image/webp' }))
        },
        'image/webp',
        quality,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(file)
    }

    img.src = objectUrl
  })
}

// ── Global upload state (module-level singleton) ──────────────────────────────
// Shared across every useMediaUpload() call in the app so any component
// can render a global progress indicator.

let _nextId = 0
const _uploads = ref<Map<number, number>>(new Map()) // id → progress 0-100

export const useUploadProgress = () => {
  const active = computed(() => _uploads.value.size > 0)

  const progress = computed(() => {
    const values = [..._uploads.value.values()]
    if (!values.length) return 0
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
  })

  return { active, progress }
}

// ── Per-instance composable ───────────────────────────────────────────────────

export const useMediaUpload = () => {
  const isUploading = ref(false)
  const uploadError = ref<string | null>(null)
  const progress = ref(0) // 0-100 for current upload

  /** Warn if video is unexpectedly large before upload begins */
  const videoSizeWarning = ref<string | null>(null)

  /**
   * Try uploading once; on network failure retry up to `maxRetries` times
   * with a short back-off. Cloudinary uploads are idempotent via signed
   * requests so retrying is safe.
   */
  const uploadWithRetry = async (
    file: File,
    onProgress: (pct: number) => void,
    maxRetries = 2,
  ): Promise<ICloudinaryUploadResult> => {
    let lastError: unknown
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await uploadToCloudinary(file, onProgress)
      } catch (e: unknown) {
        lastError = e
        const isNetworkError =
          e instanceof TypeError ||
          (e as any)?.message?.toLowerCase().includes('network') ||
          (e as any)?.message?.toLowerCase().includes('failed to fetch')

        if (!isNetworkError || attempt === maxRetries) throw e

        // Exponential back-off: 1s, 2s, 4s …
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt))
      }
    }
    throw lastError
  }

  const uploadMedia = async (
    input: File | { file?: File },
    onProgress?: (pct: number) => void,
  ): Promise<ICloudinaryUploadResult> => {
    const file = input instanceof File ? input : input.file
    if (!file) throw new Error('No file provided')

    isUploading.value = true
    uploadError.value = null
    videoSizeWarning.value = null
    progress.value = 0

    // Video size warning — helps users on limited data understand what's coming
    if (file.type.startsWith('video/')) {
      const mb = file.size / 1024 / 1024
      if (mb > 100) {
        videoSizeWarning.value = `Large video (${mb.toFixed(0)} MB) — upload may be slow on mobile data`
      }
    }

    const id = _nextId++
    _uploads.value.set(id, 0)

    try {
      const toUpload = await compressImage(file) // no-op for video, compresses images

      const result = await uploadWithRetry(toUpload, (pct) => {
        progress.value = pct
        _uploads.value.set(id, pct)
        onProgress?.(pct)
      })

      progress.value = 100
      _uploads.value.set(id, 100)

      return result
    } catch (e: unknown) {
      const error = e as Error & { data?: { statusMessage?: string } }
      const message =
        error?.data?.statusMessage || error?.message || 'Failed to upload media'
      uploadError.value = message
      throw new Error(message)
    } finally {
      // Small delay so the bar briefly shows 100% before disappearing
      setTimeout(() => {
        _uploads.value.delete(id)
        isUploading.value = _uploads.value.size > 0
      }, 400)
      isUploading.value = false
    }
  }

  const resetUpload = () => {
    isUploading.value = false
    uploadError.value = null
    progress.value = 0
  }

  return {
    isUploading: computed(() => isUploading.value),
    uploadError: computed(() => uploadError.value),
    videoSizeWarning: computed(() => videoSizeWarning.value),
    progress: computed(() => progress.value),
    uploadMedia,
    resetUpload,
  }
}
