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

  console.log('\n🎉 Seed complete!')
  console.log('─────────────────────────────────')
  console.log('Seller accounts:')
  console.log('  ada@peppr.test        / test1234  (Ada Styles)')
  console.log('  amara@peppr.test      / test1234  (Amara Couture)')
  console.log('  kene@peppr.test       / test1234  (Kene Threads)')
  console.log('  funmi@peppr.test      / test1234  (Funmi Thrift Hub)')
  console.log('  temi@peppr.test       / test1234  (Temi Beauty)')
  console.log('Buyer accounts:')
  console.log('  chidi@peppr.test      / test1234')
  console.log('  sade@peppr.test       / test1234')
  console.log('  emeka@peppr.test      / test1234')
  console.log('  ngozi@peppr.test      / test1234')
  console.log('  bayo@peppr.test       / test1234')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
