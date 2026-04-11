/**
 * Build an optimised Cloudinary URL by injecting transformation parameters.
 *
 * Transforms applied:
 *  - w_<width>        resize to target width (proportional)
 *  - c_fill           crop mode so images fill the requested dimensions
 *  - f_auto           serve WebP/AVIF automatically based on browser support
 *  - q_auto:good      Cloudinary picks quality; "good" is best for mobile bandwidth
 *
 * Non-Cloudinary URLs are returned unchanged, so the helper is safe to call
 * on any URL including placeholders or external sources.
 */
export function cloudinaryUrl(
  url: string | null | undefined,
  opts: {
    width?: number
    height?: number
    crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'pad'
    quality?: 'auto' | 'auto:good' | 'auto:eco' | number
    format?: 'auto' | 'webp' | 'avif'
  } = {},
): string {
  if (!url) return ''
  if (!url.includes('cloudinary.com')) return url

  const uploadMarker = '/upload/'
  const idx = url.indexOf(uploadMarker)
  if (idx === -1) return url

  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto:good',
    format = 'auto',
  } = opts

  const parts: string[] = []
  if (width) parts.push(`w_${width}`)
  if (height) parts.push(`h_${height}`)
  if (width || height) parts.push(`c_${crop}`)
  parts.push(`f_${format}`)
  parts.push(`q_${quality}`)

  const transforms = parts.join(',')
  const before = url.slice(0, idx + uploadMarker.length)
  const after = url.slice(idx + uploadMarker.length)

  // Don't double-insert transforms if they're already present
  if (
    after.startsWith('w_') ||
    after.startsWith('f_') ||
    after.startsWith('q_')
  ) {
    return url
  }

  return `${before}${transforms}/${after}`
}

/** Preset: tiny square thumbnail for grid cards (mobile-first) */
export const imgThumb = (url: string | null | undefined) =>
  cloudinaryUrl(url, { width: 400, height: 400, crop: 'fill' })

/** Preset: feed/post image — wider but still compressed */
export const imgFeed = (url: string | null | undefined) =>
  cloudinaryUrl(url, { width: 720 })

/** Preset: small avatar */
export const imgAvatar = (url: string | null | undefined) =>
  cloudinaryUrl(url, { width: 96, height: 96, crop: 'fill' })

/** Preset: full-width modal/detail view */
export const imgDetail = (url: string | null | undefined) =>
  cloudinaryUrl(url, { width: 1080, quality: 'auto' })

/**
 * Derive a static poster/thumbnail from a Cloudinary video URL.
 * Seeks to 0.5 s and returns a compressed JPEG.
 * Non-Cloudinary URLs are returned unchanged.
 */
export function videoThumb(
  url: string | null | undefined,
  opts: { width?: number; height?: number } = { width: 400, height: 400 },
): string {
  if (!url) return ''
  if (!url.includes('cloudinary.com')) return url

  const uploadMarker = '/upload/'
  const idx = url.indexOf(uploadMarker)
  if (idx === -1) return url

  const before = url.slice(0, idx + uploadMarker.length)
  // Strip existing transforms
  let after = url.slice(idx + uploadMarker.length)
  // Remove any leading transform segment (contains commas or known prefixes)
  if (/^[a-z_,]+\//.test(after)) after = after.replace(/^[^/]+\//, '')

  const parts: string[] = ['so_0.5'] // seek to 0.5 s
  if (opts.width) parts.push(`w_${opts.width}`)
  if (opts.height) parts.push(`h_${opts.height}`)
  if (opts.width || opts.height) parts.push('c_fill')
  parts.push('f_jpg', 'q_auto:good')

  // Replace video extension with .jpg
  const withJpg = after.replace(/\.[^./]+$/, '.jpg')
  return `${before}${parts.join(',')}/${withJpg}`
}
