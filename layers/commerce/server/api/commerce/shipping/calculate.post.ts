// POST /api/commerce/shipping/calculate — returns shipping cost for a country
import { z } from 'zod'


const schema = z.object({
  countryCode: z.string().min(2).max(2).toUpperCase(),
  weightKg: z.number().positive().optional().default(0.5),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { countryCode, weightKg } = schema.parse(body)

  const zones = await prisma.globalShippingZone.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })

  const zone =
    zones.find((z) => z.countries.includes(countryCode)) ??
    zones.find((z) => z.name === 'Rest of World') ??
    zones[zones.length - 1]

  if (!zone) {
    return {
      success: true,
      data: { cost: 0, zone: null, estimatedDays: 'Unknown' },
    }
  }

  const cost = zone.baseRate + Math.round(zone.perKgRate * weightKg)

  return {
    success: true,
    data: {
      cost,
      zoneId: zone.id,
      zoneName: zone.name,
      estimatedDays: zone.estimatedDays,
    },
  }
})
