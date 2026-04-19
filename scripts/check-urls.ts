import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Check Cloudinary URLs
  const cloudinaryProducts = await prisma.products.findMany({
    where: {
      status: 'PUBLISHED',
      bannerImageUrl: { contains: 'cloudinary' },
    },
    select: { id: true, title: true, bannerImageUrl: true },
    take: 5,
  })
  console.log('Cloudinary URLs:', cloudinaryProducts.length)
  if (cloudinaryProducts.length) {
    console.log(cloudinaryProducts[0].bannerImageUrl)
  }

  // Check picsum URLs
  const picsumProducts = await prisma.products.findMany({
    where: {
      status: 'PUBLISHED',
      bannerImageUrl: { contains: 'picsum' },
    },
    select: { id: true, title: true, bannerImageUrl: true },
    take: 3,
  })
  console.log('\nPicsum URLs:', picsumProducts.length)

  // All banner URLs
  const all = await prisma.products.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, bannerImageUrl: true },
    take: 10,
  })
  console.log('\nAll URLs:')
  all.forEach(p => console.log(`  ${p.id}: ${p.bannerImageUrl?.slice(0, 60)}`))
}

main().finally(() => (prisma as any).$disconnect())