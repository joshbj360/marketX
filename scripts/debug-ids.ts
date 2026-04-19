import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const products = await prisma.products.findMany({
    where: { id: { in: [25, 73] } },
    select: { id: true, bannerImageUrl: true }
  })
  console.log(JSON.stringify(products, null, 2))
}

main().finally(() => (prisma as any).$disconnect())