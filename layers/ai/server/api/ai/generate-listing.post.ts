// POST /api/ai/generate-listing
// Accepts a base64 product image and returns AI-generated listing data + social captions
// Uses OpenAI GPT-4o vision

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiKey = config.openaiApiKey

  if (!apiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'AI service not configured',
    })
  }

  const body = await readBody(event)
  const { imageBase64, mimeType, optionalHint } = body

  if (!imageBase64 || !mimeType) {
    throw createError({
      statusCode: 400,
      statusMessage: 'imageBase64 and mimeType are required',
    })
  }

  // Strip data URI prefix if client sent it (e.g. "data:image/jpeg;base64,...")
  const cleanBase64 = (imageBase64 as string).replace(/^data:[^;]+;base64,/, '')
  const dataUrl = `data:${mimeType};base64,${cleanBase64}`

  const systemPrompt = `You are an expert e-commerce copywriter and social media strategist for an African fashion & lifestyle marketplace.
Your job is to analyze a product image and generate compelling, platform-optimized listing content.
Always respond with a valid JSON object only — no markdown, no explanation, just raw JSON.`

  const userPrompt = `Analyze this product image and generate a complete listing package.${optionalHint ? ` Context: ${optionalHint}` : ''}

Return ONLY this JSON structure:
{
  "title": "SEO-optimized product title (5-10 words, no brand names)",
  "description": "Detailed product description for marketplace listing (80-150 words). Mention material, style, occasion, and key features.",
  "suggestedPrice": <number in USD, realistic retail price>,
  "socialCaptions": {
    "instagram": "Visual, energetic Instagram caption. Use 5-8 emojis throughout. Include a strong hook in line 1. End with 20-25 trending hashtags on a new line. Max 300 words.",
    "facebook": "Conversational Facebook post. Lead with a question or bold statement. Mention the price (use ₦ and say 'DM to order'). Include a 'Shop Now' call-to-action. 2-3 short paragraphs. No hashtags.",
    "pinterest": "Keyword-rich Pinterest pin description. No emojis. Focus on search terms like style aesthetics, occasions, materials, and trends. 2-3 sentences. End with 5-8 keyword phrases separated by commas."
  }
}`

  try {
    const response: any = await $fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: {
          model: 'gpt-4o',
          max_tokens: 1024,
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: { url: dataUrl, detail: 'low' },
                },
                { type: 'text', text: userPrompt },
              ],
            },
          ],
        },
      },
    )

    const rawText: string = response.choices?.[0]?.message?.content || ''

    // Strip any accidental markdown code fences
    const jsonText = rawText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    const data = JSON.parse(jsonText)
    return { success: true, data }
  } catch (err: any) {
    const status = err?.status || err?.statusCode || 500
    const detail =
      err?.data?.error?.message ||
      err?.data?.message ||
      err?.message ||
      'Unknown error'
    console.error(
      `[POST /api/ai/generate-listing] ${status}: ${detail}`,
      err?.data || '',
    )
    throw createError({
      statusCode: status,
      statusMessage: `AI generation failed: ${detail}`,
    })
  }
})
