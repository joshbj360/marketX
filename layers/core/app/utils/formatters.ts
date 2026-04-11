import type { Media as MediaModel } from '@prisma/client'

/**
 * Format a product price stored as a major NGN unit (e.g. 5000 → ₦5,000).
 * Product prices are NOT in kobo — do not divide by 100.
 */
const formatPrice = (price: number) => formatProductPrice(price, 'NGN')
const formatNumber = (num: number) => new Intl.NumberFormat().format(num)

/**
 * Generates a thumbnail URL for a given media item.
 * If the item is a video, it requests an image thumbnail from Cloudinary.
 * @param media The media object from your database.
 * @returns A URL for a static image thumbnail.
 */
const getMediaThumbnailUrl = (media?: MediaModel): string => {
  if (!media || !media.url) {
    return '/assets/images/men.png' // A fallback image
  }

  // If the media is a video, change the extension to .jpg
  // Cloudinary will automatically generate a thumbnail from the video.
  if (media.type === 'VIDEO') {
    const urlParts = media.url.split('.')
    urlParts.pop() // Remove the original extension (e.g., .mp4)
    return `${urlParts.join('.')}.jpg`
  }

  // If it's already an image, return the original URL.
  return media.url
}

const formatAvatarUrl = (
  username: string | null | undefined,
  gender: string = 'boy',
): string => {
  if (!username) {
    return `https://avatar.iran.liara.run/public/${gender}?username=user` // A fallback avatar image
  }
  return `https://avatar.iran.liara.run/public/${gender}?username=${username}`
}

export { formatPrice, formatNumber, getMediaThumbnailUrl, formatAvatarUrl }
