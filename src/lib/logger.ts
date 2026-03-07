/**
 * Structured logger for server-side use.
 *
 * In production, emits newline-delimited JSON — compatible with Vercel log
 * drains, Datadog, Logtail, and any JSON-aware log aggregator.
 *
 * In development, logs human-readable messages to the console.
 *
 * Usage:
 *   import { logger } from '@/lib/logger'
 *   logger.info('Article published', { articleId, authorId })
 *   logger.error('RPC failed', { error: err.message, articleId })
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  [key: string]: unknown
}

const isProd = process.env.NODE_ENV === 'production'

function emit(level: LogLevel, message: string, context?: LogContext): void {
  const entry = {
    ts: new Date().toISOString(),
    level,
    msg: message,
    ...context,
  }

  if (isProd) {
    const line = JSON.stringify(entry)
    if (level === 'error') {
      console.error(line)
    } else if (level === 'warn') {
      console.warn(line)
    } else {
      console.log(line)
    }
  } else {
    const prefix = `[${level.toUpperCase().padEnd(5)}] ${message}`
    if (level === 'error') {
      console.error(prefix, context ?? '')
    } else if (level === 'warn') {
      console.warn(prefix, context ?? '')
    } else if (level === 'debug') {
      console.debug(prefix, context ?? '')
    } else {
      console.log(prefix, context ?? '')
    }
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => emit('debug', message, context),
  info:  (message: string, context?: LogContext) => emit('info',  message, context),
  warn:  (message: string, context?: LogContext) => emit('warn',  message, context),
  error: (message: string, context?: LogContext) => emit('error', message, context),
}

// ── Convenience helpers ────────────────────────────────────────────────────────

/** Log an admin action for audit trail purposes. */
export function logAdminAction(
  action: string,
  userId: string,
  data?: LogContext
): void {
  logger.info(`admin:${action}`, { userId, ...data })
}

/** Log a moderation action (comment approve/reject/delete). */
export function logModeration(
  action: 'approve' | 'reject' | 'delete' | 'spam',
  commentId: string,
  moderatorId: string,
  data?: LogContext
): void {
  logger.info(`moderation:${action}`, { commentId, moderatorId, ...data })
}

/** Log an API error with enough context to debug it. */
export function logApiError(
  route: string,
  error: unknown,
  context?: LogContext
): void {
  const message = error instanceof Error ? error.message : String(error)
  const stack = error instanceof Error ? error.stack : undefined
  logger.error(`api:${route}`, { error: message, stack, ...context })
}