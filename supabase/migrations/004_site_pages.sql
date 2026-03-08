-- ── site_pages ──────────────────────────────────────────────────────────────
-- Stores CMS-managed content for static informational pages.
-- Public: SELECT only.  Staff (ADMIN/EDITOR): INSERT, UPDATE.

CREATE TABLE IF NOT EXISTS site_pages (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text        UNIQUE NOT NULL,
  title            text        NOT NULL,
  meta_description text,
  content_html     text        NOT NULL DEFAULT '',
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Index for slug lookups (public page renderer + admin editor)
CREATE INDEX IF NOT EXISTS site_pages_slug_idx ON site_pages (slug);

-- ── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE site_pages ENABLE ROW LEVEL SECURITY;

-- Anyone can read published pages
CREATE POLICY "Public read site_pages"
  ON site_pages FOR SELECT
  USING (true);

-- Only admins and editors can update
CREATE POLICY "Staff update site_pages"
  ON site_pages FOR UPDATE
  USING (is_admin() OR is_editor())
  WITH CHECK (is_admin() OR is_editor());

-- Only admins can insert new pages
CREATE POLICY "Admin insert site_pages"
  ON site_pages FOR INSERT
  WITH CHECK (is_admin());

-- ── Seed data ────────────────────────────────────────────────────────────────
INSERT INTO site_pages (slug, title, meta_description, content_html) VALUES

('about',
 'About Us',
 'Zimbabwe News Online is your trusted source for breaking news and in-depth reporting from Zimbabwe and across Africa.',
 '<h2>About Zimbabwe News Online</h2>
<p>Zimbabwe News Online is an independent digital news platform dedicated to delivering accurate, timely, and impartial reporting on events in Zimbabwe and across the African continent.</p>
<p>Founded with the mission of keeping Zimbabweans at home and in the diaspora informed, we cover politics, business, sport, health, technology, entertainment, and more.</p>
<h2>Our Mission</h2>
<p>To be Zimbabwe''s most trusted digital news platform — holding power to account, amplifying community voices, and delivering journalism that matters.</p>
<h2>Editorial Standards</h2>
<p>We follow rigorous editorial standards. All stories are verified before publication. Corrections are issued promptly and transparently.</p>'),

('contact',
 'Contact Us',
 'Contact the Zimbabwe News Online newsroom.',
 '<h2>Get in Touch</h2>
<p>We welcome tips, feedback, and enquiries from readers.</p>
<h3>Newsroom</h3>
<p>For news tips, press releases, and story pitches:<br><a href="mailto:newsroom@zimbabwenewsonline.com">newsroom@zimbabwenewsonline.com</a></p>
<h3>Editorial Complaints</h3>
<p>To raise a concern about an article or our editorial standards:<br><a href="mailto:editor@zimbabwenewsonline.com">editor@zimbabwenewsonline.com</a></p>
<h3>Advertising</h3>
<p>For advertising and partnership enquiries:<br><a href="mailto:ads@zimbabwenewsonline.com">ads@zimbabwenewsonline.com</a></p>
<h3>Corrections</h3>
<p>To request a correction, please email <a href="mailto:corrections@zimbabwenewsonline.com">corrections@zimbabwenewsonline.com</a> with the article URL and details of the error.</p>'),

('editorial-policy',
 'Editorial Policy',
 'Our editorial standards, values, and policy.',
 '<h2>Our Editorial Standards</h2>
<p>Zimbabwe News Online is committed to accuracy, fairness, and independence in all our reporting.</p>
<h2>Accuracy</h2>
<p>We strive to ensure all published content is accurate and verifiable. When errors occur, we correct them promptly and transparently via our <a href="/corrections">Corrections</a> page.</p>
<h2>Impartiality</h2>
<p>We report facts without fear or favour, giving appropriate weight to all sides of a story. Opinions are clearly labelled and separated from news reporting.</p>
<h2>Independence</h2>
<p>Our editorial decisions are made independently of advertisers, political parties, and commercial interests. No external party has editorial control over our content.</p>
<h2>Sources</h2>
<p>We verify information with multiple sources before publication. Anonymous sources are used only when necessary and with editorial approval.</p>
<h2>Conflicts of Interest</h2>
<p>Staff must declare any potential conflicts of interest. We do not accept gifts or payments that could compromise our editorial integrity.</p>'),

('corrections',
 'Corrections',
 'How Zimbabwe News Online handles corrections and updates to published articles.',
 '<h2>Our Corrections Policy</h2>
<p>Zimbabwe News Online is committed to accuracy. When we make mistakes, we correct them promptly and transparently.</p>
<h2>How to Request a Correction</h2>
<p>If you believe an article contains a factual error, please contact our editorial team at <a href="mailto:corrections@zimbabwenewsonline.com">corrections@zimbabwenewsonline.com</a>.</p>
<p>Please include:</p>
<ul>
<li>The URL of the article</li>
<li>The specific error you have identified</li>
<li>Supporting evidence or sources</li>
<li>Your contact details (not published)</li>
</ul>
<h2>Our Process</h2>
<p>We review all correction requests within 48 hours. Verified corrections are updated in the article text with a correction notice appended, noting what was changed and when.</p>'),

('ownership',
 'Ownership',
 'Information about the ownership and funding of Zimbabwe News Online.',
 '<h2>Ownership &amp; Funding</h2>
<p>Zimbabwe News Online is an independently owned digital news platform. We are committed to full transparency about our ownership structure and funding sources.</p>
<h2>Editorial Independence</h2>
<p>Our editorial team operates with complete independence from our ownership structure. Owners and investors do not influence editorial decisions, story selection, or the framing of news coverage.</p>
<h2>Funding</h2>
<p>Zimbabwe News Online is funded through digital advertising and reader support. We do not accept funding that comes with conditions attached to our editorial output.</p>
<h2>Transparency</h2>
<p>For ownership enquiries, contact <a href="mailto:editor@zimbabwenewsonline.com">editor@zimbabwenewsonline.com</a>.</p>'),

('privacy-policy',
 'Privacy Policy',
 'How Zimbabwe News Online collects, uses, and protects your personal data.',
 '<h2>Privacy Policy</h2>
<p>This policy explains how Zimbabwe News Online (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) collects, uses, and protects your personal information when you use our website.</p>
<h2>Information We Collect</h2>
<ul>
<li><strong>Newsletter subscribers:</strong> email address only.</li>
<li><strong>Comment authors:</strong> name, email address (not displayed publicly), and optional website URL.</li>
<li><strong>Analytics:</strong> anonymous pageview data collected via server-side counters. No third-party tracking pixels.</li>
</ul>
<h2>How We Use Your Information</h2>
<p>Your email address is used solely to deliver the newsletter you subscribed to. We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>
<h2>Cookies</h2>
<p>We use essential cookies for site functionality. You can disable cookies in your browser settings, though this may affect site features.</p>
<h2>Your Rights</h2>
<p>You may request access to, correction of, or deletion of your personal data at any time by contacting <a href="mailto:privacy@zimbabwenewsonline.com">privacy@zimbabwenewsonline.com</a>.</p>
<h2>Changes to This Policy</h2>
<p>We may update this policy periodically. Continued use of the site constitutes acceptance of the revised policy.</p>'),

('terms-of-use',
 'Terms of Use',
 'Terms and conditions for using Zimbabwe News Online.',
 '<h2>Terms of Use</h2>
<p>By accessing or using Zimbabwe News Online, you agree to be bound by these terms. If you do not agree, please discontinue use of the site.</p>
<h2>Intellectual Property</h2>
<p>All content published on Zimbabwe News Online — including articles, photographs, graphics, and video — is protected by copyright. You may not reproduce, distribute, or republish our content without prior written permission.</p>
<h2>User Conduct</h2>
<p>You agree not to use this platform to post or transmit unlawful, harmful, threatening, abusive, defamatory, or otherwise objectionable content. We reserve the right to remove content and suspend access for violations.</p>
<h2>Comments</h2>
<p>User comments are moderated. By submitting a comment you grant us a non-exclusive licence to publish it. We are not responsible for the opinions expressed in user comments.</p>
<h2>Disclaimer</h2>
<p>Zimbabwe News Online strives for accuracy but does not warrant that all content is error-free or complete. We are not liable for any loss arising from reliance on our content.</p>
<h2>Changes to These Terms</h2>
<p>We may update these terms at any time. Continued use of the site constitutes acceptance of the revised terms. Last updated: 2026.</p>')

ON CONFLICT (slug) DO NOTHING;
