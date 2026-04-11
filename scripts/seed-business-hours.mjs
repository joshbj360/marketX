/**
 * seed-business-hours.mjs
 * Seeds realistic business hours to seller profiles.
 * Run: node --env-file=.env scripts/seed-business-hours.mjs
 */
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const PRESETS = [
  // 9-6 weekdays + Sat, closed Sun
  { mon:{open:'09:00',close:'18:00'}, tue:{open:'09:00',close:'18:00'}, wed:{open:'09:00',close:'18:00'}, thu:{open:'09:00',close:'18:00'}, fri:{open:'09:00',close:'18:00'}, sat:{open:'10:00',close:'16:00'}, sun:{closed:true} },
  // 8-8 every day
  { mon:{open:'08:00',close:'20:00'}, tue:{open:'08:00',close:'20:00'}, wed:{open:'08:00',close:'20:00'}, thu:{open:'08:00',close:'20:00'}, fri:{open:'08:00',close:'20:00'}, sat:{open:'08:00',close:'20:00'}, sun:{open:'10:00',close:'18:00'} },
  // 10-7 Mon-Sat, closed Sun
  { mon:{open:'10:00',close:'19:00'}, tue:{open:'10:00',close:'19:00'}, wed:{open:'10:00',close:'19:00'}, thu:{open:'10:00',close:'19:00'}, fri:{open:'10:00',close:'19:00'}, sat:{open:'10:00',close:'19:00'}, sun:{closed:true} },
]

async function main() {
  const sellers = await prisma.sellerProfile.findMany({
    where: { is_active: true },
    select: { id: true, store_name: true },
  })

  for (let i = 0; i < sellers.length; i++) {
    const hours = PRESETS[i % PRESETS.length]
    await prisma.sellerProfile.update({
      where: { id: sellers[i].id },
      data: { businessHours: hours, timezone: 'Africa/Lagos' },
    })
    console.log(`✅ ${sellers[i].store_name ?? sellers[i].id}`)
  }

  console.log(`\n✅ ${sellers.length} sellers updated with business hours`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
