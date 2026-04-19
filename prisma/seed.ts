import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import argon2 from 'argon2'
import { randomUUID } from 'crypto'

config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const uuid = () => randomUUID()

// Real fashion image URLs from Unsplash (permanent CDN links)
const U = (id: string, w = 800, h?: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ''}&q=80`

// Curated fashion/African/Nigerian photo IDs from Unsplash
const IMGS = {
  // Women's dresses & fashion
  dress1: U('1583267702009-a325834bfa47'),
  dress2: U('1590794056226-f6a7c1b70d79'),
  dress3: U('1515886657613-9f3515b0c78f'),
  dress4: U('1469334031218-e382a71b716b'),
  dress5: U('1509631179647-0177331693ae'),
  // Ankara / African prints
  ankara1: U('1594938298603-3e70e6ccc4c3'),
  ankara2: U('1558618666-fcd25c85cd64'),
  ankara3: U('1607082348824-0a96f2a4b9da'),
  ankara4: U('1583744946564-b46b88d4b8d0'),
  // Men's fashion
  men1: U('1516257984-08fe4fad0f76'),
  men2: U('1551232864-3f0890e1777d'),
  men3: U('1490481651871-ab68de25d43d'),
  men4: U('1617137968427-85924c800a22'),
  // Shoes & sandals
  shoe1: U('1542291026-7eec264c27ff'),
  shoe2: U('1603808033176-9d134e8e5f2c'),
  shoe3: U('1525966222134-84e1f714d36c'),
  shoe4: U('1549298916-b41d501d3772'),
  // Bags
  bag1: U('1553062407-98eeb64c6a62'),
  bag2: U('1548036161-19d3b2bf5c44'),
  bag3: U('1584917865442-de89df76afd3'),
  // Jewelry & accessories
  jewel1: U('1599643478518-a784e5dc4c8f'),
  jewel2: U('1611085583191-a3b181a88401'),
  jewel3: U('1630019852942-f89202989a59'),
  // Beauty products
  beauty1: U('1556228720-195a672e8a03'),
  beauty2: U('1596462502278-27bfdc403348'),
  beauty3: U('1614325498208-f6b62b22c04e'),
  // Thrift / pre-loved
  thrift1: U('1558618666-fcd25c85cd64'),
  thrift2: U('1489987707849-2d0a0b8bcd1e'),
  thrift3: U('1472506753867-c45eed17a166'),
  // Avatars (people)
  av1: U('1531123897727-8f129e1688ce', 200, 200),
  av2: U('1507003211169-0a1dd7228f2d', 200, 200),
  av3: U('1494790108377-be9c29b29330', 200, 200),
  av4: U('1472099645785-5658abf4ff4e', 200, 200),
  av5: U('1517841905240-472988babdf9', 200, 200),
  av6: U('1524504388424-b2ef864c4cd5', 200, 200),
  av7: U('1500648767791-00dcc994a43e', 200, 200),
  av8: U('1534528741775-53994a69daeb', 200, 200),
  av9: U('1506794778202-cad84cf45f1d', 200, 200),
  av10: U('1488426862026-3ee34a7d66df', 200, 200),
  // Store logos & banners
  logo1: U('1441986300917-64674bd600d8', 200, 200),
  logo2: U('1558618666-fcd25c85cd64', 200, 200),
  logo3: U('1472099645785-5658abf4ff4e', 200, 200),
  logo4: U('1516257984-08fe4fad0f76', 200, 200),
  logo5: U('1596462502278-27bfdc403348', 200, 200),
  banner1: U('1441986300917-64674bd600d8', 1200, 400),
  banner2: U('1558618666-fcd25c85cd64', 1200, 400),
  banner3: U('1594938298603-3e70e6ccc4c3', 1200, 400),
  banner4: U('1515886657613-9f3515b0c78f', 1200, 400),
  banner5: U('1556228720-195a672e8a03', 1200, 400),
  // Story portraits (9:16 crops)
  story1: U('1583267702009-a325834bfa47', 600, 1067),
  story2: U('1594938298603-3e70e6ccc4c3', 600, 1067),
  story3: U('1558618666-fcd25c85cd64', 600, 1067),
  story4: U('1516257984-08fe4fad0f76', 600, 1067),
  story5: U('1599643478518-a784e5dc4c8f', 600, 1067),
  story6: U('1515886657613-9f3515b0c78f', 600, 1067),
  story7: U('1607082348824-0a96f2a4b9da', 600, 1067),
  story8: U('1556228720-195a672e8a03', 600, 1067),
}

// Sample video (public)
const SAMPLE_VIDEO =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
const SAMPLE_AUDIO =
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'

async function main() {
  console.log('🌱 Seeding database…\n')

  // ── 0. Categories ─────────────────────────────────────────────────────────
  const CAT_DATA = [
    {
      name: "Women's Fashion",
      slug: 'womens-fashion',
      thumbnailCatUrl: IMGS.dress1,
    },
    { name: "Men's Fashion", slug: 'mens-fashion', thumbnailCatUrl: IMGS.men1 },
    { name: 'Footwear', slug: 'footwear', thumbnailCatUrl: IMGS.shoe1 },
    {
      name: 'Bags & Luggage',
      slug: 'bags-luggage',
      thumbnailCatUrl: IMGS.bag1,
    },
    { name: 'Accessories', slug: 'accessories', thumbnailCatUrl: IMGS.jewel1 },
    {
      name: 'Beauty & Care',
      slug: 'beauty-care',
      thumbnailCatUrl: IMGS.beauty1,
    },
    {
      name: 'Jewelry & Watches',
      slug: 'jewelry-watches',
      thumbnailCatUrl: IMGS.jewel2,
    },
    { name: 'Kids & Baby', slug: 'kids-baby', thumbnailCatUrl: IMGS.dress3 },
    {
      name: 'Sports & Active',
      slug: 'sports-active',
      thumbnailCatUrl: IMGS.men3,
    },
    {
      name: 'Nigerian Heritage',
      slug: 'nigerian-heritage',
      thumbnailCatUrl: IMGS.ankara1,
    },
    {
      name: 'Thrift & Pre-loved',
      slug: 'thrift-pre-loved',
      thumbnailCatUrl: IMGS.thrift1,
    },
    {
      name: 'Home & Living',
      slug: 'home-living',
      thumbnailCatUrl: IMGS.beauty2,
    },
  ]

  for (const c of CAT_DATA) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, thumbnailCatUrl: c.thumbnailCatUrl },
      create: c,
    })
  }
  const catMap = Object.fromEntries(
    (await prisma.category.findMany({ select: { id: true, slug: true } })).map(
      (c) => [c.slug, c.id],
    ),
  )
  console.log('✅ Categories (12)')

  // ── 1. Profiles ───────────────────────────────────────────────────────────
  const pwHash = await argon2.hash('test1234')

  const PROFILES = [
    // Sellers
    {
      email: 'ada@peppr.test',
      username: 'ada_styles',
      avatar: IMGS.av1,
      bio: 'Fashion seller & creator 🛍️ Lagos Island | DM to order',
      role: 'seller',
    },
    {
      email: 'amara@peppr.test',
      username: 'amara_couture',
      avatar: IMGS.av3,
      bio: "Abuja's finest womenswear 👗 Custom designs & ready-to-wear",
      role: 'seller',
    },
    {
      email: 'kene@peppr.test',
      username: 'kene_threads',
      avatar: IMGS.av2,
      bio: 'Premium menswear Lagos 🧔🏾 Agbada | Ankara | Streetwear',
      role: 'seller',
    },
    {
      email: 'funmi@peppr.test',
      username: 'funmi_thrift',
      avatar: IMGS.av5,
      bio: 'Thrift plug for designer finds 🏷️ Yaba | Lagos | Ship nationwide',
      role: 'seller',
    },
    {
      email: 'temi@peppr.test',
      username: 'temi_beauty',
      avatar: IMGS.av6,
      bio: 'Natural Nigerian beauty 🌿 Shea | Adire | Handmade jewels',
      role: 'seller',
    },
    // Buyers / creators
    {
      email: 'chidi@peppr.test',
      username: 'chidi_m',
      avatar: IMGS.av4,
      bio: 'Lagos fashion lover 🔥 Street style & culture',
      role: 'buyer',
    },
    {
      email: 'sade@peppr.test',
      username: 'sade_vibes',
      avatar: IMGS.av7,
      bio: 'Asoebi goals ✨ Lagos | PHC | Abuja',
      role: 'buyer',
    },
    {
      email: 'emeka@peppr.test',
      username: 'emeka_fits',
      avatar: IMGS.av8,
      bio: 'Naija street style 🇳🇬 Agbada on weekends',
      role: 'buyer',
    },
    {
      email: 'ngozi@peppr.test',
      username: 'ngozi_nneka',
      avatar: IMGS.av9,
      bio: 'Entrepreneur | Style | Inspiration 💫',
      role: 'buyer',
    },
    {
      email: 'bayo@peppr.test',
      username: 'bayo_cold',
      avatar: IMGS.av10,
      bio: 'Cold guy energy 🥶 Fashion & music',
      role: 'buyer',
    },
  ]

  const profiles: Record<string, any> = {}
  for (const p of PROFILES) {
    const existing = await prisma.profile.findUnique({
      where: { email: p.email },
    })
    if (existing) {
      profiles[p.username] = existing
      continue
    }
    profiles[p.username] = await prisma.profile.create({
      data: {
        id: uuid(),
        email: p.email,
        username: p.username,
        password_hash: pwHash,
        avatar: p.avatar,
        bio: p.bio,
        email_verified: true,
        email_verified_at: new Date(),
      },
    })
  }
  console.log('✅ Profiles (10)')

  // ── 2. Seller Profiles ────────────────────────────────────────────────────
  const SELLERS_DATA = [
    {
      profileKey: 'ada_styles',
      slug: 'ada-styles',
      name: 'Ada Styles',
      desc: 'Premium Nigerian fashion — womenswear, menswear, accessories & thrift finds. Based Lagos Island.',
      logo: IMGS.logo1,
      banner: IMGS.banner1,
      verified: true,
    },
    {
      profileKey: 'amara_couture',
      slug: 'amara-couture',
      name: 'Amara Couture',
      desc: "Abuja's finest womenswear. Custom Ankara, Aso-oke sets, and ready-to-wear designs. Free alterations.",
      logo: IMGS.logo2,
      banner: IMGS.banner2,
      verified: true,
    },
    {
      profileKey: 'kene_threads',
      slug: 'kene-threads',
      name: 'Kene Threads',
      desc: 'Lagos menswear specialists. Agbada, Ankara shirts, Kaftan, streetwear. Ship nationwide.',
      logo: IMGS.logo4,
      banner: IMGS.banner3,
      verified: false,
    },
    {
      profileKey: 'funmi_thrift',
      slug: 'funmi-thrift-hub',
      name: "Funmi's Thrift Hub",
      desc: 'Grade A thrift clothing sourced from UK, US & Canada. Designer finds at Naija prices. Yaba, Lagos.',
      logo: IMGS.logo3,
      banner: IMGS.banner4,
      verified: false,
    },
    {
      profileKey: 'temi_beauty',
      slug: 'temi-beauty',
      name: 'Temi Beauty',
      desc: 'All-natural Nigerian beauty. Raw shea butter, black soap, Adire accessories & handmade beaded jewelry.',
      logo: IMGS.logo5,
      banner: IMGS.banner5,
      verified: true,
    },
  ]

  const sellers: Record<string, any> = {}
  for (const s of SELLERS_DATA) {
    const profile = profiles[s.profileKey]
    const existing = await prisma.sellerProfile.findUnique({
      where: { store_slug: s.slug },
    })
    if (existing) {
      sellers[s.slug] = existing
      continue
    }
    sellers[s.slug] = await prisma.sellerProfile.create({
      data: {
        profileId: profile.id,
        store_slug: s.slug,
        store_name: s.name,
        store_description: s.desc,
        store_logo: s.logo,
        store_banner: s.banner,
        is_verified: s.verified,
        is_active: true,
        verification_status: s.verified ? 'VERIFIED' : 'PENDING',
        default_currency: 'NGN',
        followers_count: Math.floor(Math.random() * 3000) + 200,
      },
    })
  }
  console.log('✅ Seller profiles (5)')

  // ── 3. Products ───────────────────────────────────────────────────────────
  const makeProduct = async (data: {
    title: string
    slug: string
    description: string
    price: number
    discount?: number
    isFeatured?: boolean
    isThrift?: boolean
    isAccessory?: boolean
    affiliateCommission?: number
    categoryIds: number[]
    images: string[]
    video?: string
    bgMusic?: string
    variants: { size: string; stock: number; price?: number }[]
    sellerSlug: string
  }) => {
    if (await prisma.products.findUnique({ where: { slug: data.slug } }))
      return null
    const seller = sellers[data.sellerSlug]
    const sellerProfile =
      profiles[SELLERS_DATA.find((s) => s.slug === data.sellerSlug)!.profileKey]
    const mediaCreate: any[] = data.images.map((url, i) => ({
      url,
      public_id: `seed/${data.slug}-img${i}`,
      type: 'IMAGE',
      isBgMusic: false,
      authorId: sellerProfile.id,
    }))
    if (data.video)
      mediaCreate.push({
        url: data.video,
        public_id: `seed/${data.slug}-video`,
        type: 'VIDEO',
        isBgMusic: false,
        authorId: sellerProfile.id,
      })
    if (data.bgMusic)
      mediaCreate.push({
        url: data.bgMusic,
        public_id: `seed/${data.slug}-music`,
        type: 'AUDIO',
        isBgMusic: true,
        authorId: sellerProfile.id,
      })

    return prisma.products.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        price: data.price,
        discount: data.discount ?? 0,
        status: 'PUBLISHED' as any,
        isFeatured: data.isFeatured ?? false,
        isThrift: data.isThrift ?? false,
        isAccessory: data.isAccessory ?? false,
        affiliateCommission: data.affiliateCommission,
        bannerImageUrl: data.images[0],
        sellerId: seller.id,
        store_slug: seller.store_slug,
        variants: { create: data.variants },
        media: { create: mediaCreate },
        category: {
          create: data.categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
    })
  }

  const W = 'womens-fashion',
    M = 'mens-fashion',
    F = 'footwear',
    B = 'bags-luggage'
  const A = 'accessories',
    BT = 'beauty-care',
    J = 'jewelry-watches'
  const NH = 'nigerian-heritage',
    TH = 'thrift-pre-loved'

  const products: any[] = []

  // ── ADA STYLES ─────────────────────────────────────────────────────────────
  products.push(
    await makeProduct({
      title: 'Adire Tie-Dye Maxi Dress',
      slug: 'adire-tie-dye-maxi-dress',
      description:
        'Handcrafted Adire fabric maxi dress made by Yoruba artisans in Abeokuta, Ogun State. Each piece is unique — no two are identical. 100% cotton, breathable and perfect for the Lagos heat. Hand-wash recommended.',
      price: 22000,
      discount: 0,
      isFeatured: true,
      affiliateCommission: 2000,
      categoryIds: [catMap[W], catMap[NH]],
      images: [IMGS.ankara2, IMGS.ankara4, IMGS.dress2],
      sellerSlug: 'ada-styles',
      variants: [
        { size: 'S', stock: 5 },
        { size: 'M', stock: 8 },
        { size: 'L', stock: 6 },
        { size: 'XL', stock: 3 },
      ],
    }),
  )

  products.push(
    await makeProduct({
      title: 'Floral Chiffon Midi Dress',
      slug: 'floral-chiffon-midi-dress',
      description:
        'Elegant floral chiffon midi dress. Perfect for owambe, Sunday service, or any formal event. Lined, with invisible zip at back. Machine washable on gentle cycle.',
      price: 18500,
      discount: 10,
      isFeatured: true,
      affiliateCommission: 1500,
      categoryIds: [catMap[W]],
      images: [IMGS.dress1, IMGS.dress3, IMGS.dress5],
      sellerSlug: 'ada-styles',
      variants: [
        { size: 'S', stock: 8 },
        { size: 'M', stock: 12 },
        { size: 'L', stock: 5 },
        { size: 'XL', stock: 3 },
      ],
    }),
  )

  products.push(
    await makeProduct({
      title: 'Gold-Plated Beaded Choker',
      slug: 'gold-beaded-choker',
      description:
        '18K gold-plated choker with hand-threaded Nigerian trade beads. Hypoallergenic. Adjustable length 30–40cm. Perfect gift. Ships in branded jewel box.',
      price: 8500,
      discount: 0,
      isAccessory: true,
      affiliateCommission: 700,
      categoryIds: [catMap[J]],
      images: [IMGS.jewel1, IMGS.jewel2],
      sellerSlug: 'ada-styles',
      variants: [{ size: 'One Size', stock: 25 }],
    }),
  )

  // ── AMARA COUTURE ──────────────────────────────────────────────────────────
  products.push(
    await makeProduct({
      title: 'Aso-oke Gele & Iro Set',
      slug: 'asoke-gele-iro-set',
      description:
        'Premium hand-woven Aso-oke 3-piece set (Gele, Iro, Buba) from Iseyin weavers, Oyo State. Available in gold, red, blue, and green. Traditionally worn at Yoruba weddings and naming ceremonies. Made to order — allow 7 days.',
      price: 55000,
      discount: 0,
      isFeatured: true,
      affiliateCommission: 5000,
      categoryIds: [catMap[W], catMap[NH]],
      images: [IMGS.ankara1, IMGS.ankara3, IMGS.dress4],
      sellerSlug: 'amara-couture',
      variants: [
        { size: 'S/M', stock: 4 },
        { size: 'L/XL', stock: 4 },
        { size: 'Custom', stock: 10 },
      ],
    }),
  )

  products.push(
    await makeProduct({
      title: 'Ankara Wrap Skirt',
      slug: 'ankara-wrap-skirt',
      description:
        'Bold 6-yard Ankara print wrap skirt with elastic waistband. One size fits most. Fabric sourced from Balogun Market, Lagos. Pairs perfectly with a plain crop top or fitted blouse.',
      price: 9500,
      discount: 0,
      affiliateCommission: 800,
      categoryIds: [catMap[W], catMap[NH]],
      images: [IMGS.ankara3, IMGS.ankara4],
      sellerSlug: 'amara-couture',
      variants: [
        { size: 'S-M', stock: 15 },
        { size: 'L-XL', stock: 12 },
      ],
    }),
  )

  products.push(
    await makeProduct({
      title: 'Custom Asoebi Lace Blouse',
      slug: 'custom-asoebi-lace-blouse',
      description:
        'Tailored Swiss lace blouse with puff sleeves and back zip. Send us your measurements and fabric for a fully custom piece. Ships within 10 working days. Price is for tailoring only — fabric not included.',
      price: 28000,
      discount: 0,
      affiliateCommission: 2500,
      categoryIds: [catMap[W]],
      images: [IMGS.dress2, IMGS.dress1],
      video: SAMPLE_VIDEO,
      sellerSlug: 'amara-couture',
      variants: [{ size: 'Custom', stock: 20 }],
    }),
  )

  // ── KENE THREADS ───────────────────────────────────────────────────────────
  products.push(
    await makeProduct({
      title: 'Grand Agbada 3-Piece Set',
      slug: 'grand-agbada-3-piece',
      description:
        'Luxurious Agbada set (Agbada, Sokoto, Buba) in premium brocade fabric with hand embroidery. Available in cream, navy, burgundy, and royal blue. Ideal for weddings, chieftaincy titles, and formal events. Fully tailored to your measurements.',
      price: 85000,
      discount: 0,
      isFeatured: true,
      affiliateCommission: 8000,
      categoryIds: [catMap[M], catMap[NH]],
      images: [IMGS.men1, IMGS.men2, IMGS.men4],
      video: SAMPLE_VIDEO,
      bgMusic: SAMPLE_AUDIO,
      sellerSlug: 'kene-threads',
      variants: [
        { size: 'S', stock: 3 },
        { size: 'M', stock: 5 },
        { size: 'L', stock: 5 },
        { size: 'XL', stock: 3 },
        { size: 'XXL', stock: 2 },
      ],
    }),
  )

  products.push(
    await makeProduct({
      title: "Men's Ankara Print Shirt",
      slug: 'mens-ankara-print-shirt',
      description:
        'Bold Ankara fabric dress shirt with modern slim cut. Suitable for formal and smart-casual events. Made from 100% cotton Ankara fabric sourced from Balogun Market, Lagos. Machine washable, colour-fast.',
      price: 14000,
      affiliateCommission: 1200,
      categoryIds: [catMap[M], catMap[NH]],
      images: [IMGS.men3, IMGS.men4, IMGS.ankara1],
      sellerSlug: 'kene-threads',
      variants: [
        { size: 'S', stock: 6 },
        { size: 'M', stock: 10 },
        { size: 'L', stock: 8 },
        { size: 'XL', stock: 4 },
      ],
    }),
  )

  products.push(
    await makeProduct({
      title: 'Kaftan & Trouser Set',
      slug: 'kaftan-trouser-set',
      description:
        'Premium senator kaftan with matching straight-leg trousers. Embroidered collar and cuffs. Classic Nigerian senator style. Suitable for Eid, Sunday service, or any formal event.',
      price: 38000,
      discount: 5,
      affiliateCommission: 3500,
      categoryIds: [catMap[M], catMap[NH]],
      images: [IMGS.men1, IMGS.men2],
      sellerSlug: 'kene-threads',
      variants: [
        { size: 'M', stock: 5 },
        { size: 'L', stock: 7 },
        { size: 'XL', stock: 4 },
        { size: 'XXL', stock: 2 },
      ],
    }),
  )

  products.push(
    await makeProduct({
      title: 'Classic White Sneakers',
      slug: 'classic-white-sneakers',
      description:
        'Clean, minimalist white leather sneakers. Comfortable padded insole for all-day wear. Goes with jeans, chinos, Ankara, or agbada. Genuine leather upper, rubber outsole.',
      price: 32000,
      discount: 5,
      affiliateCommission: 2500,
      categoryIds: [catMap[F]],
      images: [IMGS.shoe1, IMGS.shoe2, IMGS.shoe3],
      video: SAMPLE_VIDEO,
      sellerSlug: 'kene-threads',
      variants: [
        { size: '40', stock: 4 },
        { size: '41', stock: 8 },
        { size: '42', stock: 6 },
        { size: '43', stock: 3 },
        { size: '44', stock: 2 },
      ],
    }),
  )

  // ── FUNMI THRIFT HUB ───────────────────────────────────────────────────────
  products.push(
    await makeProduct({
      title: "Thrift Levi's 501 Jeans",
      slug: 'thrift-levis-501-jeans',
      description:
        "Pre-loved Levi's 501 original fit jeans in excellent condition. Grade A okrika. Vintage wash, minimal wear. Sourced from UK. Sustainable fashion at its finest.",
      price: 8500,
      isThrift: true,
      categoryIds: [catMap[TH], catMap[M]],
      images: [IMGS.thrift1, IMGS.thrift2],
      sellerSlug: 'funmi-thrift-hub',
      variants: [
        { size: 'W30/L30', stock: 1 },
        { size: 'W32/L32', stock: 2 },
        { size: 'W34/L32', stock: 1 },
      ],
    }),
  )

  products.push(
    await makeProduct({
      title: 'Grade A Designer Handbag Bundle',
      slug: 'grade-a-designer-bag-bundle',
      description:
        'Bundle of 2 grade A okrika designer-style handbags. Sourced from Canada. Includes structured tote and crossbody. Perfect condition — no stains, no tears. Sold as a set.',
      price: 15000,
      isThrift: true,
      affiliateCommission: 1000,
      categoryIds: [catMap[TH], catMap[B]],
      images: [IMGS.bag1, IMGS.bag2, IMGS.thrift3],
      sellerSlug: 'funmi-thrift-hub',
      variants: [{ size: 'One Set', stock: 8 }],
    }),
  )

  products.push(
    await makeProduct({
      title: 'Thrift Winter Puffer Jacket',
      slug: 'thrift-puffer-jacket',
      description:
        'Grade A okrika puffer jacket from US. Heavy insulation — great for harmattan season or UK/Canada diaspora. Available in black and olive. Condition: 9/10.',
      price: 12000,
      isThrift: true,
      categoryIds: [catMap[TH]],
      images: [IMGS.thrift2, IMGS.thrift1],
      sellerSlug: 'funmi-thrift-hub',
      variants: [
        { size: 'M', stock: 3 },
        { size: 'L', stock: 4 },
        { size: 'XL', stock: 2 },
      ],
    }),
  )

  // ── TEMI BEAUTY ────────────────────────────────────────────────────────────
  products.push(
    await makeProduct({
      title: 'Raw African Shea Butter (1kg)',
      slug: 'raw-african-shea-butter-1kg',
      description:
        'Unrefined raw shea butter hand-extracted by women cooperatives in Kaduna State, Nigeria. No additives, no fragrance. Rich in Vitamins A, E & F. Excellent for skin, hair, and nails. Free from bleaching agents.',
      price: 4500,
      isFeatured: true,
      affiliateCommission: 400,
      categoryIds: [catMap[BT]],
      images: [IMGS.beauty1, IMGS.beauty2],
      sellerSlug: 'temi-beauty',
      variants: [
        { size: '500g', stock: 30, price: 2500 },
        { size: '1kg', stock: 25 },
        { size: '2kg', stock: 10, price: 8500 },
      ],
    }),
  )

  products.push(
    await makeProduct({
      title: 'Nigerian Black Soap Bar (Ose Dudu)',
      slug: 'nigerian-black-soap-ose-dudu',
      description:
        'Authentic Yoruba black soap (Ose Dudu) hand-made with cocoa pod ash, plantain skin ash, palm kernel oil, and shea butter. Excellent for acne, eczema, and hyperpigmentation. Sourced from Ibadan cooperatives.',
      price: 2800,
      affiliateCommission: 250,
      categoryIds: [catMap[BT]],
      images: [IMGS.beauty2, IMGS.beauty3],
      sellerSlug: 'temi-beauty',
      variants: [
        { size: '150g', stock: 50 },
        { size: '300g (2-pack)', stock: 30, price: 5000 },
      ],
    }),
  )

  products.push(
    await makeProduct({
      title: 'Handmade Nigerian Waist Beads',
      slug: 'handmade-nigerian-waist-beads',
      description:
        'Hand-strung traditional Nigerian waist beads made with Czech glass beads and cowrie shells. Available in 12 colour combinations. Tied style — measure your waist and select size. Spiritual and fashion statement in one.',
      price: 3500,
      isAccessory: true,
      affiliateCommission: 300,
      categoryIds: [catMap[A], catMap[NH]],
      images: [IMGS.jewel3, IMGS.jewel1],
      sellerSlug: 'temi-beauty',
      variants: [
        { size: 'S (25-30")', stock: 20 },
        { size: 'M (31-36")', stock: 20 },
        { size: 'L (37-42")', stock: 15 },
      ],
    }),
  )

  products.push(
    await makeProduct({
      title: 'Adire Fabric Tote Bag',
      slug: 'adire-fabric-tote-bag',
      description:
        'Large canvas tote bag with Adire (Yoruba tie-dye) exterior. Handmade in Lagos. Fully lined, with inner zip pocket. Fits A4 size documents + gym kit. Reinforced handles. Each bag is unique.',
      price: 7500,
      affiliateCommission: 650,
      categoryIds: [catMap[B], catMap[NH]],
      images: [IMGS.ankara2, IMGS.bag3],
      sellerSlug: 'temi-beauty',
      variants: [{ size: 'One Size', stock: 18 }],
    }),
  )

  products.push(
    await makeProduct({
      title: 'Leather Sandals (Aba-made)',
      slug: 'leather-sandals-aba-made',
      description:
        "Handcrafted genuine leather sandals made by artisans in Aba, Abia State — Nigeria's leather craft capital. Durable, comfortable, and fully adjustable ankle strap. Available in tan and black.",
      price: 16500,
      isFeatured: true,
      affiliateCommission: 1500,
      categoryIds: [catMap[F], catMap[NH]],
      images: [IMGS.shoe4, IMGS.shoe2],
      sellerSlug: 'temi-beauty',
      variants: [
        { size: '37', stock: 5 },
        { size: '38', stock: 8 },
        { size: '39', stock: 10 },
        { size: '40', stock: 7 },
        { size: '41', stock: 4 },
      ],
    }),
  )

  const realProducts = products.filter(Boolean)
  console.log(`✅ Products (${realProducts.length} created)`)

  // ── 4. Posts ──────────────────────────────────────────────────────────────
  const makePost = async (data: {
    authorId: string
    content: string
    caption?: string
    contentType?: string
    images?: string[]
    video?: string
    bgMusic?: string
    taggedProductIds?: number[]
  }) => {
    const mediaCreate: any[] = []
    for (let i = 0; i < (data.images?.length ?? 0); i++) {
      mediaCreate.push({
        url: data.images![i],
        public_id: `seed/post-${Date.now()}-${Math.random().toString(36).slice(2)}-img${i}`,
        type: 'IMAGE',
        isBgMusic: false,
        authorId: data.authorId,
      })
    }
    if (data.video)
      mediaCreate.push({
        url: data.video,
        public_id: `seed/post-${Date.now()}-${Math.random().toString(36).slice(2)}-vid`,
        type: 'VIDEO',
        isBgMusic: false,
        authorId: data.authorId,
      })
    if (data.bgMusic)
      mediaCreate.push({
        url: data.bgMusic,
        public_id: `seed/post-${Date.now()}-${Math.random().toString(36).slice(2)}-mus`,
        type: 'AUDIO',
        isBgMusic: true,
        authorId: data.authorId,
      })

    return prisma.post.create({
      data: {
        authorId: data.authorId,
        caption: data.caption ?? data.content.slice(0, 120),
        content: data.content,
        contentType: (data.contentType ?? 'COMMERCE') as any,
        visibility: 'PUBLIC' as any,
        allowComments: true,
        media: mediaCreate.length ? { create: mediaCreate } : undefined,
        taggedProducts: data.taggedProductIds?.length
          ? {
              create: data.taggedProductIds.map((productId) => ({ productId })),
            }
          : undefined,
      },
    })
  }

  const ada = profiles['ada_styles']
  const amara = profiles['amara_couture']
  const kene = profiles['kene_threads']
  const funmi = profiles['funmi_thrift']
  const temi = profiles['temi_beauty']
  const chidi = profiles['chidi_m']
  const sade = profiles['sade_vibes']
  const emeka = profiles['emeka_fits']
  const ngozi = profiles['ngozi_nneka']
  const bayo = profiles['bayo_cold']

  const p = (title: string) => realProducts.find((p: any) => p?.title === title)

  // Ada posts
  await makePost({
    authorId: ada.id,
    content:
      'Adire is not just fabric — it is identity. This hand-dyed Adire maxi from our Abeokuta collection is speaking to your ancestors 🌊 Shop link in bio! #Adire #NigerianFashion #LagosStyle',
    images: [IMGS.ankara2, IMGS.ankara4, IMGS.dress2],
    taggedProductIds: [p('Adire Tie-Dye Maxi Dress')?.id].filter(Boolean),
  })
  await makePost({
    authorId: ada.id,
    content:
      'New arrival! Floral chiffon midi — wear it to church, owambe, or date night. Works everywhere 🌸 10% off this week only, DM to order!',
    images: [IMGS.dress1, IMGS.dress3],
    taggedProductIds: [p('Floral Chiffon Midi Dress')?.id].filter(Boolean),
  })
  await makePost({
    authorId: ada.id,
    content:
      'Three looks, one bag 👜 Our Adire tote goes from the market to the boardroom. Handmade Lagos. Tag a boss babe who needs this!',
    images: [IMGS.bag3, IMGS.ankara2],
    contentType: 'EXPERIENCE',
  })
  await makePost({
    authorId: ada.id,
    content:
      '👟 Sneaker unboxing! Kene Threads white sneakers — clean, premium, affordable. Naija quality is not a joke 🔥 Watch the reel!',
    video: SAMPLE_VIDEO,
    bgMusic: SAMPLE_AUDIO,
    contentType: 'COMMERCE',
  })

  // Amara posts
  await makePost({
    authorId: amara.id,
    content:
      'Aso-oke season is here 🥹 This handwoven set from our Iseyin collection took 3 weeks to make. Worth every second. DM "ASO" to order yours 💛 #AsoOke #NigerianWedding #AbujaBrides',
    images: [IMGS.ankara1, IMGS.ankara3],
    taggedProductIds: [p('Aso-oke Gele & Iro Set')?.id].filter(Boolean),
  })
  await makePost({
    authorId: amara.id,
    content:
      'Ankara never gets old. Period. 🔥 This wrap skirt goes with a simple white tee and block heels. Effortless Naija energy.',
    images: [IMGS.ankara3, IMGS.ankara4],
    taggedProductIds: [p('Ankara Wrap Skirt')?.id].filter(Boolean),
  })
  await makePost({
    authorId: amara.id,
    content:
      'Custom asoebi orders are open! Send your fabric, we handle the rest 🪡 Blouse + skirt + gele — full package available. DM us!',
    images: [IMGS.dress4, IMGS.dress2],
    video: SAMPLE_VIDEO,
    bgMusic: SAMPLE_AUDIO,
  })

  // Kene posts
  await makePost({
    authorId: kene.id,
    content:
      'Agbada season loading... 👀 This grand brocade Agbada is giving father-of-the-year energy and we are not sorry 👑 Available in 4 colours. Book yours now! #Agbada #NaijaFashion #KeneThreads',
    images: [IMGS.men1, IMGS.men2, IMGS.men4],
    taggedProductIds: [p('Grand Agbada 3-Piece Set')?.id].filter(Boolean),
  })
  await makePost({
    authorId: kene.id,
    content:
      'Ankara shirt + white trousers = forever winning formula ✅ Simple, sharp, and deeply Nigerian. Shop our menswear collection 🔗',
    images: [IMGS.men3, IMGS.ankara1],
    taggedProductIds: [p("Men's Ankara Print Shirt")?.id].filter(Boolean),
  })
  await makePost({
    authorId: kene.id,
    content:
      'The senator is always a safe bet 💼 Kaftan + straight leg trousers, hand-embroidered collar. Made in Lagos. Ships nationwide in 5 days.',
    images: [IMGS.men1, IMGS.men4],
    video: SAMPLE_VIDEO,
    taggedProductIds: [p('Kaftan & Trouser Set')?.id].filter(Boolean),
  })

  // Funmi posts
  await makePost({
    authorId: funmi.id,
    content:
      "Thrift haul just landed! 🛍️ Grade A okrika straight from UK — Levi's, puffer jackets, designer bags. All under ₦15k. Lagos girls wake UP 🔔 DM 'THRIFT' to see inventory!",
    images: [IMGS.thrift1, IMGS.thrift2, IMGS.thrift3],
    taggedProductIds: [p("Thrift Levi's 501 Jeans")?.id].filter(Boolean),
  })
  await makePost({
    authorId: funmi.id,
    content:
      "Sustainable fashion is not a trend in Nigeria — it's survival AND style 💚 You can be fine AND budget-conscious. These Levi's are ₦8,500. Yes, ₦8,500.",
    images: [IMGS.thrift2, IMGS.thrift1],
    contentType: 'INSPIRATION',
  })

  // Temi posts
  await makePost({
    authorId: temi.id,
    content:
      "Your skin deserves Nigerian goodness 🌿 Our raw shea butter is hand-extracted by women cooperatives in Kaduna. No chemicals, no nonsense. Just pure African butter that works. DM 'SHEA' to order!",
    images: [IMGS.beauty1, IMGS.beauty2],
    taggedProductIds: [p('Raw African Shea Butter (1kg)')?.id].filter(Boolean),
  })
  await makePost({
    authorId: temi.id,
    content:
      'Ose Dudu cleared my skin in 3 weeks 🧼✨ Nigerian black soap is not a secret anymore — it is science. Made with cocoa pod ash and palm kernel oil from Ibadan. Shop below 👇',
    images: [IMGS.beauty2, IMGS.beauty3],
    taggedProductIds: [p('Nigerian Black Soap Bar (Ose Dudu)')?.id].filter(
      Boolean,
    ),
  })
  await makePost({
    authorId: temi.id,
    content:
      'Waist beads are a love language 💕 Hand-strung with Czech glass beads and real cowrie shells. 12 colour combos available. Your waist will thank you 🙏 #WaistBeads #NigerianJewelry',
    images: [IMGS.jewel3, IMGS.jewel1],
    taggedProductIds: [p('Handmade Nigerian Waist Beads')?.id].filter(Boolean),
  })
  await makePost({
    authorId: temi.id,
    content:
      'Aba leather is THAT girl 👡 Made by skilled Aba artisans — these sandals are durable, handcrafted, and 100% Naija. Support local and look better doing it! Reel coming soon 🎥',
    images: [IMGS.shoe4, IMGS.shoe2],
    video: SAMPLE_VIDEO,
    taggedProductIds: [p('Leather Sandals (Aba-made)')?.id].filter(Boolean),
  })

  // Buyer / creator posts
  await makePost({
    authorId: chidi.id,
    content:
      'Lagos fashion is on another level bro 🔥 Shout out to @kene_threads for this fit — Ankara shirt hits different. Naija made, globally worn 🇳🇬 #LagosStreetStyle #NigerianFashion',
    images: [IMGS.men3, IMGS.men4],
    contentType: 'INSPIRATION',
  })
  await makePost({
    authorId: sade.id,
    content:
      "POV: Your asoebi just arrived and it is EVERYTHING 🥹💛 Thank you @amara_couture for this masterpiece. The embroidery details are chef's kiss 😭",
    images: [IMGS.dress4, IMGS.ankara1],
    contentType: 'EXPERIENCE',
  })
  await makePost({
    authorId: emeka.id,
    content:
      'Agbada on a Tuesday because why not 😤👑 Naija men, stop sleeping on traditional wear. It is always the right time.',
    images: [IMGS.men1, IMGS.men2],
    contentType: 'INSPIRATION',
  })
  await makePost({
    authorId: ngozi.id,
    content:
      'Black soap + shea butter combo from @temi_beauty changed my skincare routine completely 🌿 Nigerian ingredients for Nigerian skin — makes sense!',
    images: [IMGS.beauty1, IMGS.beauty3],
    contentType: 'EXPERIENCE',
  })
  await makePost({
    authorId: bayo.id,
    content:
      'Cold guy certified 🥶 White sneakers from @kene_threads, Ankara shorts from @amara_couture. Whole fit is under ₦50k. Budget fashionista check ✅',
    images: [IMGS.shoe1, IMGS.ankara3],
    contentType: 'INSPIRATION',
  })

  console.log('✅ Posts (24 created)')

  // ── 5. Stories ────────────────────────────────────────────────────────────
  const makeStory = async (data: {
    authorId: string
    imageUrl: string
    productId?: number
  }) => {
    const mediaId = uuid()
    await prisma.media.create({
      data: {
        id: mediaId,
        url: data.imageUrl,
        public_id: `seed/story-${mediaId}`,
        type: 'IMAGE',
        isBgMusic: false,
        authorId: data.authorId,
      },
    })
    return prisma.story.create({
      data: {
        authorId: data.authorId,
        mediaId,
        productId: data.productId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })
  }

  await makeStory({
    authorId: ada.id,
    imageUrl: IMGS.story1,
    productId: p('Adire Tie-Dye Maxi Dress')?.id,
  })
  await makeStory({ authorId: ada.id, imageUrl: IMGS.story3 })
  await makeStory({
    authorId: amara.id,
    imageUrl: IMGS.story2,
    productId: p('Aso-oke Gele & Iro Set')?.id,
  })
  await makeStory({
    authorId: kene.id,
    imageUrl: IMGS.story4,
    productId: p('Grand Agbada 3-Piece Set')?.id,
  })
  await makeStory({ authorId: funmi.id, imageUrl: IMGS.story5 })
  await makeStory({
    authorId: temi.id,
    imageUrl: IMGS.story8,
    productId: p('Raw African Shea Butter (1kg)')?.id,
  })
  await makeStory({ authorId: chidi.id, imageUrl: IMGS.story6 })
  await makeStory({ authorId: sade.id, imageUrl: IMGS.story7 })

  console.log('✅ Stories (8 created)')

  // ── 6. Follows (social graph) ─────────────────────────────────────────────
  const followPairs = [
    [chidi.id, ada.id],
    [chidi.id, kene.id],
    [chidi.id, amara.id],
    [sade.id, ada.id],
    [sade.id, amara.id],
    [sade.id, temi.id],
    [emeka.id, kene.id],
    [emeka.id, ada.id],
    [ngozi.id, temi.id],
    [ngozi.id, amara.id],
    [ngozi.id, ada.id],
    [bayo.id, kene.id],
    [bayo.id, chidi.id],
  ]
  for (const [followerId, followingId] of followPairs) {
    const exists = await prisma.follow.findFirst({
      where: { followerId, followingId },
    })
    if (!exists)
      await prisma.follow
        .create({ data: { followerId, followingId } })
        .catch(() => {})
  }
  console.log('✅ Follows')

  // ── 7. Social Proof ───────────────────────────────────────────────────────
  const buyers = [chidi.id, sade.id, emeka.id, ngozi.id, bayo.id]
  for (const pid_ of realProducts
    .filter(Boolean)
    .slice(0, 8)
    .map((p: any) => p.id)) {
    for (const userId of buyers.slice(0, 3)) {
      await prisma.like
        .upsert({
          where: { userId_productId: { userId, productId: pid_ } },
          update: {},
          create: { userId, productId: pid_ },
        })
        .catch(() => {})
    }
  }

  const commentData = [
    { authorId: chidi.id, text: 'This is HEAT 🔥 Does it ship to Abuja?' },
    {
      authorId: sade.id,
      text: 'OMG I need this in my life 😩 Can I pay on delivery?',
    },
    {
      authorId: emeka.id,
      text: 'Naija made, globally worn! 🇳🇬 What sizes are left?',
    },
    {
      authorId: ngozi.id,
      text: 'Quality looks amazing, seen it in real life and it slaps 🫶',
    },
    { authorId: bayo.id, text: 'Cold guy approved ✅ Already ordered mine!' },
  ]
  for (const p_ of realProducts.filter(Boolean).slice(0, 5) as any[]) {
    const comment = commentData[Math.floor(Math.random() * commentData.length)]
    await prisma.comment
      .create({
        data: {
          authorId: comment.authorId,
          productId: p_.id,
          text: comment.text,
        },
      })
      .catch(() => {})
  }

  console.log('✅ Social proof (likes & comments)')

  // ── 8. Electronics & Gadgets category ────────────────────────────────────
  await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: { name: 'Electronics & Gadgets', slug: 'electronics', thumbnailCatUrl: IMGS.beauty3 },
  })
  const EL = (await prisma.category.findUnique({ where: { slug: 'electronics' } }))!.id
  // Also refresh catMap with EL
  const catMapFull = { ...catMap, electronics: EL }

  // ── 9. New seller profiles ────────────────────────────────────────────────
  const SQ_PROFILES = [
    { email: 'hamaz@peppr.test',   username: 'hamaz_crafts',    avatar: IMGS.av2,  bio: 'Plateau artisan crafts 🏔️ Tin sculptures, gemstones, Jos-made leather | Ship nationwide' },
    { email: 'yola@peppr.test',    username: 'yola_leather',    avatar: IMGS.av6,  bio: 'Adamawa leatherwork & Fulani crafts 🐪 Handmade in Yola since 2008' },
    { email: 'balogun@peppr.test', username: 'balogun_fabrics', avatar: IMGS.av10, bio: 'Lagos Island fabric trader 🧵 Ankara, Swiss lace, George — wholesale & retail | Balogun Market' },
    { email: 'cvtech@peppr.test',  username: 'cv_accessories',  avatar: IMGS.av7,  bio: 'Genuine tech accessories at CV prices 📱 Chargers · earbuds · power banks · ships everywhere' },
    { email: 'bodija@peppr.test',  username: 'bodija_roots',    avatar: IMGS.av9,  bio: 'Yoruba roots & crafts from Bodija 🌿 Adire fabric, traditional goods, local artisans' },
    { email: 'wuse@peppr.test',    username: 'wuse_fashion',    avatar: IMGS.av4,  bio: 'Abuja fashion district 🏙️ Ready-to-wear & custom designs | Wuse II, Abuja' },
  ]

  const sqProfiles: Record<string, any> = {}
  for (const p of SQ_PROFILES) {
    const existing = await prisma.profile.findUnique({ where: { email: p.email } })
    if (existing) { sqProfiles[p.username] = existing; continue }
    sqProfiles[p.username] = await prisma.profile.create({
      data: { id: uuid(), email: p.email, username: p.username, password_hash: pwHash,
              avatar: p.avatar, bio: p.bio, email_verified: true, email_verified_at: new Date() },
    })
  }

  // ── 10. New seller store profiles ──────────────────────────────────────────
  const SQ_SELLERS_DATA = [
    { pk: 'hamaz_crafts',    slug: 'hamaz-crafts',        name: 'Hamaz Crafts & Heritage',    logo: IMGS.jewel2, banner: IMGS.ankara4, verified: false,
      desc: 'Authentic Plateau State artisan crafts. Tin sculptures, gemstone jewelry, traditional baskets, and Jos-made leather goods.' },
    { pk: 'yola_leather',    slug: 'yola-leather-co',     name: 'Yola Leather Co.',           logo: IMGS.bag2,   banner: IMGS.bag1,    verified: false,
      desc: 'Premium Adamawa leatherwork. Hand-tooled bags, sandals, and Fulani traditional crafts from the northeast.' },
    { pk: 'balogun_fabrics', slug: 'balogun-fabrics',     name: 'Balogun Fabrics',            logo: IMGS.ankara1, banner: IMGS.ankara2, verified: true,
      desc: "Lagos Island's premier fabric trader. Ankara prints, Swiss voile lace, George wrappers. 30+ years in Balogun Market." },
    { pk: 'cv_accessories',  slug: 'cv-accessories-hub',  name: 'CV Accessories Hub',         logo: IMGS.beauty3, banner: IMGS.beauty2, verified: false,
      desc: 'Genuine tech accessories at Computer Village prices. Chargers, earbuds, power banks, phone cases shipped nationwide.' },
    { pk: 'bodija_roots',    slug: 'bodija-roots',        name: 'Bodija Roots & Crafts',      logo: IMGS.ankara4, banner: IMGS.ankara3, verified: false,
      desc: 'Traditional Yoruba goods from Bodija Market, Ibadan. Adire fabric, Ose Dudu soap, Yoruba crafts and local artisan items.' },
    { pk: 'wuse_fashion',    slug: 'wuse-fashion-abuja',  name: 'Wuse Fashion Abuja',         logo: IMGS.dress1,  banner: IMGS.dress3,  verified: true,
      desc: 'Abuja\'s trendy fashion district. Smart casuals, office wear, Ankara fusion, and accessories for the FCT crowd.' },
  ]

  const sqSellers: Record<string, any> = {}
  for (const s of SQ_SELLERS_DATA) {
    const prof = sqProfiles[s.pk]
    const existing = await prisma.sellerProfile.findUnique({ where: { store_slug: s.slug } })
    if (existing) { sqSellers[s.slug] = existing; continue }
    sqSellers[s.slug] = await prisma.sellerProfile.create({
      data: {
        profileId: prof.id, store_slug: s.slug, store_name: s.name,
        store_description: s.desc, store_logo: s.logo, store_banner: s.banner,
        is_verified: s.verified, is_active: true,
        verification_status: s.verified ? 'VERIFIED' : 'PENDING',
        default_currency: 'NGN',
        followers_count: Math.floor(Math.random() * 1500) + 100,
      },
    })
  }
  console.log('✅ Square seller profiles (6)')

  // ── 11. Products for new Square sellers ────────────────────────────────────
  const makeSqProduct = async (data: {
    title: string; slug: string; description: string; price: number
    discount?: number; isFeatured?: boolean; isThrift?: boolean
    affiliateCommission?: number; categoryIds: number[]; images: string[]
    variants: { size: string; stock: number; price?: number }[]
    sellerSlug: string
  }) => {
    if (await prisma.products.findUnique({ where: { slug: data.slug } })) return null
    const seller = sqSellers[data.sellerSlug]
    const profKey = SQ_SELLERS_DATA.find(s => s.slug === data.sellerSlug)!.pk
    const prof = sqProfiles[profKey]
    return prisma.products.create({
      data: {
        title: data.title, slug: data.slug, description: data.description,
        price: data.price, discount: data.discount ?? 0,
        status: 'PUBLISHED' as any, isFeatured: data.isFeatured ?? false,
        isThrift: data.isThrift ?? false, showInFeed: true,
        affiliateCommission: data.affiliateCommission,
        bannerImageUrl: data.images[0],
        sellerId: seller.id, store_slug: seller.store_slug,
        variants: { create: data.variants },
        media: { create: data.images.map((url, i) => ({ url, public_id: `seed/${data.slug}-img${i}`, type: 'IMAGE', isBgMusic: false, authorId: prof.id })) },
        category: { create: data.categoryIds.map(categoryId => ({ categoryId })) },
      },
    })
  }

  const sqProds: any[] = []

  // ── HAMAZ CRAFTS (Jos, Plateau) ────────────────────────────────────────────
  sqProds.push(await makeSqProduct({
    title: 'Plateau Tin Art Sculpture',
    slug: 'plateau-tin-art-sculpture',
    description: 'Hand-crafted tin sculpture by Plateau State artisans — a nod to Jos\'s historical tin mining legacy. Each piece is unique, depicting traditional Berom or Ngas motifs. Makes an exceptional décor piece or gift. Dimensions: ~25cm tall.',
    price: 48000, isFeatured: true, affiliateCommission: 4500,
    categoryIds: [catMapFull['nigerian-heritage'], catMapFull['home-living']],
    images: [IMGS.jewel3, IMGS.jewel2, IMGS.bag2],
    sellerSlug: 'hamaz-crafts',
    variants: [{ size: 'Standard', stock: 12 }, { size: 'Large (40cm)', stock: 6, price: 75000 }],
  }))
  sqProds.push(await makeSqProduct({
    title: 'Jos Plateau Gemstone Necklace',
    slug: 'jos-plateau-gemstone-necklace',
    description: 'Hand-set necklace featuring semi-precious gemstones mined in Plateau State — tourmaline, aquamarine, and quartz. Sterling silver setting. Each stone is hand-polished by Jos artisans. Certificate of authenticity included.',
    price: 22000, affiliateCommission: 2000,
    categoryIds: [catMapFull['jewelry-watches'], catMapFull['nigerian-heritage']],
    images: [IMGS.jewel1, IMGS.jewel2, IMGS.jewel3],
    sellerSlug: 'hamaz-crafts',
    variants: [{ size: 'One Size', stock: 20 }],
  }))
  sqProds.push(await makeSqProduct({
    title: 'Traditional Ngas Hand-Woven Basket',
    slug: 'ngas-hand-woven-basket',
    description: 'Large hand-woven storage basket made by Ngas women weavers from Plateau State. Uses local raffia and natural dyes. Multi-purpose: market basket, laundry storage, or décor. Fair-trade certified. Approximately 45cm diameter.',
    price: 9500, affiliateCommission: 800,
    categoryIds: [catMapFull['home-living'], catMapFull['nigerian-heritage']],
    images: [IMGS.bag3, IMGS.bag1, IMGS.ankara4],
    sellerSlug: 'hamaz-crafts',
    variants: [{ size: 'Medium (35cm)', stock: 25, price: 7000 }, { size: 'Large (45cm)', stock: 20 }, { size: 'XL (55cm)', stock: 10, price: 14000 }],
  }))
  sqProds.push(await makeSqProduct({
    title: 'Jos Handmade Leather Brogues',
    slug: 'jos-handmade-leather-brogues',
    description: 'Classic Oxford brogues hand-stitched by Jos cobblers using locally sourced cow leather. Plateau State has a thriving leather craft tradition passed down for generations. Full leather upper and sole. Made to last 10+ years.',
    price: 28000, isFeatured: true, affiliateCommission: 2500,
    categoryIds: [catMapFull['footwear'], catMapFull['nigerian-heritage']],
    images: [IMGS.shoe4, IMGS.shoe2, IMGS.shoe3],
    sellerSlug: 'hamaz-crafts',
    variants: [{ size: '40', stock: 4 }, { size: '41', stock: 6 }, { size: '42', stock: 7 }, { size: '43', stock: 5 }, { size: '44', stock: 3 }],
  }))

  // ── YOLA LEATHER CO (Yola, Adamawa) ───────────────────────────────────────
  sqProds.push(await makeSqProduct({
    title: 'Fulani Embroidered Leather Satchel',
    slug: 'fulani-embroidered-leather-satchel',
    description: 'Hand-tooled leather satchel with traditional Fulani geometric embroidery. Full-grain cow leather tanned using centuries-old techniques in Adamawa. Brass fittings, interior zip pocket, shoulder strap included. Iconic northeast Nigerian craftsmanship.',
    price: 32000, isFeatured: true, affiliateCommission: 3000,
    categoryIds: [catMapFull['bags-luggage'], catMapFull['nigerian-heritage']],
    images: [IMGS.bag1, IMGS.bag2, IMGS.bag3],
    sellerSlug: 'yola-leather-co',
    variants: [{ size: 'One Size', stock: 18 }],
  }))
  sqProds.push(await makeSqProduct({
    title: 'Adamawa Hand-Tooled Sandals',
    slug: 'adamawa-hand-tooled-sandals',
    description: 'Traditional Adamawa-style leather sandals with intricate hand-tooled floral patterns. Made to order by master craftsmen in Yola. Double-layer sole for durability. Available in natural tan or dyed black.',
    price: 19500, affiliateCommission: 1800,
    categoryIds: [catMapFull['footwear'], catMapFull['nigerian-heritage']],
    images: [IMGS.shoe2, IMGS.shoe4],
    sellerSlug: 'yola-leather-co',
    variants: [{ size: '37', stock: 5 }, { size: '38', stock: 7 }, { size: '39', stock: 9 }, { size: '40', stock: 8 }, { size: '41', stock: 6 }, { size: '42', stock: 4 }],
  }))
  sqProds.push(await makeSqProduct({
    title: 'Fulani Calabash Decorative Bowl',
    slug: 'fulani-calabash-decorative-bowl',
    description: 'Beautifully engraved calabash bowl crafted by Fulani artisans in Adamawa. Hand-carved with geometric patterns and stained with natural pigments. Used traditionally for milk and honey — now a stunning home décor piece. Approximately 30cm diameter.',
    price: 7500, affiliateCommission: 600,
    categoryIds: [catMapFull['home-living'], catMapFull['nigerian-heritage']],
    images: [IMGS.bag3, IMGS.jewel3],
    sellerSlug: 'yola-leather-co',
    variants: [{ size: 'Small (20cm)', stock: 15, price: 4500 }, { size: 'Medium (30cm)', stock: 20 }, { size: 'Large (40cm)', stock: 10, price: 12000 }],
  }))
  sqProds.push(await makeSqProduct({
    title: 'Traditional Hausa Babban Riga',
    slug: 'traditional-hausa-babban-riga',
    description: 'Grand ceremonial Babban Riga (wide-sleeved robe) in fine cotton with hand-embroidered collar and cuffs (zari goldwork). Tailored by master tailors in Yola. Comes with matching Hula cap. A statement piece for Sallah, chieftaincy, and state events.',
    price: 68000, isFeatured: true, affiliateCommission: 6000,
    categoryIds: [catMapFull['mens-fashion'], catMapFull['nigerian-heritage']],
    images: [IMGS.men1, IMGS.men2, IMGS.men4],
    sellerSlug: 'yola-leather-co',
    variants: [{ size: 'M', stock: 4 }, { size: 'L', stock: 6 }, { size: 'XL', stock: 5 }, { size: 'XXL', stock: 3 }],
  }))

  // ── BALOGUN FABRICS (Balogun Market, Lagos Island) ─────────────────────────
  sqProds.push(await makeSqProduct({
    title: 'Premium Dutch Wax Ankara Print (6 yards)',
    slug: 'dutch-wax-ankara-6yards',
    description: 'Genuine Dutch Wax Hollandais Ankara print fabric — 6 yards. 100% cotton, vibrant colour-fast print. Sourced directly from Balogun Market, Lagos Island. Suitable for iro, skirts, shirts, dresses. Comes pre-washed and pressed.',
    price: 12500, affiliateCommission: 1000,
    categoryIds: [catMapFull['nigerian-heritage'], catMapFull['womens-fashion']],
    images: [IMGS.ankara1, IMGS.ankara2, IMGS.ankara3],
    sellerSlug: 'balogun-fabrics',
    variants: [{ size: '6 yards', stock: 50 }, { size: '12 yards (bulk)', stock: 20, price: 22000 }],
  }))
  sqProds.push(await makeSqProduct({
    title: 'Swiss Voile Lace Fabric (5 yards)',
    slug: 'swiss-voile-lace-5yards',
    description: 'High-grade Swiss voile lace — the choice of Lagos socialites and Abuja brides. Delicate open-weave lace with intricate floral embroidery. 5-yard piece. Available in ivory, champagne, dusty rose, and royal blue. Perfect for asoebi sets.',
    price: 42000, isFeatured: true, affiliateCommission: 4000,
    categoryIds: [catMapFull['womens-fashion'], catMapFull['nigerian-heritage']],
    images: [IMGS.dress2, IMGS.dress4, IMGS.ankara4],
    sellerSlug: 'balogun-fabrics',
    variants: [
      { size: '5 yards — Ivory', stock: 12 },
      { size: '5 yards — Champagne', stock: 10 },
      { size: '5 yards — Dusty Rose', stock: 8 },
      { size: '5 yards — Royal Blue', stock: 8 },
    ],
  }))
  sqProds.push(await makeSqProduct({
    title: 'George Wrapper & Blouse Fabric Set',
    slug: 'george-wrapper-blouse-set',
    description: 'Classic Indian George wrapper set — 5 yards wrapper + 2 yards blouse fabric. Satin finish, heavy-weight. The standard fabric for Igbo traditional ceremonies, Delta State events, and Port Harcourt owambe. Comes with matching net headtie.',
    price: 55000, isFeatured: true, affiliateCommission: 5000,
    categoryIds: [catMapFull['womens-fashion'], catMapFull['nigerian-heritage']],
    images: [IMGS.ankara3, IMGS.dress1, IMGS.dress5],
    sellerSlug: 'balogun-fabrics',
    variants: [
      { size: 'Gold/Champagne', stock: 8 },
      { size: 'Red/Wine', stock: 6 },
      { size: 'Green/Olive', stock: 5 },
      { size: 'Navy/Silver', stock: 5 },
    ],
  }))
  sqProds.push(await makeSqProduct({
    title: 'Aso-Oke Woven Headtie (Gele) — Iseyin',
    slug: 'asoke-gele-iseyin-woven',
    description: 'Hand-woven Aso-oke gele sourced directly from Iseyin weavers, Oyo State. One full head-tie piece (approximately 2.5 metres). Available in gold metallic, silver, deep purple, and burnt orange. Price is per piece.',
    price: 18000, affiliateCommission: 1500,
    categoryIds: [catMapFull['womens-fashion'], catMapFull['nigerian-heritage']],
    images: [IMGS.ankara1, IMGS.ankara4],
    sellerSlug: 'balogun-fabrics',
    variants: [
      { size: 'Gold Metallic', stock: 15 },
      { size: 'Silver', stock: 12 },
      { size: 'Deep Purple', stock: 10 },
      { size: 'Burnt Orange', stock: 10 },
    ],
  }))

  // ── CV ACCESSORIES HUB (Computer Village, Ikeja) ───────────────────────────
  sqProds.push(await makeSqProduct({
    title: '65W GaN Fast Charger (USB-C + USB-A)',
    slug: 'gan-65w-fast-charger',
    description: 'Genuine 65W GaN (Gallium Nitride) compact wall charger. Dual-port: USB-C Power Delivery + USB-A Quick Charge 3.0. Charges MacBook, iPhone, Samsung, and most laptops. NAFDAC and CE certified. Fold-flat pins. 18-month warranty.',
    price: 12500, affiliateCommission: 1000,
    categoryIds: [catMapFull['electronics'], catMapFull['accessories']],
    images: [IMGS.beauty1, IMGS.beauty2, IMGS.beauty3],
    sellerSlug: 'cv-accessories-hub',
    variants: [{ size: 'UK Plug', stock: 35 }, { size: 'EU Plug', stock: 15 }],
  }))
  sqProds.push(await makeSqProduct({
    title: 'True Wireless Earbuds (ANC)',
    slug: 'true-wireless-earbuds-anc',
    description: 'True wireless stereo earbuds with Active Noise Cancellation. 8-hour battery + 24h charging case. IPX4 sweat resistance. Touch controls. Compatible with iOS and Android. Great for Lagos traffic, office, and gym sessions.',
    price: 18500, isFeatured: true, affiliateCommission: 1600,
    categoryIds: [catMapFull['electronics'], catMapFull['accessories']],
    images: [IMGS.beauty2, IMGS.beauty1],
    sellerSlug: 'cv-accessories-hub',
    variants: [{ size: 'Black', stock: 25 }, { size: 'White', stock: 20 }],
  }))
  sqProds.push(await makeSqProduct({
    title: '20,000mAh Slim Power Bank (PD 22.5W)',
    slug: 'slim-powerbank-20000mah',
    description: '20,000mAh ultra-slim power bank with 22.5W Power Delivery fast charge. Dual USB-A + USB-C output. LED battery indicator. Weighs only 380g. Charges iPhone 3x, Android 2.5x. Airline-compliant. 12-month warranty. Tested before dispatch.',
    price: 22000, affiliateCommission: 2000,
    categoryIds: [catMapFull['electronics'], catMapFull['accessories']],
    images: [IMGS.beauty3, IMGS.beauty2, IMGS.beauty1],
    sellerSlug: 'cv-accessories-hub',
    variants: [{ size: 'Black', stock: 30 }, { size: 'White', stock: 20 }],
  }))
  sqProds.push(await makeSqProduct({
    title: 'Premium Phone Case Bundle (10 designs)',
    slug: 'phone-case-bundle-10pack',
    description: 'Bundle of 10 assorted premium phone cases. Includes shockproof, clear, and aesthetic designs. Compatible with iPhone 13–15, Samsung S21–S24. Nigerian-made packaging. Ideal for retailers and resellers. Mix of Ankara-print, plain, and minimalist designs.',
    price: 8500, affiliateCommission: 700,
    categoryIds: [catMapFull['electronics'], catMapFull['accessories']],
    images: [IMGS.beauty1, IMGS.beauty3],
    sellerSlug: 'cv-accessories-hub',
    variants: [{ size: 'iPhone 13/14/15', stock: 20 }, { size: 'Samsung S21-S23', stock: 20 }, { size: 'Samsung S24', stock: 15 }],
  }))

  // ── BODIJA ROOTS (Bodija Market, Ibadan) ───────────────────────────────────
  sqProds.push(await makeSqProduct({
    title: 'Ibadan Adire Eleko Fabric (3 yards)',
    slug: 'ibadan-adire-eleko-3yards',
    description: 'Authentic Adire Eleko (cassava paste resist-dyed) fabric from Ibadan artisans. 3 yards of 100% cotton, indigo-dyed fabric with traditional Ibadan patterns — olokun, ibadandun, and ayouma designs. Each piece is one-of-a-kind. Hand-wash cold.',
    price: 8500, isFeatured: true, affiliateCommission: 700,
    categoryIds: [catMapFull['nigerian-heritage'], catMapFull['womens-fashion']],
    images: [IMGS.ankara2, IMGS.ankara4, IMGS.ankara1],
    sellerSlug: 'bodija-roots',
    variants: [{ size: '3 yards', stock: 30 }, { size: '6 yards', stock: 15, price: 16000 }],
  }))
  sqProds.push(await makeSqProduct({
    title: 'Pure Shea Butter Soap (Ose Adi)',
    slug: 'pure-shea-butter-soap-ose-adi',
    description: 'Traditional Yoruba shea butter soap (Ose Adi) from Bodija cooperatives. Made with raw shea butter, cocoa pod ash, and palm kernel oil. No synthetic additives. Deeply moisturising — suitable for all skin types including eczema-prone. 200g bar.',
    price: 2200, affiliateCommission: 180,
    categoryIds: [catMapFull['beauty-care'], catMapFull['nigerian-heritage']],
    images: [IMGS.beauty2, IMGS.beauty1],
    sellerSlug: 'bodija-roots',
    variants: [{ size: '200g bar', stock: 80 }, { size: '3-bar gift set', stock: 30, price: 6000 }],
  }))
  sqProds.push(await makeSqProduct({
    title: 'Yoruba Oja Baby Carrier Cloth',
    slug: 'yoruba-oja-baby-carrier',
    description: 'Traditional Yoruba Oja — a long multi-purpose cloth used by Yoruba mothers for baby-carrying and as a wrapper. Made from 100% cotton stretch-weave. 3.5 metres long, 60cm wide. Can also be used as a travel wrap or light blanket. One size fits all.',
    price: 11500, affiliateCommission: 1000,
    categoryIds: [catMapFull['kids-baby'], catMapFull['nigerian-heritage']],
    images: [IMGS.ankara3, IMGS.dress5],
    sellerSlug: 'bodija-roots',
    variants: [{ size: 'One Size', stock: 25 }],
  }))
  sqProds.push(await makeSqProduct({
    title: 'Ibadan Locust Bean Seasoning (Iru) Pack',
    slug: 'ibadan-locust-bean-iru-pack',
    description: 'Sun-dried fermented locust beans (Iru/Dawadawa) packed in Bodija Market, Ibadan. 100% natural — no preservatives. Deep umami flavour for soups, stews, and sauces. Sealed in airtight food-grade packs. 200g per pack. Shelf life: 12 months.',
    price: 1800, affiliateCommission: 150,
    categoryIds: [catMapFull['home-living'], catMapFull['nigerian-heritage']],
    images: [IMGS.beauty3, IMGS.beauty1],
    sellerSlug: 'bodija-roots',
    variants: [{ size: '200g', stock: 100 }, { size: '500g bulk', stock: 40, price: 4000 }],
  }))

  // ── WUSE FASHION ABUJA (Wuse II, Abuja) ────────────────────────────────────
  sqProds.push(await makeSqProduct({
    title: 'Corporate Ankara Blazer (Women)',
    slug: 'corporate-ankara-blazer-women',
    description: 'Modern structured blazer in bold Ankara print. Fully lined, with two functional pockets. Ideal for corporate Fridays, meetings, and styled with trousers or a pencil skirt. Made in Abuja. Ships in 5 working days.',
    price: 34000, isFeatured: true, affiliateCommission: 3000,
    categoryIds: [catMapFull['womens-fashion'], catMapFull['nigerian-heritage']],
    images: [IMGS.dress1, IMGS.ankara1, IMGS.dress3],
    sellerSlug: 'wuse-fashion-abuja',
    variants: [{ size: 'S', stock: 5 }, { size: 'M', stock: 8 }, { size: 'L', stock: 6 }, { size: 'XL', stock: 4 }],
  }))
  sqProds.push(await makeSqProduct({
    title: 'Abuja Senator Suit (Men)',
    slug: 'abuja-senator-suit-men',
    description: 'Classic senator linen suit — jacket and straight-cut trousers. Embroidered breast pocket. Abuja\'s go-to style for government functions, Eid, and formal occasions. Available in navy, charcoal, and cream. Tailored to measurements or select standard size.',
    price: 52000, isFeatured: true, affiliateCommission: 5000,
    categoryIds: [catMapFull['mens-fashion'], catMapFull['nigerian-heritage']],
    images: [IMGS.men2, IMGS.men1, IMGS.men3],
    sellerSlug: 'wuse-fashion-abuja',
    variants: [{ size: 'M', stock: 5 }, { size: 'L', stock: 7 }, { size: 'XL', stock: 5 }, { size: 'XXL', stock: 3 }],
  }))
  sqProds.push(await makeSqProduct({
    title: 'Abuja Crossbody Leather Bag',
    slug: 'abuja-crossbody-leather-bag',
    description: 'Clean, minimalist crossbody bag in genuine leather. Perfect for the Abuja professional — fits phone, ID, and essentials. Gold-tone hardware, adjustable strap. Available in cognac tan and classic black.',
    price: 24500, affiliateCommission: 2200,
    categoryIds: [catMapFull['bags-luggage']],
    images: [IMGS.bag2, IMGS.bag1, IMGS.bag3],
    sellerSlug: 'wuse-fashion-abuja',
    variants: [{ size: 'Cognac Tan', stock: 12 }, { size: 'Classic Black', stock: 15 }],
  }))

  // Enable showInFeed for all published products (existing + new)
  await prisma.products.updateMany({
    where: { status: 'PUBLISHED' },
    data: { showInFeed: true },
  })

  const sqProdFiltered = sqProds.filter(Boolean)
  console.log(`✅ Square products (${sqProdFiltered.length} created, all published products set showInFeed=true)`)

  // ── 12. Create Squares + Wallets ───────────────────────────────────────────
  interface SquareSeed {
    name: string; slug: string; type: 'GEOGRAPHIC' | 'CATEGORY'
    description: string; city?: string; state?: string; country?: string
    latitude?: number; longitude?: number; physicalAddress?: string
    associationCutPercent: number; accentColor: string
    sellerSlugs: string[]       // store_slugs of members
    chairmanSlug: string         // store_slug of chairman
  }

  const SQUARES: SquareSeed[] = [
    {
      name: 'Hamaz Shopping Complex',
      slug: 'hamaz-complex-jos',
      type: 'GEOGRAPHIC',
      description: 'Jos\'s iconic Hamaz Shopping Complex — a hub for Plateau State artisan crafts, electronics, fashion, and everyday goods. Serving Jos traders since 1998.',
      city: 'Jos', state: 'Plateau', country: 'Nigeria',
      latitude: 9.9261, longitude: 8.8908,
      physicalAddress: 'Hamaz Shopping Complex, Ahmadu Bello Way, Jos, Plateau State',
      associationCutPercent: 0.5, accentColor: '#ea580c',
      chairmanSlug: 'hamaz-crafts',
      sellerSlugs: ['hamaz-crafts'],
    },
    {
      name: 'Yola Central Market Complex',
      slug: 'yola-central-market',
      type: 'GEOGRAPHIC',
      description: 'The heartbeat of Adamawa commerce. Yola\'s largest covered market hosts leather craftsmen, fabric traders, electronics dealers, and Fulani artisans under one roof.',
      city: 'Yola', state: 'Adamawa', country: 'Nigeria',
      latitude: 9.2035, longitude: 12.4954,
      physicalAddress: 'Yola Central Market, Bekaji Road, Yola, Adamawa State',
      associationCutPercent: 0.5, accentColor: '#7c3aed',
      chairmanSlug: 'yola-leather-co',
      sellerSlugs: ['yola-leather-co'],
    },
    {
      name: 'Balogun Market Square',
      slug: 'balogun-market-lagos',
      type: 'GEOGRAPHIC',
      description: 'West Africa\'s largest fabric and fashion market. Balogun Market on Lagos Island is the source for Ankara prints, Swiss lace, Aso-oke, George wrappers, and every fabric known to Nigerian fashion.',
      city: 'Lagos Island', state: 'Lagos', country: 'Nigeria',
      latitude: 6.4541, longitude: 3.3947,
      physicalAddress: 'Balogun Market, Lagos Island, Lagos State',
      associationCutPercent: 1.0, accentColor: '#f59e0b',
      chairmanSlug: 'balogun-fabrics',
      sellerSlugs: ['balogun-fabrics', 'ada-styles', 'amara-couture', 'kene-threads'],
    },
    {
      name: 'Computer Village Square',
      slug: 'computer-village-ikeja',
      type: 'GEOGRAPHIC',
      description: 'Africa\'s largest IT market. Ikeja\'s Computer Village is the destination for phones, laptops, accessories, repairs, and everything tech in Nigeria. Over 3,000 vendors on 4 streets.',
      city: 'Ikeja', state: 'Lagos', country: 'Nigeria',
      latitude: 6.6018, longitude: 3.3515,
      physicalAddress: 'Computer Village, Ikeja, Lagos State',
      associationCutPercent: 0.75, accentColor: '#0891b2',
      chairmanSlug: 'cv-accessories-hub',
      sellerSlugs: ['cv-accessories-hub'],
    },
    {
      name: 'Bodija Market Square',
      slug: 'bodija-market-ibadan',
      type: 'GEOGRAPHIC',
      description: 'Ibadan\'s legendary Bodija Market — the largest market in Oyo State. Everything from Adire fabric and local produce to fashion and beauty. The cultural pulse of Ibadan commerce.',
      city: 'Ibadan', state: 'Oyo', country: 'Nigeria',
      latitude: 7.4126, longitude: 3.9010,
      physicalAddress: 'Bodija Market, Bodija, Ibadan, Oyo State',
      associationCutPercent: 0.5, accentColor: '#16a34a',
      chairmanSlug: 'bodija-roots',
      sellerSlugs: ['bodija-roots', 'funmi-thrift-hub', 'temi-beauty'],
    },
    {
      name: 'Wuse Market Abuja',
      slug: 'wuse-market-abuja',
      type: 'GEOGRAPHIC',
      description: 'The FCT\'s premier fashion and lifestyle market. Wuse II Market in Abuja is where diplomats, civil servants, and Abuja\'s fashion-forward crowd shop for quality fashion, accessories, and lifestyle goods.',
      city: 'Abuja', state: 'FCT', country: 'Nigeria',
      latitude: 9.0579, longitude: 7.4951,
      physicalAddress: 'Wuse Market, Wuse II, Abuja, FCT',
      associationCutPercent: 0.75, accentColor: '#be185d',
      chairmanSlug: 'wuse-fashion-abuja',
      sellerSlugs: ['wuse-fashion-abuja'],
    },
    {
      name: 'Nigerian Heritage Artisans',
      slug: 'nigerian-heritage-artisans',
      type: 'CATEGORY',
      description: 'A national community of artisans preserving and evolving Nigerian heritage crafts — Adire, Aso-oke, leather tooling, tin work, beadwork, and more. No location boundary, just authentic Naija craft.',
      associationCutPercent: 0.5, accentColor: '#854d0e',
      chairmanSlug: 'hamaz-crafts',
      sellerSlugs: ['hamaz-crafts', 'ada-styles', 'temi-beauty', 'yola-leather-co'],
    },
  ]

  // Combine all known sellers for lookup
  const allSellersBySlug: Record<string, any> = { ...sellers, ...sqSellers }

  const squareRecords: Record<string, any> = {}

  for (const sq of SQUARES) {
    let squareRec = await prisma.square.findUnique({ where: { slug: sq.slug } })
    if (!squareRec) {
      squareRec = await prisma.square.create({
        data: {
          name: sq.name, slug: sq.slug, type: sq.type as any,
          status: 'ACTIVE' as any,
          description: sq.description,
          city: sq.city ?? null, state: sq.state ?? null, country: sq.country ?? 'Nigeria',
          latitude: sq.latitude ?? null, longitude: sq.longitude ?? null,
          physicalAddress: sq.physicalAddress ?? null,
          associationCutPercent: sq.associationCutPercent,
          accentColor: sq.accentColor,
          memberCount: sq.sellerSlugs.length,
          followerCount: Math.floor(Math.random() * 800) + 50,
        },
      })
    }
    squareRecords[sq.slug] = squareRec

    // Create wallet if absent
    const existingWallet = await prisma.squareWallet.findUnique({ where: { squareId: squareRec.id } })
    if (!existingWallet) {
      await prisma.squareWallet.create({
        data: { squareId: squareRec.id, balance: 0, totalEarned: 0 },
      })
    }

    // ── Chairman officer ──────────────────────────────────────────────────────
    const chairmanSeller = allSellersBySlug[sq.chairmanSlug]
    if (chairmanSeller) {
      await prisma.squareOfficer.upsert({
        where: { squareId_profileId: { squareId: squareRec.id, profileId: chairmanSeller.profileId } },
        update: {},
        create: { squareId: squareRec.id, profileId: chairmanSeller.profileId, role: 'CHAIRMAN' as any },
      })
    }

    // ── Memberships + primarySquareId ─────────────────────────────────────────
    for (const storeSlug of sq.sellerSlugs) {
      const sellerRec = allSellersBySlug[storeSlug]
      if (!sellerRec) continue

      const isPrimary = !sellerRec.primarySquareId
      const existingMem = await prisma.squareMembership.findFirst({
        where: { squareId: squareRec.id, sellerId: sellerRec.id },
      })
      if (!existingMem) {
        await prisma.squareMembership.create({
          data: {
            squareId: squareRec.id, sellerId: sellerRec.id,
            status: 'ACTIVE' as any, isPrimary,
          },
        })
      }

      // Set primarySquareId on SellerProfile if not already set
      if (!sellerRec.primarySquareId && sq.type === 'GEOGRAPHIC') {
        await prisma.sellerProfile.update({
          where: { id: sellerRec.id },
          data: { primarySquareId: squareRec.id },
        })
        sellerRec.primarySquareId = squareRec.id // update in-memory too
      }

      // Back-fill squareId on all products and posts for this seller
      await prisma.products.updateMany({
        where: { sellerId: sellerRec.id, squareId: null },
        data: { squareId: squareRec.id },
      })
      await prisma.post.updateMany({
        where: { authorId: sellerRec.profileId, squareId: null },
        data: { squareId: squareRec.id },
      })
    }
  }

  console.log(`✅ Squares (${SQUARES.length} created with wallets, officers, memberships)`)

  // ── 13. Square-tagged posts for new sellers ─────────────────────────────────
  const sqPost = async (authorId: string, content: string, images: string[], squareId: string, taggedProdIds?: number[]) => {
    return prisma.post.create({
      data: {
        authorId, caption: content.slice(0, 130), content,
        contentType: 'COMMERCE' as any, visibility: 'PUBLIC' as any, allowComments: true, squareId,
        media: { create: images.map((url, i) => ({ url, public_id: `seed/sqpost-${Date.now()}-${i}`, type: 'IMAGE', isBgMusic: false, authorId })) },
        taggedProducts: taggedProdIds?.length ? { create: taggedProdIds.map(productId => ({ productId })) } : undefined,
      },
    })
  }

  const sqProd = (title: string) => sqProdFiltered.find((p: any) => p?.title === title)
  const hamaz   = squareRecords['hamaz-complex-jos']
  const yola    = squareRecords['yola-central-market']
  const balogun = squareRecords['balogun-market-lagos']
  const cv      = squareRecords['computer-village-ikeja']
  const bodija  = squareRecords['bodija-market-ibadan']
  const wuse    = squareRecords['wuse-market-abuja']

  // Hamaz posts
  await sqPost(sqProfiles['hamaz_crafts'].id, 'History in your hands 🏔️ Jos tin mining gave Nigeria its engineering story. Our artisans now transform that tin into art. Each sculpture carries the memory of the plateau. #JosCrafts #PlateauState', [IMGS.jewel3, IMGS.jewel2], hamaz.id, [sqProd('Plateau Tin Art Sculpture')?.id].filter(Boolean))
  await sqPost(sqProfiles['hamaz_crafts'].id, 'Gemstones mined right here in Plateau State 💎 tourmaline, aquamarine, quartz — set by hand into sterling silver. You cannot find this anywhere else in Nigeria. Come to Hamaz Complex Jos 📍', [IMGS.jewel1, IMGS.jewel2], hamaz.id, [sqProd('Jos Plateau Gemstone Necklace')?.id].filter(Boolean))

  // Yola posts
  await sqPost(sqProfiles['yola_leather'].id, 'Adamawa leather has no rival 🐪 This satchel took 4 days to tool, stitch, and finish. Every line is hand-drawn. Every stitch is deliberate. Order yours from Yola 📦', [IMGS.bag1, IMGS.bag2], yola.id, [sqProd('Fulani Embroidered Leather Satchel')?.id].filter(Boolean))
  await sqPost(sqProfiles['yola_leather'].id, 'The Babban Riga is not just clothing — it is a declaration 👑 These are sewn by master tailors who have been sewing for 30+ years in Yola. The embroidery alone takes a full day. #NigerianKing #AdamawaFashion', [IMGS.men1, IMGS.men4], yola.id, [sqProd('Traditional Hausa Babban Riga')?.id].filter(Boolean))

  // Balogun posts
  await sqPost(sqProfiles['balogun_fabrics'].id, '30 years in Balogun Market and we still find new patterns every season 🧵 These Dutch Wax prints are THIS season\'s freshest. 6 yards, ₦12,500. Come see us at Balogun Market Lagos Island or shop online 👇 #BalogunMarket #AnkaraFashion', [IMGS.ankara1, IMGS.ankara2, IMGS.ankara3], balogun.id, [sqProd('Premium Dutch Wax Ankara Print (6 yards)')?.id].filter(Boolean))
  await sqPost(sqProfiles['balogun_fabrics'].id, 'Asoebi season has arrived and Swiss lace is EVERYTHING this year 🤍 We just got fresh stock — ivory, champagne, and dusty rose. Owambe-ready fabrics at Balogun prices. #SwissLace #Asoebi #LagosWedding', [IMGS.dress2, IMGS.dress4], balogun.id, [sqProd('Swiss Voile Lace Fabric (5 yards)')?.id].filter(Boolean))

  // CV posts
  await sqPost(sqProfiles['cv_accessories'].id, 'Computer Village pricing, nationwide delivery 📱 This 65W GaN charger is the real deal — no fake, no clone. Charges your MacBook AND your iPhone at the same time. ₦12,500 and 18-month warranty. #ComputerVillage #TechNaija', [IMGS.beauty1, IMGS.beauty2], cv.id, [sqProd('65W GaN Fast Charger (USB-C + USB-A)')?.id].filter(Boolean))
  await sqPost(sqProfiles['cv_accessories'].id, 'ANC earbuds for under ₦20k — yes we said it 🎧 These TWS earbuds actually cancel Lagos traffic noise. 8 hours battery life. IPX4 sweatproof. Available in black and white. Shop now 👇 #Naijatech #CVPrices', [IMGS.beauty2, IMGS.beauty3], cv.id, [sqProd('True Wireless Earbuds (ANC)')?.id].filter(Boolean))

  // Bodija posts
  await sqPost(sqProfiles['bodija_roots'].id, 'Ibadan Adire is a different kind of beautiful 💙 The cassava-paste resist technique has been used in Bodija for over 200 years. Each pattern tells a story. 3 yards for ₦8,500. 100% authentic, 100% Ibadan-made 🙏 #Adire #IbadanFashion', [IMGS.ankara2, IMGS.ankara4], bodija.id, [sqProd('Ibadan Adire Eleko Fabric (3 yards)')?.id].filter(Boolean))
  await sqPost(sqProfiles['bodija_roots'].id, 'Your mama\'s kitchen secret 🌶️ Pure Iru (locust beans) from Bodija Market. Sun-dried, no preservatives, sealed fresh. This is what makes Yoruba soup different from the rest. ₦1,800 per pack. Ship nationwide 🚚', [IMGS.beauty3, IMGS.beauty1], bodija.id, [sqProd('Ibadan Locust Bean Seasoning (Iru) Pack')?.id].filter(Boolean))

  // Wuse posts
  await sqPost(sqProfiles['wuse_fashion'].id, 'Corporate Ankara is the Abuja uniform and we are not complaining 💼 This structured blazer goes straight from boardroom to owambe. Custom-tailored in Wuse, ships in 5 days. #AbujFashion #WuseFashion #CorporateAnkara', [IMGS.dress1, IMGS.ankara1], wuse.id, [sqProd('Corporate Ankara Blazer (Women)')?.id].filter(Boolean))
  await sqPost(sqProfiles['wuse_fashion'].id, 'Eid Mubarak to all our customers 🌙 Our senator suit is back in fresh linen — navy, charcoal, cream. Abuja-made, tailored to your measurements. DM "SENATOR" to order. ₦52,000 full set. #AbujaSenator #EidFashion', [IMGS.men2, IMGS.men1], wuse.id, [sqProd('Abuja Senator Suit (Men)')?.id].filter(Boolean))

  console.log('✅ Square posts (12 created)')

  console.log('\n🎉 Seed complete!')
  console.log('─────────────────────────────────')
  console.log('Seller accounts:')
  console.log('  ada@peppr.test        / test1234  (Ada Styles — Balogun Market)')
  console.log('  amara@peppr.test      / test1234  (Amara Couture — Balogun Market)')
  console.log('  kene@peppr.test       / test1234  (Kene Threads — Balogun Market)')
  console.log('  funmi@peppr.test      / test1234  (Funmi Thrift Hub — Bodija Market)')
  console.log('  temi@peppr.test       / test1234  (Temi Beauty — Bodija Market)')
  console.log('  hamaz@peppr.test      / test1234  (Hamaz Crafts — Hamaz Complex Jos)')
  console.log('  yola@peppr.test       / test1234  (Yola Leather Co — Yola Central Market)')
  console.log('  balogun@peppr.test    / test1234  (Balogun Fabrics — Balogun Market Lagos)')
  console.log('  cvtech@peppr.test     / test1234  (CV Accessories Hub — Computer Village)')
  console.log('  bodija@peppr.test     / test1234  (Bodija Roots — Bodija Market Ibadan)')
  console.log('  wuse@peppr.test       / test1234  (Wuse Fashion Abuja — Wuse Market)')
  console.log('Buyer accounts:')
  console.log('  chidi@peppr.test      / test1234')
  console.log('  sade@peppr.test       / test1234')
  console.log('  emeka@peppr.test      / test1234')
  console.log('  ngozi@peppr.test      / test1234')
  console.log('  bayo@peppr.test       / test1234')
  console.log('\nSquares seeded:')
  console.log('  📍 Hamaz Complex, Jos (Plateau) — 9.9261° N, 8.8908° E')
  console.log('  📍 Yola Central Market (Adamawa) — 9.2035° N, 12.4954° E')
  console.log('  📍 Balogun Market Square (Lagos Island) — 6.4541° N, 3.3947° E')
  console.log('  📍 Computer Village Square (Ikeja, Lagos) — 6.6018° N, 3.3515° E')
  console.log('  📍 Bodija Market Square (Ibadan, Oyo) — 7.4126° N, 3.9010° E')
  console.log('  📍 Wuse Market Abuja (FCT) — 9.0579° N, 7.4951° E')
  console.log('  🏷️  Nigerian Heritage Artisans (Category Square)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
