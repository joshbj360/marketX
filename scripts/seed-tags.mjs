/**
 * seed-tags.mjs
 * Creates common hashtags and assigns them to existing products + posts.
 *
 * Run: node --env-file=.env scripts/seed-tags.mjs
 *
 * NOTE: Tags → Post is not in the schema yet (PostTags junction needed).
 *       This script seeds Tags → Products only, so the Discover > Tags tab
 *       shows real data.
 */

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// ── Tag definitions ──────────────────────────────────────────────────────────
const TAG_NAMES = [
  'fashion',
  'ootd',
  'streetwear',
  'vintage',
  'sneakers',
  'luxury',
  'thrift',
  'handmade',
  'electronics',
  'gadgets',
  'beauty',
  'skincare',
  'haircare',
  'jewellery',
  'accessories',
  'homedecor',
  'lifestyle',
  'fitness',
  'foodie',
  'books',
  'gaming',
  'kids',
  'menswear',
  'womenswear',
  'ankara',
]

// Simple keyword → tag mapping for auto-assignment
// If a product title/description contains any of these keywords, it gets tagged
const KEYWORD_MAP = {
  fashion:    ['fashion', 'style', 'outfit', 'wear', 'cloth', 'dress', 'shirt', 'trouser', 'skirt', 'blouse'],
  ootd:       ['outfit', 'look', 'style', 'ootd'],
  streetwear: ['street', 'hoodie', 'cap', 'jogger', 'tracksuit', 'sweatshirt'],
  vintage:    ['vintage', 'retro', 'classic', 'old'],
  sneakers:   ['sneaker', 'shoe', 'boot', 'trainer', 'nike', 'adidas'],
  luxury:     ['luxury', 'premium', 'exclusive', 'designer', 'gucci', 'louis'],
  thrift:     ['thrift', 'used', 'second', 'pre-owned', 'pre-loved'],
  handmade:   ['handmade', 'handcrafted', 'artisan', 'bespoke', 'custom'],
  electronics:['phone', 'laptop', 'computer', 'tablet', 'charger', 'cable', 'tech', 'electronic'],
  gadgets:    ['gadget', 'device', 'airpod', 'earphone', 'headphone', 'smartwatch', 'power bank'],
  beauty:     ['beauty', 'makeup', 'cosmetic', 'lipstick', 'foundation', 'blush', 'eyeshadow'],
  skincare:   ['skincare', 'serum', 'moisturis', 'toner', 'sunscreen', 'cleanser', 'face wash'],
  haircare:   ['hair', 'wig', 'weave', 'braid', 'lace front', 'shampoo', 'conditioner'],
  jewellery:  ['jewel', 'ring', 'necklace', 'bracelet', 'earring', 'gold', 'silver', 'bead'],
  accessories:['bag', 'purse', 'wallet', 'belt', 'hat', 'scarf', 'sunglasses', 'watch', 'accessory'],
  homedecor:  ['home', 'decor', 'cushion', 'curtain', 'rug', 'vase', 'lamp', 'furniture', 'bedding'],
  lifestyle:  ['lifestyle', 'wellness', 'self-care', 'living'],
  fitness:    ['fitness', 'gym', 'workout', 'protein', 'supplement', 'yoga', 'sport', 'exercise'],
  foodie:     ['food', 'snack', 'drink', 'spice', 'sauce', 'tea', 'coffee', 'chocolate'],
  books:      ['book', 'novel', 'journal', 'planner', 'stationery'],
  gaming:     ['game', 'gaming', 'console', 'controller', 'playstation', 'xbox', 'nintendo'],
  kids:       ['kids', 'children', 'baby', 'toddler', 'toy', 'school bag', 'diaper'],
  menswear:   ['men', 'agbada', 'native', 'kaftan', 'senator'],
  womenswear: ['women', 'ladies', 'gown', 'ankara'],
  ankara:     ['ankara', 'aso-oke', 'kente', 'dashiki', 'adire', 'batik'],
}

function matchTags(text) {
  const lower = (text || '').toLowerCase()
  return Object.entries(KEYWORD_MAP)
    .filter(([, keywords]) => keywords.some((kw) => lower.includes(kw)))
    .map(([tag]) => tag)
}

async function main() {
  console.log('🏷️  Seeding tags...')

  // 1. Upsert all tags
  const tagRecords = await Promise.all(
    TAG_NAMES.map((name) =>
      prisma.tag.upsert({
        where: { name },
        create: { name },
        update: {},
      }),
    ),
  )

  const tagByName = new Map(tagRecords.map((t) => [t.name, t]))
  console.log(`✅ ${tagRecords.length} tags ready`)

  // 2. Fetch all published products
  const products = await prisma.products.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, title: true, description: true },
  })

  console.log(`📦 ${products.length} published products found`)

  let productTagsCreated = 0
  let productTagsSkipped = 0

  for (const product of products) {
    const matchedTagNames = matchTags(`${product.title} ${product.description ?? ''}`)

    // Always add at least 1-3 random tags so every product shows up
    if (matchedTagNames.length === 0) {
      const fallbacks = ['fashion', 'lifestyle', 'accessories']
      matchedTagNames.push(...fallbacks.slice(0, Math.ceil(Math.random() * 2) + 1))
    }

    // Cap at 5 tags per product
    const selected = [...new Set(matchedTagNames)].slice(0, 5)

    for (const tagName of selected) {
      const tag = tagByName.get(tagName)
      if (!tag) continue
      try {
        await prisma.productTags.upsert({
          where: { productId_tagId: { productId: product.id, tagId: tag.id } },
          create: { productId: product.id, tagId: tag.id },
          update: {},
        })
        productTagsCreated++
      } catch {
        productTagsSkipped++
      }
    }
  }

  console.log(`✅ ${productTagsCreated} product-tag links created (${productTagsSkipped} skipped/existing)`)

  // 3. Summary
  const tagCounts = await prisma.tag.findMany({
    where: { products: { some: {} } },
    select: { name: true, _count: { select: { products: true } } },
    orderBy: { products: { _count: 'desc' } },
    take: 10,
  })

  console.log('\n📊 Top tags by product count:')
  tagCounts.forEach((t) => console.log(`   #${t.name}: ${t._count.products} products`))
  console.log('\n🎉 Done! Open /discover?tab=tags to see them.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
