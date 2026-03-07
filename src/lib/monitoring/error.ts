/**
 * Error monitoring integration point.
 *
 * Currently a structured-logging stub. Wire up to Sentry in three steps:
 *
 * 1. Install:  npm install @sentry/nextjs
 * 2. Init:     npx @sentry/wizard@latest -i nextjs
 * 3. Replace the stub bodies below with real Sentry calls (see comments).
 *
 * The function signatures are intentionally identical to Sentry's API so the
 * migration is a single find-and-replace.
 */

import { logger } from '@/lib/logger'

export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info' | 'debug'

export interface ErrorContext {
  [key: string]: unknown
}

/**
 * Capture an unexpected exception.
 *
 * Sentry equivalent:
 *   import * as Sentry from '@sentry/nextjs'
 *   Sentry.captureException(err, { extra: context })
 */
export function captureException(err: unknown, context?: ErrorContext): void {
  const message = err instanceof Error ? err.message : String(err)
  const stack = err instanceof Error ? err.stack : undefined
  logger.error('unhandled_exception', { error: message, stack, ...context })
}

/**
 * Capture a non-fatal message at a given severity level.
 *
 * Sentry equivalent:
 *   Sentry.captureMessage(message, severity)
 */
export function captureMessage(
  message: string,
  severity: ErrorSeverity = 'info',
  context?: ErrorContext
): void {
  if (severity === 'error' || severity === 'fatal') {
    logger.error(message, context)
  } else if (severity === 'warning') {
    logger.warn(message, context)
  } else {
    logger.info(message, context)
  }
}

/**
 * Add a breadcrumb for tracing the path to an error.
 *
 * Sentry equivalent:
 *   Sentry.addBreadcrumb({ category, message, level })
 */
export function addBreadcrumb(
  category: string,
  message: string,
  data?: ErrorContext
): void {
  logger.debug(`breadcrumb:${category}`, { message, ...data })
}

/**
 * Set the current user context so errors are attributed correctly.
 *
 * Sentry equivalent:
 *   Sentry.setUser({ id, email })
 */
export function setUser(user: { id: string; email?: string } | null): void {
  if (user) {
    logger.debug('set_user', { userId: user.id })
  }
}