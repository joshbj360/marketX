/**
 * Custom API Error Class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public data?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
    Object.setPrototypeOf(this, ApiError.prototype)
  }

  /**
   * Check if error is recoverable
   */
  isRecoverable(): boolean {
    // These errors might be recoverable with retry
    return [408, 429, 500, 502, 503, 504].includes(this.statusCode)
  }

  /**
   * Check if user needs to login
   */
  isAuthError(): boolean {
    return this.statusCode === 401 || this.statusCode === 403
  }
}
