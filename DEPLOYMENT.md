# Deployment Guide — Zimbabwe News Online

## Prerequisites

- Node.js 20+
- Supabase project (free tier or higher)
- Vercel account
- Cloudflare account (for DNS + CDN)
- Domain registered and pointed at Cloudflare

---

## 1. Supabase Setup

### 1.1 Create a project

1. Go to [supabase.com](https://supabase.com) → New project
2. Choose a region close to your users (e.g. Frankfurt or Mumbai for Southern Africa)
3. Save the generated database password securely

### 1.2 Run migrations

Run each migration in order in the Supabase **SQL Editor** (Database → SQL Editor):

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
supabase/migrations/003_rpc_functions.sql
```

### 1.3 Configure Storage

1. Go to Storage → New bucket → name it `media`
2. Set it to **Public** (images are served publicly)
3. Add an RLS policy allowing only authenticated admins to insert/delete:

```sql
-- Allow admins to upload
CREATE POLICY "admin_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND is_admin());

-- Allow admins to delete
CREATE POLICY "admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND is_admin());

-- Allow public read
CREATE POLICY "public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');
```

### 1.4 Collect credentials

From Supabase → Settings → API:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (keep secret — server only)

### 1.5 Create the first admin user

1. Go to Authentication → Users → Invite user (use your admin email)
2. After confirming email, run in SQL Editor:

```sql
INSERT INTO user_roles (user_id, role)
SELECT id, 'ADMIN'
FROM auth.users
WHERE email = 'your-admin@example.com';
```

---

## 2. Environment Variables

Create `.env.local` for local development (never commit this file):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Site identity (optional but recommended for metadata)
NEXT_PUBLIC_SITE_URL=https://www.example.co.zw
NEXT_PUBLIC_SITE_NAME=Zimbabwe News Online
NEXT_PUBLIC_SITE_EMAIL=editor@example.co.zw

# ISR cache revalidation (min 16 chars, generate with: openssl rand -hex 20)
REVALIDATION_SECRET=your-secret-here
```

For **Vercel production**, add all the above under Project → Settings → Environment Variables.

---

## 3. Vercel Deployment

### 3.1 Link repository

```bash
npx vercel link
```

Or connect via Vercel dashboard → Import Git Repository.

### 3.2 Configure build settings

| Setting | Value |
|---|---|
| Framework Preset | Next.js |
| Build Command | `next build` |
| Output Directory | `.next` (auto-detected) |
| Install Command | `npm install` |
| Node.js Version | 20.x |

### 3.3 Add environment variables

In Vercel → Project → Settings → Environment Variables, add all variables from section 2 for the **Production** environment. Add `NEXT_PUBLIC_*` variables to Preview and Development environments as well.

### 3.4 Deploy

```bash
git push origin main
```

Vercel auto-deploys on push to `main`. Monitor the build log for env validation errors — a missing required variable will throw at build time.

### 3.5 Verify deployment

- `https://your-domain.vercel.app/` — homepage loads
- `https://your-domain.vercel.app/sitemap.xml` — sitemap renders
- `https://your-domain.vercel.app/news-sitemap.xml` — news sitemap renders
- `https://your-domain.vercel.app/feed.xml` — RSS feed renders
- `https://your-domain.vercel.app/robots.txt` — robots.txt renders
- `https://your-domain.vercel.app/admin/login` — redirects to login

---

## 4. Cloudflare Setup

### 4.1 Add site to Cloudflare

1. Cloudflare dashboard → Add a Site → enter your domain
2. Select Free plan
3. Update your domain registrar's nameservers to Cloudflare's

### 4.2 Add DNS records

| Type | Name | Value | Proxy |
|---|---|---|---|
| CNAME | `@` | `cname.vercel-dns.com` | Proxied (orange cloud) |
| CNAME | `www` | `cname.vercel-dns.com` | Proxied (orange cloud) |

### 4.3 Add domain to Vercel

In Vercel → Project → Settings → Domains:
- Add `your-domain.co.zw`
- Add `www.your-domain.co.zw`
- Set `www` as the primary (canonical) domain

### 4.4 SSL/TLS

- Cloudflare SSL/TLS → set to **Full (strict)**
- Vercel issues its own TLS certificate; Cloudflare proxies it

### 4.5 Cloudflare settings (recommended)

- **Speed → Optimization → Auto Minify**: disable JS/CSS (Next.js handles this)
- **Caching → Configuration → Browser Cache TTL**: Respect Existing Headers
- **Security → Settings → Security Level**: Medium
- **Page Rules** or **Cache Rules**: bypass cache for `/admin/*` and `/api/*`

```
# Cache Rule — bypass cache for admin and API
URL pattern: your-domain.co.zw/admin*
Setting: Cache Level = Bypass

URL pattern: your-domain.co.zw/api*
Setting: Cache Level = Bypass
```

---

## 5. ISR Cache Revalidation

After publishing an article, call the revalidation endpoint to flush the ISR cache:

```bash
curl -X POST https://www.your-domain.co.zw/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret":"your-secret","path":"/article/your-slug"}'
```

You can also revalidate listing pages:

```bash
# Homepage
curl -X POST .../api/revalidate -d '{"secret":"...","path":"/"}'

# Category page
curl -X POST .../api/revalidate -d '{"secret":"...","path":"/category/politics"}'
```

---

## 6. Post-deployment Checklist

- [ ] All migrations run in Supabase SQL Editor
- [ ] Admin user created and `user_roles` row inserted
- [ ] Storage bucket `media` created with correct RLS policies
- [ ] All env vars set in Vercel Production environment
- [ ] Custom domain added to Vercel and DNS propagated
- [ ] Cloudflare SSL set to Full (strict)
- [ ] `/admin/login` accessible and login works
- [ ] Article creation, image upload, and publish flow works end-to-end
- [ ] Homepage, article page, category page load correctly
- [ ] OG preview: paste an article URL into [opengraph.xyz](https://www.opengraph.xyz) and verify image + title
- [ ] Google Search Console: submit sitemap.xml and news-sitemap.xml
- [ ] RSS feed: validate at [validator.w3.org/feed](https://validator.w3.org/feed/)
- [ ] Security headers: verify at [securityheaders.com](https://securityheaders.com)
- [ ] Structured data: test an article at [search.google.com/test/rich-results](https://search.google.com/test/rich-results)

---

## 7. Updating the Site

```bash
# Make changes locally, then:
git add .
git commit -m "feat: your change"
git push origin main
# Vercel deploys automatically
```

For schema changes, run the new migration SQL in Supabase SQL Editor before or alongside the code deploy.