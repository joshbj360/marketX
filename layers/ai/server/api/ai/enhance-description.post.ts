// POST /api/ai/enhance-description
// Takes a raw product description (plain text or HTML) and returns
// a beautifully formatted HTML description. Uses GPT-4o-mini (text-only, ~$0.0003/call).

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiKey = config.openaiApiKey

  if (!apiKey) {
    throw createError({ statusCode: 503, statusMessage: 'AI service not configured' })
  }

  const body = await readBody(event)
  const { description } = body

  if (!description || typeof description !== 'string' || !description.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'description is required' })
  }

  // Strip HTML tags to get plain text for the prompt
  const plainText = description.replace(/<[^>]*>/g, '').trim()

  if (plainText.length < 5) {
    throw createError({ statusCode: 400, statusMessage: 'Description is too short to enhance' })
  }

  const systemPrompt = `You are an expert e-commerce copywriter for an African fashion & lifestyle marketplace.
Your task is to take a raw product description and return a beautifully structured HTML version.

Rules:
- Return ONLY raw HTML — no markdown, no code fences, no explanation
- Use <p>, <strong>, <ul>, <li>, <h3> tags only
- Structure: start with a compelling 1-2 sentence hook in <p>, then a <h3>Key Features</h3> with a <ul> of 3-6 bullet points, then optionally a short closing <p> with care/sizing/occasion note
- Keep it concise and punchy — e-commerce buyers scan, they don't read essays
- Enhance the language: make it aspirational and benefit-focused, not just feature-listing
- Do not invent facts. Only use what is given.`

  const userPrompt = `Enhance this product description:\n\n${plainText}`

  try {
    const response: any = await $fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: {
        model: 'gpt-4o-mini',
        max_tokens: 600,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      },
    })

    const html: string = response.choices?.[0]?.message?.content?.trim() || ''

    if (!html) {
      throw createError({ statusCode: 500, statusMessage: 'AI returned empty response' })
    }

    // Strip accidental code fences just in case
    const cleanHtml = html
      .replace(/^```(?:html)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    return { success: true, html: cleanHtml }
  } catch (err: any) {
    const status = err?.status || err?.statusCode || 500
    const detail =
      err?.data?.error?.message || err?.data?.message || err?.message || 'Unknown error'
    logger.error(`[POST /api/ai/enhance-description] ${status}: ${detail}`)
    throw createError({ statusCode: status, statusMessage: `AI enhancement failed: ${detail}` })
  }
})
