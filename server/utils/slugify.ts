// server/utils/slugify.ts
import slugify from 'slugify'
import { prisma } from './db' // or '../database/client' if you prefer

export async function generateUniqueSlug(
  model: 'products' | 'category' | 'sellerProfile',
  baseString: string,
  id?: string | number,
): Promise<string> {
  const base = slugify(baseString, { lower: true, strict: true })
  let slug = base || 'item'
  let counter = 1

  const slugField = model === 'sellerProfile' ? 'store_slug' : 'slug'

  while (true) {
    const exists = await (prisma as any)[model].findUnique({
      where: { [slugField]: slug },
    })

    if (!exists || (id && exists.id === id)) {
      return slug
    }

    slug = `${base}-${counter++}`
  }
}
