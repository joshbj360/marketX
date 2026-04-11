/**
 * useSeo — centralised SEO for every page type.
 *
 * Rules:
 * - Every page calls one setter from this composable. No raw useSeoMeta in pages.
 * - Private/auth pages get robots: noindex automatically.
 * - Titles follow the pattern: "Page Title | MarketX"
 * - OG images fall back to /og-default.png when no specific image exists.
 *
 * Usage:
 *   const { setStorePage } = useSeo()
 *   setStorePage({ store_name: 'Kemi Fabrics', ... })
 */

export const useSeo = () => {
  const config = useRuntimeConfig()
  const siteName = (config.public.siteName as string) || BRAND.name
  const baseURL = (config.public.baseURL as string) || `https://${BRAND.domain}`
  const defaultImage = `${baseURL}/og-default.png`

  // ── Shared head defaults (call once in app.vue or a layout) ──────────────
  const defaults = () => {
    useHead({
      titleTemplate: (t) => (t ? `${t} | ${siteName}` : siteName),
      htmlAttrs: { lang: 'en' },
    })
    useSeoMeta({
      ogSiteName: siteName,
      ogType: 'website',
      ogLocale: 'en_US',
      twitterCard: 'summary_large_image',
      twitterSite: BRAND.twitterHandle,
    })
  }

  // ── Public pages ─────────────────────────────────────────────────────────

  const setHomePage = () => {
    const desc = `${siteName} — Discover stores near you, buy local, and sell to the world. The all-in-one platform for everyday business in Africa.`
    useSeoMeta({
      title: siteName,
      description: desc,
      ogTitle: `${siteName} — Your Business, Fully Alive`,
      ogDescription: desc,
      ogImage: defaultImage,
      ogUrl: baseURL,
      twitterTitle: `${siteName} — Your Business, Fully Alive`,
      twitterDescription: desc,
      twitterImage: defaultImage,
    })
  }

  const setDiscoverPage = () => {
    const desc = `Discover businesses, products, and stores from sellers across Africa on ${siteName}. Browse fashion, food, beauty, electronics and more.`
    useSeoMeta({
      title: 'Discover',
      description: desc,
      ogTitle: `Discover all you want | ${siteName}`,
      ogDescription: desc,
      ogImage: defaultImage,
      ogUrl: `${baseURL}/discover`,
    })
  }

  const setMapPage = () => {
    const desc = `Find stores and businesses near you on ${siteName}. Browse the map, see what's open, and shop without leaving your area.`
    useSeoMeta({
      title: 'Stores Near You',
      description: desc,
      ogTitle: `Stores Near You | ${siteName}`,
      ogDescription: desc,
      ogImage: defaultImage,
      ogUrl: `${baseURL}/map`,
    })
  }

  const setReelsPage = () => {
    const desc = `Watch product reels from sellers on ${siteName}. Discover and shop directly from short videos.`
    useSeoMeta({
      title: 'Reels',
      description: desc,
      ogTitle: `Reels | ${siteName}`,
      ogDescription: desc,
      ogImage: defaultImage,
      ogUrl: `${baseURL}/reels`,
    })
  }

  const setSellersPage = () => {
    const desc = `Browse all stores and businesses on ${siteName}. Follow your favourites and shop their latest products.`
    useSeoMeta({
      title: 'Discover Stores',
      description: desc,
      ogTitle: `Discover Stores | ${siteName}`,
      ogDescription: desc,
      ogImage: defaultImage,
      ogUrl: `${baseURL}/sellers`,
    })
  }

  const setThriftPage = () => {
    const desc = `Find pre-loved and thrift items at unbeatable prices on ${siteName}. Shop sustainably from sellers across Africa.`
    useSeoMeta({
      title: 'Thrift Market',
      description: desc,
      ogTitle: `Thrift Market | ${siteName}`,
      ogDescription: desc,
      ogImage: defaultImage,
      ogUrl: `${baseURL}/thrift`,
    })
  }

  const setCategoryPage = (name: string, slug: string) => {
    const desc = `Browse ${name} products from verified sellers on ${siteName}.`
    useSeoMeta({
      title: name,
      description: desc,
      ogTitle: `${name} | ${siteName}`,
      ogDescription: desc,
      ogUrl: `${baseURL}/category/${slug}`,
    })
  }

  // ── Store / seller pages ─────────────────────────────────────────────────

  const setStorePage = (seller: {
    store_name?: string | null
    store_description?: string | null
    store_logo?: string | null
    store_slug: string
    city?: string | null
    category?: string | null
  }) => {
    const name = seller.store_name || seller.store_slug
    const location = seller.city ? ` · ${seller.city}` : ''
    const category = seller.category ? ` ${seller.category} ` : ' '
    const desc =
      seller.store_description ||
      `Shop${category}products from ${name}${location} on ${siteName}. Verified seller with fast delivery.`
    useSeoMeta({
      title: name,
      description: desc,
      ogTitle: `${name} | ${siteName}`,
      ogDescription: desc,
      ogImage: seller.store_logo || defaultImage,
      ogUrl: `${baseURL}/sellers/profile/${seller.store_slug}`,
      ogType: 'profile',
    })
  }

  // Keep old name for backwards compat
  const setSellerProfilePage = setStorePage

  // ── User profile ─────────────────────────────────────────────────────────

  const setProfilePage = (profile: {
    username?: string | null
    bio?: string | null
    avatar?: string | null
  }) => {
    const name = profile.username || 'Profile'
    const desc = profile.bio || `Follow @${name} on ${siteName}.`
    useSeoMeta({
      title: `@${name}`,
      description: desc,
      ogTitle: `@${name} | ${siteName}`,
      ogDescription: desc,
      ogImage: profile.avatar || defaultImage,
      ogUrl: `${baseURL}/profile/${profile.username}`,
      ogType: 'profile',
    })
  }

  // ── Product pages ────────────────────────────────────────────────────────

  const setProductPage = (product: {
    title?: string
    description?: string | null
    imageUrl?: string | null
    slug?: string
    price?: number
    sellerName?: string
  }) => {
    const title = product.title || 'Product'
    const seller = product.sellerName ? ` by ${product.sellerName}` : ''
    const desc =
      product.description ||
      `Buy ${title}${seller} on ${siteName}. Fast delivery across Nigeria and worldwide shipping available.`
    useSeoMeta({
      title,
      description: desc,
      ogTitle: `${title} | ${siteName}`,
      ogDescription: desc,
      ogImage: product.imageUrl || defaultImage,
      ogUrl: product.slug ? `${baseURL}/product/${product.slug}` : undefined,
      ogType: 'product',
    })
  }

  // ── Auth pages (noindex) ─────────────────────────────────────────────────

  const setLoginPage = () => {
    useSeoMeta({
      title: 'Sign In',
      description: `Sign in to your ${siteName} account.`,
      robots: 'noindex',
    })
  }

  const setRegisterPage = () => {
    useSeoMeta({
      title: 'Create Account',
      description: `Join ${siteName} — create your free account and start buying or selling today.`,
      robots: 'noindex',
    })
  }

  // ── Private / dashboard pages (noindex) ──────────────────────────────────

  const setCheckoutPage = () => {
    useSeoMeta({
      title: 'Checkout',
      description: `Complete your order on ${siteName}.`,
      robots: 'noindex',
    })
  }

  const setOrdersPage = () => {
    useSeoMeta({
      title: 'My Orders',
      description: `View and track your orders on ${siteName}.`,
      robots: 'noindex',
    })
  }

  const setDashboardPage = (storeName?: string) => {
    useSeoMeta({
      title: storeName ? `${storeName} — Dashboard` : 'Seller Dashboard',
      description: `Manage your ${siteName} store.`,
      robots: 'noindex',
    })
  }

  const setInboxPage = () => {
    useSeoMeta({
      title: 'Business Inbox',
      description: `Your customer messages on ${siteName}.`,
      robots: 'noindex',
    })
  }

  const setSettingsPage = () => {
    useSeoMeta({
      title: 'Settings',
      description: `Manage your ${siteName} account settings.`,
      robots: 'noindex',
    })
  }

  // ── Static / legal pages ─────────────────────────────────────────────────

  const setAboutPage = () => {
    const desc = `Learn about ${siteName} — the all-in-one platform for everyday business in Africa. Our story, our mission, our team.`
    useSeoMeta({
      title: 'About Us',
      description: desc,
      ogTitle: `About ${siteName}`,
      ogDescription: desc,
      ogUrl: `${baseURL}/about`,
    })
  }

  const setHelpPage = () => {
    useSeoMeta({
      title: 'Help Centre',
      description: `Get help with buying, selling, orders, and payments on ${siteName}.`,
      ogTitle: `Help Centre | ${siteName}`,
      ogUrl: `${baseURL}/help`,
    })
  }

  const setPrivacyPage = () => {
    useSeoMeta({
      title: 'Privacy Policy',
      description: `Learn how ${siteName} collects, uses, and protects your personal data.`,
      ogTitle: `Privacy Policy | ${siteName}`,
      ogUrl: `${baseURL}/privacy`,
    })
  }

  const setTermsPage = () => {
    useSeoMeta({
      title: 'Terms of Service',
      description: `Read the terms and conditions governing use of the ${siteName} platform.`,
      ogTitle: `Terms of Service | ${siteName}`,
      ogUrl: `${baseURL}/terms`,
    })
  }

  return {
    defaults,
    // Public
    setHomePage,
    setDiscoverPage,
    setMapPage,
    setReelsPage,
    setSellersPage,
    setThriftPage,
    setCategoryPage,
    // Store / profile
    setStorePage,
    setSellerProfilePage,
    setProfilePage,
    // Product
    setProductPage,
    // Auth
    setLoginPage,
    setRegisterPage,
    // Dashboard / private
    setCheckoutPage,
    setOrdersPage,
    setDashboardPage,
    setInboxPage,
    setSettingsPage,
    // Static
    setAboutPage,
    setHelpPage,
    setPrivacyPage,
    setTermsPage,
  }
}
