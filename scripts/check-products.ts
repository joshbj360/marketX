import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const products = await prisma.products.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, bannerImageUrl: true },
    take: 10,
  })
  console.log('Products with PUBLISHED status:')
  console.log(JSON.stringify(products, null, 2))

  const count = await prisma.products.count({
    where: {
      status: 'PUBLISHED',
      OR: [{ bannerImageUrl: null }, { bannerImageUrl: '' }],
    },
  })
  console.log(`\nProducts needing images: ${count}`)
}

main().finally(() => { (prisma as any).$disconnect() })