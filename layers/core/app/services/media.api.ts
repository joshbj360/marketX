/**
 * Media API Service
 * Uploads files directly to Cloudinary from the browser — no server proxy.
 * This avoids Vercel's 4.5 MB serverless function payload limit entirely.
 *
 * Cloudinary unsigned upload docs:
 *   https://cloudinary.com/documentation/upload_images#unsigned_upload
 */

import type {
  IUploadedMedia,
  ICloudinaryUploadResult,
  IMediaType,
} from '../types/media.types'
import { BaseApiClient } from './base.api'

function getCloudinaryResourceType(file: File): 'image' | 'video' | 'raw' {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'
  // Audio files — Cloudinary handles them under the 'video' resource type
  if (file.type.startsWith('audio/')) return 'video'
  return 'raw'
}

function mapResourceType(cloudinaryType: string, mimeType: string): IMediaType {
  if (mimeType.startsWith('audio/')) return 'AUDIO'
  if (cloudinaryType === 'video') return 'VIDEO'
  return 'IMAGE'
}

/**
 * Upload a single file directly to Cloudinary from the browser.
 * Accepts an optional onProgress callback (0–100) for progress bars.
 * Returns the same ICloudinaryUploadResult shape the rest of the app expects.
 */
export async function uploadToCloudinary(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<ICloudinaryUploadResult> {
  const config = useRuntimeConfig()
  const cloudName = config.public.cloudName
  const uploadPreset = config.public.cloudinaryUploadPreset

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary cloud name or upload preset is not configured')
  }

  const resourceType = getCloudinaryResourceType(file)
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText)
          resolve({
            url: data.secure_url,
            public_id: data.public_id,
            type: mapResourceType(data.resource_type, file.type),
          })
        } catch {
          reject(new Error('Failed to parse Cloudinary response'))
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText)
          reject(new Error(err?.error?.message ?? `Cloudinary upload failed (${xhr.status})`))
        } catch {
          reject(new Error(`Cloudinary upload failed (${xhr.status})`))
        }
      }
    })

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')))
    xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')))

    xhr.open('POST', uploadUrl)
    xhr.send(formData)
  })
}

export class MediaApiClient extends BaseApiClient {
  async upload(
    media: IUploadedMedia,
  ): Promise<{ data: ICloudinaryUploadResult }> {
    if (!media.file) throw new Error('File is required for upload')
    const result = await uploadToCloudinary(media.file)
    return { data: result }
  }

  async delete(
    mediaId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/media/${mediaId}`, {
      method: 'DELETE',
    })
  }
}

let instance: MediaApiClient | null = null
export const useMediaApi = () => {
  if (!instance) instance = new MediaApiClient()
  return instance
}
