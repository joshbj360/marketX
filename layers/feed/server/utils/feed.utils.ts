import type { IPost, IProduct } from '~~/layers/social/app/types/post.types'
import type { IFeedItem } from '../../../../layers/feed/app/types/feed.types'

/**
 * Normalize a post into feed item format
 */
export const normalizePost = (post: IPost): IFeedItem => {
  // Split content media from background music
  const allMedia = (post.media ?? []) as Array<any>
  const contentMedia = allMedia.filter((m) => !m.isBgMusic)
  const bgMusicItem = allMedia.find((m) => m.isBgMusic)
  const primaryMedia = contentMedia[0]

  return {
    id: post.id,
    type: 'POST',
    created_at: post.created_at,
    author: {
      id: post.authorId,
      username: post.author?.username || 'Unknown',
      avatar: post.author?.avatar,
      role: (post.author?.role as 'user' | 'seller' | 'admin') ?? 'user',
    },
    // Primary media (first content item, for legacy consumers)
    media: primaryMedia
      ? {
          id: primaryMedia.id,
          url: primaryMedia.url,
          type: primaryMedia.type as 'IMAGE' | 'VIDEO' | 'AUDIO',
        }
      : undefined,
    // All content media items
    mediaItems: contentMedia.map((m) => ({
      id: m.id,
      url: m.url,
      type: m.type as 'IMAGE' | 'VIDEO' | 'AUDIO',
    })),
    // Background music (altText stores the display filename)
    bgMusic: bgMusicItem
      ? {
          id: bgMusicItem.id,
          url: bgMusicItem.url,
          name: bgMusicItem.altText ?? undefined,
        }
      : undefined,
    caption: post.caption || '',
    content: post.content || null,
    contentType: post.contentType || 'COMMERCE',
    likeCount: post._count?.likes || 0,
    commentCount: post._count?.comments || 0,
    shareCount: post._count?.shares || 0,
    // taggedProducts from DB is ProductPostTag[] with nested .product — flatten to IProduct[]
    taggedProducts: (post.taggedProducts ?? [])
      .map((tag: any) => tag.product ?? tag)
      .filter(Boolean),
  }
}

/**
 * Normalize a product into feed item format
 */
export const normalizeProduct = (product: IProduct): IFeedItem => {
  const allMedia = (product.media ?? []) as Array<any>
  const isMusicItem = (m: any) => m.isBgMusic || m.type === 'AUDIO'
  const contentMedia = allMedia.filter((m) => !isMusicItem(m))
  const bgMusicItem = allMedia.find(isMusicItem)
  const primaryMedia = contentMedia[0]

  return {
    id: `product-${product.id}`,
    type: 'PRODUCT',
    created_at: product.created_at,
    author: {
      id: product.sellerId,
      username:
        product.seller?.store_name || product.seller?.store_slug || 'Unknown',
      avatar: product.seller?.store_logo || null || undefined,
      role: 'seller',
    },
    media: primaryMedia
      ? {
          id: primaryMedia.id,
          url: primaryMedia.url,
          type: primaryMedia.type === 'VIDEO' ? 'VIDEO' : 'IMAGE',
        }
      : undefined,
    // All content media (ReelItem uses this to find the VIDEO url)
    mediaItems: contentMedia.map((m) => ({
      id: m.id,
      url: m.url,
      type: m.type as 'IMAGE' | 'VIDEO' | 'AUDIO',
    })),
    bgMusic: bgMusicItem
      ? { id: bgMusicItem.id, url: bgMusicItem.url, name: bgMusicItem.altText ?? undefined }
      : undefined,
    caption: product.title,
    content: product.description,
    contentType: 'PRODUCT',
    likeCount: product._count?.likes || 0,
    commentCount: product._count?.comments || 0,
    shareCount: 0,
    taggedProducts: [],
    product: product,
  }
}

/**
 * Sort feed items by creation date (newest first)
 */
export const sortFeedItems = (items: IFeedItem[]): IFeedItem[] => {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    return dateB - dateA
  })
}

/**
 * Merge and deduplicate feed items
 */
export const mergeFeedItems = (
  existing: IFeedItem[],
  incoming: IFeedItem[],
): IFeedItem[] => {
  const itemMap = new Map<string, IFeedItem>()

  // Add existing items
  existing.forEach((item) => itemMap.set(item.id, item))

  // Add/overwrite with incoming items
  incoming.forEach((item) => itemMap.set(item.id, item))

  // Convert back to array and sort
  return sortFeedItems(Array.from(itemMap.values()))
}
