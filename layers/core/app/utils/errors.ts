type ErrorLike = {
  message?: string
  statusMessage?: string
  data?: {
    message?: string
    statusMessage?: string
  }
}

const OPAQUE_MESSAGES = new Set([
  'internal server error',
  'server error',
  'bad request',
  'unknown error',
  'an unexpected error occurred.',
  'an error occurred',
  'error',
  '',
])

export const extractErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong.',
) => {
  const err = error as ErrorLike
  const candidates = [
    err?.data?.statusMessage,
    err?.data?.message,
    err?.statusMessage,
    err?.message,
  ]

  for (const candidate of candidates) {
    if (
      typeof candidate === 'string' &&
      candidate.trim() &&
      !OPAQUE_MESSAGES.has(candidate.trim().toLowerCase())
    ) {
      return candidate
    }
  }

  return fallback
}
