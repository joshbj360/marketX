/**
 * seed-store-locations.mjs
 * Seeds realistic lat/lng coordinates to seller profiles for map testing.
 * Locations are spread across Lagos, Abuja, Port Harcourt, Accra, Nairobi.
 *
 * Run: node --env-file=.env scripts/seed-store-locations.mjs
 */

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// Clusters: [centerLat, centerLng, radiusKm, city, state]
const CLUSTERS = [
  [6.5244,  3.3792,  8,  'Lagos',         'Lagos',   'NG'],  // Lagos Island / VI
  [6.4541,  3.3947,  6,  'Lekki',         'Lagos',   'NG'],  // Lekki
  [6.6018,  3.3515,  5,  'Ikeja',         'Lagos',   'NG'],  // Ikeja GRA
  [9.0765,  7.3986,  7,  'Abuja',         'FCT',     'NG'],  // Abuja CBD
  [4.8156,  7.0498,  6,  'Port Harcourt', 'Rivers',  'NG'],  // PH
  [5.6037,  0.1870,  8,  'Accra',         'Greater Accra', 'GH'],
  [-1.2921, 36.8219, 9,  'Nairobi',       'Nairobi', 'KE'],
]

function jitter(centerLat, centerLng, radiusKm) {
  const r = radiusKm / 111 // degrees per km (approx)
  const lat = centerLat + (Math.random() * 2 - 1) * r
  const lng = centerLng + (Math.random() * 2 - 1) * r
  return { lat, lng }
}

async function main() {
  console.log('📍 Seeding store locations...\n')

  const sellers = await prisma.sellerProfile.findMany({
    where: { is_active: true },
    select: { id: true, store_name: true, latitude: true, longitude: true },
  })

  console.log(`🏪 ${sellers.length} active sellers found`)

  let updated = 0
  let skipped = 0

  for (let i = 0; i < sellers.length; i++) {
    const seller = sellers[i]

    // Skip if already has real coords
    if (seller.latitude && seller.longitude) {
      skipped++
      continue
    }

    // Round-robin across clusters
    const cluster = CLUSTERS[i % CLUSTERS.length]
    const { lat, lng } = jitter(cluster[0], cluster[1], cluster[2])

    const city = cluster[3]
    const state = cluster[4]
    const locationLabel = `${city}, ${state}`

    await prisma.sellerProfile.update({
      where: { id: seller.id },
      data: {
        latitude: parseFloat(lat.toFixed(6)),
        longitude: parseFloat(lng.toFixed(6)),
        city,
        state,
        locationLabel,
        hideLocation: false,
      },
    })

    console.log(`  ✅ ${seller.store_name ?? seller.id} → ${locationLabel} (${lat.toFixed(4)}, ${lng.toFixed(4)})`)
    updated++
  }

  console.log(`\n✅ ${updated} stores updated with coordinates`)
  console.log(`⏭️  ${skipped} stores already had coordinates`)
  console.log('\n🗺️  Open /map to see them on the map!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
