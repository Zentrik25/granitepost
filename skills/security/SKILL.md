---
name: security
description: Use when implementing security controls: RBAC checks, middleware guards, RLS verification, rate limiting, view tracking dedupe, audit logging, and security headers (CSP recommended).
---

## Essentials
- Admin route protection: middleware + server checks.
- View tracking: must dedupe (cookie + IP hash) + rate limit endpoint.
- Never leak service role key to client.
- Add security headers at edge (middleware) or via next.config/headers:
  - HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-Frame-Options or frame-ancestors via CSP.

## Output
- Provide exact header set and CSP baseline.
- Provide exact view tracking dedupe strategy and abuse resistance.
