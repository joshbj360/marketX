// POST /api/user/addresses — save a new address
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { prisma } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const {
    label,
    name,
    address,
    county,
    state,
    zipcode,
    country,
    phone,
    setAsDefault,
  } = body

  if (!name?.trim() || !address?.trim() || !country?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name, address and country are required',
    })
  }

  // If setAsDefault, clear existing defaults first
  if (setAsDefault) {
    await prisma.addresses.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    })
  }

  // If this is the first address, make it default automatically
  const count = await prisma.addresses.count({ where: { userId: user.id } })
  const isDefault = setAsDefault || count === 0

  const saved = await prisma.addresses.create({
    data: {
      userId: user.id,
      label: label?.trim() || null,
      name: name.trim(),
      address: address.trim(),
      county: county?.trim() || '',
      state: state?.trim() || '',
      zipcode: zipcode?.trim() || '',
      country: country.trim(),
      phone: phone?.trim() || '',
      isDefault,
    },
  })

  return { success: true, data: saved }
})
