/**
 * Centralized structured logger.
 *
 * Available as a Nuxt server auto-import — no explicit import needed in any
 * server-side file (API routes, services, repositories, middleware).
 *
 * In production  → JSON lines (compatible with DataDog, Logtail, Axiom, etc.)
 * In development → readable formatted lines
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

function write(level: LogLevel, message: string, context?: LogContext) {
  const isProd = process.env.NODE_ENV === 'production'
  const ts = new Date().toISOString()

  if (isProd) {
    const entry = { level, message, timestamp: ts, ...context }
    const out = JSON.stringify(entry)
    if (level === 'error') process.stderr.write(out + '\n')
    else process.stdout.write(out + '\n')
  } else {
    const tag = `[${ts}] [${level.toUpperCase().padEnd(5)}]`
    const ctx = context && Object.keys(context).length
      ? ' ' + JSON.stringify(context)
      : ''
    const line = `${tag} ${message}${ctx}`
    if (level === 'error') console.error(line)
    else if (level === 'warn') console.warn(line)
    else console.log(line)
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => write('debug', message, context),
  info:  (message: string, context?: LogContext) => write('info',  message, context),
  warn:  (message: string, context?: LogContext) => write('warn',  message, context),
  error: (message: string, context?: LogContext) => write('error', message, context),
}
