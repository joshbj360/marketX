import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const products = await prisma.products.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, bannerImageUrl: true },
    orderBy: { id: 'asc' },
  })
  
  let cloudinaryCount = 0
  let cloudinaryIds: number[] = []
  
  for (const p of products) {
    if (p.bannerImageUrl?.includes('cloudinary') || p.bannerImageUrl?.includes('res.cloudinary')) {
      cloudinaryCount++
      cloudinaryIds.push(p.id)
    }
  }
  
  console.log(`Cloudinary: ${cloudinaryCount} products`)
  console.log('IDs:', cloudinaryIds)
}

main().finally(() => (prisma as any).$disconnect())