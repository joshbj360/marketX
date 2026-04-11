import { prisma } from './db'

const now = () => new Date()
const ONLINE_THRESHOLD_MS = 30 * 60 * 1000 // 30 min

// ── Helpers ───────────────────────────────────────────────────────────────────

function computeOpenStatus(
  businessHours: any,
  timezone: string,
): { isOpenNow: boolean; closesAt: string | null } {
  if (!businessHours) return { isOpenNow: false, closesAt: null }
  try {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    const parts = fmt.formatToParts(new Date())
    const day = (parts.find((p) => p.type === 'weekday')?.value ?? '').toLowerCase().slice(0, 3)
    const h = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10)
    const m = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0', 10)
    const dayHours = businessHours[day]
    if (!dayHours || dayHours.closed) return { isOpenNow: false, closesAt: null }
    const [oh, om] = (dayHours.open ?? '00:00').split(':').map(Number)
    const [ch, cm] = (dayHours.close ?? '00:00').split(':').map(Number)
    const nowMins = h * 60 + m
    if (nowMins >= oh * 60 + om && nowMins < ch * 60 + cm) {
      return { isOpenNow: true, closesAt: dayHours.close ?? null }
    }
    return { isOpenNow: false, closesAt: null }
  } catch {
    return { isOpenNow: false, closesAt: null }
  }
}

function computeLastSeenLabel(lastActiveAt: Date | null, isOnline: boolean): string | null {
  if (isOnline || !lastActiveAt) return null
  const diffMs = Date.now() - lastActiveAt.getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function mapSeller(s: any) {
  const nowMs = Date.now()
  const isOnline = s.lastActiveAt ? nowMs - s.lastActiveAt.getTime() < ONLINE_THRESHOLD_MS : false
  const { isOpenNow, closesAt } = computeOpenStatus(s.businessHours, s.timezone ?? 'Africa/Lagos')
  return {
    id: s.id,
    store_slug: s.store_slug,
    store_name: s.store_name,
    store_logo: s.store_logo,
    locationLabel: s.locationLabel,
    city: s.city,
    state: s.state,
    latitude: s.latitude!,
    longitude: s.longitude!,
    isPremium: s.isPremium,
    is_verified: s.is_verified,
    hasActiveDeal: s.products.length > 0,
    productCount: s._count.products,
    followerCount: s.followers_count,
    isOnline,
    isOpenNow,
    closesAt,
    lastSeenLabel: computeLastSeenLabel(s.lastActiveAt, isOnline),
    businessHours: s.businessHours ?? null,
  }
}

const BASE_SELECT = {
  id: true,
  store_slug: true,
  store_name: true,
  store_logo: true,
  locationLabel: true,
  city: true,
  state: true,
  latitude: true,
  longitude: true,
  isPremium: true,
  is_verified: true,
  followers_count: true,
  lastActiveAt: true,
  businessHours: true,
  timezone: true,
  _count: { select: { products: { where: { status: 'PUBLISHED' } } } },
} as const

// ── Repository ────────────────────────────────────────────────────────────────

export const mapRepository = {
  async getAllGeoSellers(categorySlug?: string) {
    const where: any = {
      is_active: true,
      hideLocation: false,
      latitude: { not: null },
      longitude: { not: null },
    }
    if (categorySlug) {
      where.products = {
        some: {
          status: 'PUBLISHED',
          category: { some: { category: { slug: categorySlug } } },
        },
      }
    }

    const sellers = await prisma.sellerProfile.findMany({
      where,
      select: {
        ...BASE_SELECT,
        products: {
          where: { status: 'PUBLISHED', isDeal: true, dealEndsAt: { gt: now() } },
          select: { id: true },
          take: 1,
        },
      },
    })

    return sellers.map(mapSeller)
  },

  async searchSellers(query: string) {
    const sellers = await prisma.sellerProfile.findMany({
      where: {
        is_active: true,
        hideLocation: false,
        latitude: { not: null },
        longitude: { not: null },
        OR: [
          { store_name: { contains: query, mode: 'insensitive' } },
          {
            products: {
              some: { status: 'PUBLISHED', title: { contains: query, mode: 'insensitive' } },
            },
          },
        ],
      },
      select: {
        ...BASE_SELECT,
        products: {
          where: { status: 'PUBLISHED', isDeal: true, dealEndsAt: { gt: now() } },
          select: { id: true },
          take: 1,
        },
      },
    })

    return sellers.map(mapSeller)
  },

  async getSellerPreview(storeSlug: string) {
    return prisma.sellerProfile.findUnique({
      where: { store_slug: storeSlug },
      select: {
        id: true,
        store_slug: true,
        store_name: true,
        store_logo: true,
        store_description: true,
        locationLabel: true,
        city: true,
        state: true,
        latitude: true,
        longitude: true,
        isPremium: true,
        is_verified: true,
        followers_count: true,
        lastActiveAt: true,
        businessHours: true,
        timezone: true,
        products: {
          where: { status: 'PUBLISHED' },
          orderBy: [{ isDeal: 'desc' }, { created_at: 'desc' }],
          take: 6,
          select: {
            id: true,
            title: true,
            price: true,
            discount: true,
            isDeal: true,
            dealEndsAt: true,
            media: {
              where: { isBgMusic: false },
              take: 1,
              select: { url: true },
            },
          },
        },
        _count: { select: { products: { where: { status: 'PUBLISHED' } } } },
      },
    })
  },
}
