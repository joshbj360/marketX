// POST /api/media/upload - Upload media to Cloudinary (pure proxy, no DB write)

import { UserError } from '~~/layers/profile/server/types/user.types'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/aac',
  'audio/webm',
  'audio/x-m4a',
]
const MAX_SIZE_BYTES = 50 * 1024 * 1024 // 50MB

export default defineEventHandler(async (event) => {
  try {
    await requireAuth(event)

    const formData = await readMultipartFormData(event)
    if (!formData || formData.length === 0) {
      throw new UserError('NO_FILE', 'No file provided', 400)
    }

    const fileField = formData.find((f) => f.name === 'file')
    if (!fileField || !fileField.data) {
      throw new UserError('NO_FILE', 'No file field in form data', 400)
    }

    const mimeType = fileField.type || 'image/jpeg'
    if (!ALLOWED_TYPES.includes(mimeType)) {
      throw new UserError(
        'INVALID_TYPE',
        `File type ${mimeType} not allowed. Allowed: ${ALLOWED_TYPES.join(', ')}`,
        400,
      )
    }

    if (fileField.data.length > MAX_SIZE_BYTES) {
      throw new UserError('FILE_TOO_LARGE', 'File must be under 50MB', 400)
    }

    const config = useRuntimeConfig()
    const cloudName = config.public.cloudName
    const uploadPreset = config.public.cloudinaryUploadPreset

    if (!cloudName) {
      throw new UserError('CONFIG_ERROR', 'Cloudinary not configured', 500)
    }

    // Cloudinary uses 'video' resource type for both video and audio
    const isAudio = mimeType.startsWith('audio/')
    const resourceType =
      mimeType.startsWith('video/') || isAudio ? 'video' : 'image'
    const mediaType = isAudio
      ? 'AUDIO'
      : resourceType === 'video'
        ? 'VIDEO'
        : 'IMAGE'

    const uploadFormData = new FormData()
    const blob = new Blob([new Uint8Array(fileField.data)], { type: mimeType })
    uploadFormData.append('file', blob, fileField.filename || 'upload')
    uploadFormData.append('folder', 'reelshop')

    if (uploadPreset) {
      uploadFormData.append('upload_preset', uploadPreset)
    }

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`

    const cloudinaryApiKey = config.public.CloudinaryApiKey
    const cloudinaryApiSecret = config.private?.cloudinary?.apiSecret

    if (cloudinaryApiKey && cloudinaryApiSecret && !uploadPreset) {
      const timestamp = Math.round(Date.now() / 1000)
      uploadFormData.append('api_key', cloudinaryApiKey)
      uploadFormData.append('timestamp', timestamp.toString())
    }

    const uploadResult = await $fetch<{
      secure_url: string
      public_id: string
      resource_type: string
      format: string
      width?: number
      height?: number
      duration?: number
    }>(uploadUrl, {
      method: 'POST',
      body: uploadFormData,
    })

    // Return Cloudinary result — no DB write. Media is created atomically during post creation.
    return {
      success: true,
      data: {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        type: mediaType,
      },
    }
  } catch (error: any) {
    if (error instanceof UserError) {
      throw createError({
        statusCode: error.status,
        statusMessage: error.message,
      })
    }
    console.error('[Media Upload] Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to upload media',
    })
  }
})
