/**
 * seed-post-hashtags.mjs
 * Appends #hashtags to existing post captions and creates PostTags DB links.
 *
 * Run: node --env-file=.env scripts/seed-post-hashtags.mjs
 */

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// keyword → tag name (must match tags already in the Tag table)
const KEYWORD_MAP = {
  ankara:     ['ankara', 'adire', 'aso-oke', 'aso oke', 'kente', 'dashiki', 'aseoke'],
  fashion:    ['fashion', 'style', 'outfit', 'look', 'wear', 'fit', 'drip'],
  ootd:       ['ootd', 'outfit', 'look of the day', 'fit check'],
  handmade:   ['handmade', 'handcrafted', 'hand-strung', 'handwoven', 'hand-sewn', 'artisan', 'bespoke'],
  jewellery:  ['jewel', 'bead', 'waist bead', 'cowrie', 'ring', 'necklace', 'bracelet', 'earring'],
  menswear:   ['agbada', 'kaftan', 'senator', 'native', 'naija men', 'traditional wear', 'men'],
  womenswear: ['women', 'ladies', 'gown', 'boss babe', 'girl'],
  luxury:     ['luxury', 'premium', 'exclusive', 'designer', 'high-end'],
  streetwear: ['street', 'hoodie', 'jogger', 'streetwear', 'drip'],
  accessories:['bag', 'tote', 'purse', 'wallet', 'belt', 'accessory'],
  beauty:     ['beauty', 'makeup', 'glam', 'glow', 'flawless'],
  skincare:   ['skincare', 'skin', 'serum', 'glow'],
  lifestyle:  ['lifestyle', 'living', 'daily', 'vibe', 'mood', 'culture'],
  vintage:    ['vintage', 'retro', 'classic', 'old school'],
  lagos:      ['lagos', 'lasgidi', 'eko'],
  naija:      ['naija', 'nigeria', 'nigerian', '9ja'],
}

// Always append 1-2 of these if nothing else matches
const FALLBACK_TAGS = ['fashion', 'lifestyle', 'naija']

function pickTags(caption) {
  const lower = (caption || '').toLowerCase()
  const matched = Object.entries(KEYWORD_MAP)
    .filter(([, kws]) => kws.some((kw) => lower.includes(kw)))
    .map(([tag]) => tag)
  if (matched.length === 0) return FALLBACK_TAGS.slice(0, 2)
  return [...new Set(matched)].slice(0, 4)
}

async function main() {
  console.log('🏷️  Seeding post hashtags...\n')

  const posts = await prisma.post.findMany({
    select: { id: true, caption: true },
  })
  console.log(`📝 ${posts.length} posts found`)

  // Ensure all tags we'll use exist
  const allTagNames = [...new Set([
    ...Object.keys(KEYWORD_MAP),
    ...FALLBACK_TAGS,
    'lagos',
    'naija',
  ])]

  await Promise.all(
    allTagNames.map((name) =>
      prisma.tag.upsert({ where: { name }, create: { name }, update: {} }),
    ),
  )

  const tagRecords = await prisma.tag.findMany({
    where: { name: { in: allTagNames } },
    select: { id: true, name: true },
  })
  const tagByName = new Map(tagRecords.map((t) => [t.name, t]))

  let captionsUpdated = 0
  let postTagsCreated = 0

  for (const post of posts) {
    const tagNames = pickTags(post.caption)
    const hashtagSuffix = tagNames.map((t) => `#${t}`).join(' ')

    // Avoid double-appending — skip if caption already has #
    const alreadyHasHashtags = (post.caption || '').includes('#')

    if (!alreadyHasHashtags) {
      const updatedCaption = `${(post.caption || '').trim()} ${hashtagSuffix}`.trim()
      await prisma.post.update({
        where: { id: post.id },
        data: { caption: updatedCaption },
      })
      captionsUpdated++
    }

    // Always (re-)create PostTags DB links regardless
    for (const tagName of tagNames) {
      const tag = tagByName.get(tagName)
      if (!tag) continue
      try {
        await prisma.postTags.upsert({
          where: { postId_tagId: { postId: post.id, tagId: tag.id } },
          create: { postId: post.id, tagId: tag.id },
          update: {},
        })
        postTagsCreated++
      } catch {
        // already exists
      }
    }
  }

  console.log(`✅ ${captionsUpdated} captions updated with hashtags`)
  console.log(`✅ ${postTagsCreated} PostTags DB links created`)

  // Show preview
  const sample = await prisma.post.findFirst({
    where: { caption: { contains: '#' } },
    select: { caption: true },
  })
  if (sample) {
    console.log(`\n📋 Sample caption:\n   "${sample.caption?.slice(0, 120)}..."`)
  }

  console.log('\n🎉 Done! Hashtags are now clickable in PostCard → /discover?tab=tags')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
