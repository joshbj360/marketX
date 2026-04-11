// GET /api/music/search — proxies Jamendo API, keeping client_id server-side
// Register free at https://developer.jamendo.com to get a JAMENDO_CLIENT_ID

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const clientId = config.jamendoClientId

  if (!clientId) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Music API not configured. Set JAMENDO_CLIENT_ID in .env',
    })
  }

  const query = getQuery(event)

  const params: Record<string, any> = {
    client_id: clientId,
    format: 'json',
    limit: Number(query.limit) || 20,
    offset: Number(query.offset) || 0,
    // mp31 = 96 kbps stream URL in `audio` field
    audioformat: 'mp31',
    imagesize: 200,
    order: 'popularity_total',
    // Do NOT include musicinfo — it filters to only tracks with full metadata attached,
    // resulting in an empty result set for many genre/search combos.
  }

  if (query.q) params.search = String(query.q)
  if (query.genre && query.genre !== 'all') params.tags = String(query.genre)

  try {
    const res: any = await $fetch('https://api.jamendo.com/v3.0/tracks/', {
      query: params,
    })

    // Surface Jamendo API-level errors (code 0 = success)
    if (res?.headers?.code !== 0) {
      console.warn('[music/search] Jamendo error:', res?.headers)
      throw createError({
        statusCode: 502,
        statusMessage: res?.headers?.error_message || 'Jamendo API error',
      })
    }

    const tracks = (res.results ?? []).map((t: any) => ({
      id: String(t.id),
      name: t.name,
      artist: t.artist_name,
      duration: Number(t.duration),
      // `audio` = streamable URL (requires audioformat param above)
      url: t.audio,
      downloadUrl: t.audiodownload,
      // Jamendo returns album_image, not image
      image: t.album_image ?? null,
      tags: (t.tags ?? '').split(' ').filter(Boolean),
    }))

    return { success: true, data: tracks }
  } catch (err: any) {
    // Re-throw H3 errors (createError above) as-is
    if (err.statusCode) throw err

    console.error('[music/search] fetch error:', err?.message)
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to reach music provider',
    })
  }
})
