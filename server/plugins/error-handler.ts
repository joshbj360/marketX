// Global error handler — catches every unhandled error across all API routes.
// 4xx errors are skipped (expected client errors, handled at the route level).
// 5xx errors are logged with full context so any failure can be traced by requestId.

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error, context) => {
    const event = (context as any)?.event
    if (!event) return

    const statusCode: number = (error as any)?.statusCode ?? 500

    // 4xx are client errors — expected, not worth alarming on
    if (statusCode < 500) return

    const requestId = event.context?.requestId as string | undefined
    const user = event.context?.user as
      | { id?: string; email?: string }
      | undefined
    const method: string = event.method ?? event.node?.req?.method ?? 'UNKNOWN'
    const path: string = event.path ?? event.node?.req?.url ?? 'UNKNOWN'

    const frames =
      error instanceof Error
        ? error.stack
            ?.split('\n')
            .slice(1, 9)
            .map((l: string) => l.trim())
            .filter(Boolean)
        : undefined

    logger.error(`[${method}] ${path} → ${statusCode}`, {
      requestId,
      userId: user?.id,
      userEmail: user?.email,
      statusCode,
      errorMessage:
        error instanceof Error ? error.message : String(error ?? 'unknown'),
      errorName: error instanceof Error ? error.name : undefined,
      stack: frames,
    })
  })
})
