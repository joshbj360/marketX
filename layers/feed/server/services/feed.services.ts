// server/layers/feed/services/feed.service.ts

/**
 * Feed Service
 * Aggregates Posts and Products for Home and Personalized feeds
 */

import { socialRepository } from '~~/layers/profile/server/repositories/social.repository'
import { postRepository } from '~~/layers/social/server/repositories/post.repository'
import type { IFeedOptions } from '../../../../layers/feed/app/types/feed.types'
import { normalizePost, normalizeProduct } from '../utils/feed.utils'

const PRODUCT_SELECT = {
  id: true,
  title: true,
  price: true,
  discount: true,
  slug: true,
  description: true,
  isThrift: true,
  isDeal: true,
  dealEndsAt: true,
  created_at: true,
  sellerId: true,
  affiliateCommission: true,
  media: {
    where: { isBgMusic: false },
    select: { id: true, url: true, type: true, isBgMusic: true, altText: true },
    take: 4,
  },
  seller: {
    select: { id: true, store_name: true, store_slug: true, store_logo: true },
  },
  variants: {
    select: { id: true, size: true, stock: true, price: true },
    take: 5,
  },
  _count: { select: { likes: true, comments: true } },
}

export const feedService = {
  /**
   * Get home feed — posts interleaved with premium showInFeed product cards (1 per 4 posts)
   */
  async getHomeFeed(options: IFeedOptions) {
    const { limit = 20, offset = 0 } = options

    // How many product slots fit in this page (1 per 4 posts)
    const productSlots = Math.floor(limit / 4)
    const postLimit = limit - productSlots
    const productOffset = Math.floor(offset / 4)

    const [posts, postTotal, products] = await Promise.all([
      postRepository.getPosts({
        take: postLimit,
        skip: offset,
        orderBy: { created_at: 'desc' },
      }),
      postRepository.count(),
      prisma.products.findMany({
        where: {
          status: 'PUBLISHED',
          showInFeed: true,
          seller: { isPremium: true },
        },
        select: PRODUCT_SELECT,
        orderBy: { created_at: 'desc' },
        take: productSlots || 1,
        skip: productOffset,
      }),
    ])

    const postItems = posts.map(normalizePost)
    const productItems = products.map((p: any) => normalizeProduct(p))

    // Interleave: after every 4 posts, inject 1 product card
    const items: typeof postItems = []
    let pi = 0
    let pri = 0
    while (pi < postItems.length) {
      for (let i = 0; i < 4 && pi < postItems.length; i++) {
        items.push(postItems[pi++])
      }
      if (pri < productItems.length) {
        items.push(productItems[pri++])
      }
    }

    return {
      items,
      meta: {
        total: postTotal,
        limit,
        offset,
        hasMore: offset + postLimit < postTotal,
      },
    }
  },

  /**
   * Get following feed (posts from followed users/sellers)
   */
  async getFollowingFeed(userId: string, options: IFeedOptions) {
    const { limit = 20, offset = 0 } = options

    // 1. Get followed entities (Users and Sellers)
    const follows = await socialRepository.getFollowing({
      userId,
      limit: 1000,
      offset: 0,
    })

    if (!follows || follows.length === 0) {
      return { items: [], meta: { total: 0, limit, offset, hasMore: false } }
    }

    // 2. Extract strictly the IDs for the query
    const followingIds = follows.map((f) => f.id)

    // 3. Fetch posts from those specific IDs
    // Note: We prioritize Posts for the following feed to keep it social
    const posts = await postRepository.getPostsByAuthorIds(followingIds, {
      take: limit,
      skip: offset,
    })
    const items = posts.map(normalizePost)

    return {
      items,
      meta: {
        total: posts.length,
        limit,
        offset,
        hasMore: items.length === limit,
      },
    }
  },

  /**
   * Utility to get combined total count
   */
  async getTotalCount() {
    try {
      return await postRepository.count()
    } catch {
      return 0
    }
  },
}
