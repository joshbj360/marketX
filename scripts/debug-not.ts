import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Check what force mode returns
  const products = await prisma.products.findMany({
    where: {
      status: 'PUBLISHED',
      NOT: [
        { bannerImageUrl: { contains: 'cloudinary' } },
        { bannerImageUrl: { contains: 'res.cloudinary' } }
      ]
    },
    select: { id: true, bannerImageUrl: true },
    take: 5
  })
  console.log('Products matching NOT cloudinary:', products.length)
  console.log(products)
}

main().finally(() => (prisma as any).$disconnect())