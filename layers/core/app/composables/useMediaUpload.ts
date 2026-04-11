/**
 * useMediaUpload
 * Shared composable for uploading files.
 * Includes client-side image compression before upload.
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
          // Keep original filename, change extension to .webp
          const name = file.name.replace(/\.[^.]+$/, '.webp')
          resolve(new File([blob], name, { type: 'image/webp' }))
        },
        'image/webp',
        quality,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(file) // fallback: upload original
    }

    img.src = objectUrl
  })
}

export const useMediaUpload = () => {
  const isUploading = ref(false)
  const uploadError = ref<string | null>(null)

  /**
   * Compress (images only) then upload directly to Cloudinary from the browser.
   * Accepts either a raw File or the legacy { file: File } shape.
   */
  const uploadMedia = async (input: File | { file?: File }): Promise<ICloudinaryUploadResult> => {
    const file = input instanceof File ? input : input.file
    if (!file) throw new Error('No file provided')
    isUploading.value = true
    uploadError.value = null

    try {
      const toUpload = await compressImage(file)
      return await uploadToCloudinary(toUpload)
    } catch (e: unknown) {
      const error = e as Error & { data?: { statusMessage?: string } }
      console.error('Upload failed:', error)
      const message =
        error?.data?.statusMessage || error?.message || 'Failed to upload media'
      uploadError.value = message
      throw new Error(message)
    } finally {
      isUploading.value = false
    }
  }

  const resetUpload = () => {
    isUploading.value = false
    uploadError.value = null
  }

  return {
    isUploading: computed(() => isUploading.value),
    uploadError: computed(() => uploadError.value),
    uploadMedia,
    resetUpload,
  }
}
