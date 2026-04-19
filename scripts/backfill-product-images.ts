/**
 * backfill-product-images.ts
 * 
 * Backfills product images using Picsum (reliable for MVP demo).
 * Later: replace getImageForCategory() with real images.
 *
 * Run: npx tsx scripts/backfill-product-images.ts
 * Force re-backfill: npx tsx scripts/backfill-product-images.ts --force
 */

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const getImageForCategory = (category: string, index: number): string => {
  const seeds: Record<string, string> = {
    "women's fashion": 'fashion1',
    "men's fashion": 'menswear',
    'footwear': 'sneakers',
    'bags & luggage': 'handbag',
    'accessories': 'fashion',
    'beauty & care': 'beauty',
    'jewelry & watches': 'jewelry',
    'kids & baby': 'kids',
    'sports & active': 'fitness',
    'nigerian heritage': 'ankara',
    'thrift & pre-loved': 'vintage',
    'home & living': 'home',
    'electronics': 'laptop',
    'fashion': 'fashion',
    'food & grocery': 'food',
    'beauty': 'makeup',
    'sports': 'gym',
    'books': 'books',
    'gaming': 'gaming',
  }
  const seed = seeds[category.toLowerCase()] ?? `product${index}`
  return `https://picsum.photos/seed/${seed}/800/600`
}

async function processProducts(force = false) {
  const categories = await prisma.category.findMany({ take: 20 })

  const productWhere = force
    ? { 
      status: 'PUBLISHED',
      NOT: [
        { bannerImageUrl: { contains: 'cloudinary' } },
        { bannerImageUrl: { contains: 'res.cloudinary' } }
      ]
    }
    : {
        status: 'PUBLISHED',
        OR: [
          { bannerImageUrl: { equals: null } },
          { bannerImageUrl: { equals: '' } },
        ],
      }

  const categoryIdsWithMissingImages = await prisma.productCategories.findMany({
    where: { product: productWhere },
    include: { category: true, product: { select: { id: true, title: true } } },
  })

  const productsByCategory = new Map<number, typeof categoryIdsWithMissingImages>()
  for (const pc of categoryIdsWithMissingImages) {
    const list = productsByCategory.get(pc.categoryId) ?? []
    list.push(pc)
    productsByCategory.set(pc.categoryId, list)
  }

  console.log(`📂 Found ${categories.length} categories to process`)

  let updated = 0
  let failed = 0
  let skipped = 0

  for (const category of categories) {
    const products = productsByCategory.get(category.id) ?? []
    if (products.length === 0) {
      skipped += 1
      continue
    }

    console.log(`\n📦 "${category.name}": ${products.length} products`)

    const imageUrl = getImageForCategory(category.name, category.id)
    console.log(`  🖼️  ${imageUrl}`)

    for (const pc of products) {
      try {
        // Update bannerImageUrl
        await prisma.products.update({
          where: { id: pc.product.id },
          data: { bannerImageUrl: imageUrl },
        })

        // Also add to Media table if no media exists
        const existingMedia = await prisma.media.findFirst({
          where: { productId: pc.product.id }
        })
        
        if (!existingMedia) {
          // Need sellerId for Media - get from product
          const product = await prisma.products.findUnique({
            where: { id: pc.product.id },
            select: { sellerId: true }
          })
          
          if (product?.sellerId) {
            // Find a profile for this seller
            const profile = await prisma.profile.findFirst({
              where: { sellerProfile: { some: { id: product.sellerId } } },
              select: { id: true }
            })
            
            if (profile) {
              await prisma.media.create({
                data: {
                  url: imageUrl,
                  type: 'IMAGE',
                  productId: pc.product.id,
                  sellerId: product.sellerId,
                  authorId: profile.id,
                }
              })
            }
          }
        }
        
        updated++
      } catch (error) {
        console.error(`  ❌ ${pc.product.id}:`, error)
        failed++
      }
    }
  }

  console.log(`\n✅ Updated: ${updated}, Failed: ${failed}, Skipped: ${skipped}`)
}

async function processPosts() {
  const posts = await prisma.post.findMany({
    where: { isProductPost: true, media: { none: {} } },
    take: 100,
  })

  let updated = 0
  let failed = 0

  for (const post of posts) {
    let categoryName = 'lifestyle'
    
    if (post.sourceProductId) {
      const pc = await prisma.productCategories.findFirst({
        where: { productId: post.sourceProductId },
        include: { category: { select: { name: true } } },
      })
      categoryName = pc?.category?.name ?? 'lifestyle'
    }

    const imageUrl = getImageForCategory(categoryName, updated)

    try {
      await prisma.media.create({
        data: {
          url: imageUrl,
          type: 'IMAGE',
          postId: post.id,
        },
      })
      updated++
    } catch (error) {
      console.error(`  ❌ ${post.id}:`, error)
      failed++
    }
  }

  console.log(`\n✅ Posts: ${updated}, Failed: ${failed}`)
}

async function main() {
  const args = process.argv.slice(2)
  const target = args[0] === 'posts' ? 'posts' : 'products'
  const force = args.includes('--force')
  
  console.log(`🚀 Backfill: ${target} ${force ? '(forced)' : ''}`)
  console.log('')

  if (target === 'posts') {
    await processPosts()
  } else {
    await processProducts(force)
  }

  console.log('\n🎉 Done!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => (prisma as any).$disconnect())