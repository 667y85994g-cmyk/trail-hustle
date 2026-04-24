# Analytics — Trail Hustle teaser

GA4, gated behind UK-compliant consent. Search Console hooks. Event dictionary.

## Env vars

| Name | Example | Required | Notes |
| --- | --- | --- | --- |
| `PUBLIC_GA_MEASUREMENT_ID` | `G-72LRCS3Y6L` | No | Leave blank to disable analytics entirely (no gtag.js ever loads). |
| `PUBLIC_GSC_VERIFICATION` | `abc123xyz...` | No | Only needed if verifying Search Console via meta-tag method (URL property). Skip if using DNS TXT (Domain property). |

### Locally

Add to `site/.env.local` (gitignored):

```
PUBLIC_GA_MEASUREMENT_ID=G-72LRCS3Y6L
```

### In Vercel

1. Vercel project → **Settings → Environment Variables**.
2. **Add New** — Key `PUBLIC_GA_MEASUREMENT_ID`, Value `G-72LRCS3Y6L`, Environments: tick **Production, Preview, Development**. Save.
3. Redeploy (or push any commit) — env vars only apply to builds after they're saved.

## Consent gate

- Banner fixed to bottom of viewport, paper bg, no layout shift.
- Copy: "We use a light-touch analytics cookie to see what lands. Nothing else. Accept to help us listen."
- Two equal buttons: **Accept** / **Decline**.
- Choice persisted in `localStorage` under key `th-consent` (`granted` | `declined`).
- Accept → dispatches `tf-consent:granted` window event → [analytics.ts](../src/scripts/analytics.ts) injects gtag.js.
- Decline → no script injection, ever. No requests to google-analytics.com or googletagmanager.com on that session.
- Returning visitors with `th-consent === 'granted'` skip the banner and fire the event immediately on load.

To re-test as a fresh visitor: DevTools → Application → Local Storage → delete `th-consent` → hard reload.

## Event dictionary

All events flow through `window.thTrack(name, params?)` which no-ops if gtag hasn't loaded (consent declined / env var missing).

| Event | When | Parameters |
| --- | --- | --- |
| `page_view` | Default on load (after consent) — via `gtag('config', ...)`. | GA4 auto-params |
| `waitlist_submit_attempt` | Fired before network call on form submit. | — |
| `waitlist_submit_success` | Fired after Formspree returns 2xx. | `{ method: 'waitlist' }` |
| `waitlist_submit_error` | Fired on non-2xx or network failure. | `{ error_type: 'http_<code>' \| 'network' }` |
| `instagram_click` | IG icon/link click. | `{ placement: 'footer' \| 'waitlist' }` |
| `substack_click` | Substack icon/link click. | `{ placement: 'footer' \| 'waitlist' }` |
| `scroll_depth` | 25 / 50 / 75 / 100% document scroll. Each threshold fires once per session. | `{ depth: 25 \| 50 \| 75 \| 100 }` |

No other events. Deliberately small dictionary — no vanity tracking.

## Manual GA4 setup (do this after deploy)

1. Create the GA4 property at [analytics.google.com](https://analytics.google.com) if not already done. Current property: `G-72LRCS3Y6L`.
2. In **Admin → Events**, mark `waitlist_submit_success` as a **key event** (formerly "conversion"). This tells GA4 it's the primary success signal.
3. **Admin → Data Settings → Data Retention** — set to **14 months** (max on the free tier). Default is 2 months which is uselessly short.
4. **Admin → Data Settings → Data Collection** — confirm "Anonymize IP" is on. (Default yes on GA4, but confirm.)
5. **Admin → Product Links → Search Console Links** — once the GSC property is verified, link it here so you can see search-query data inside GA4.

### Verifying events arrive

1. Open the live site, accept consent.
2. GA4 → **Admin → DebugView**. Events should appear within 60 seconds.
3. Submit the waitlist form → confirm `waitlist_submit_attempt` and `waitlist_submit_success` arrive.
4. Click the Instagram icon in the footer → confirm `instagram_click` arrives. Same for Substack → `substack_click`.
5. Scroll through the site → confirm `scroll_depth` at each 25/50/75/100.

### Verifying consent-decline blocks everything

1. DevTools → Application → Local Storage → delete `th-consent` → hard reload.
2. Click **Decline** on the banner.
3. Open Network tab, filter on `google` — scroll, submit form, click IG.
4. Zero requests to `google-analytics.com` or `googletagmanager.com`. If any appear, the gate is broken.

## Manual Search Console setup

1. Go to [search.google.com/search-console](https://search.google.com/search-console).
2. **Add property** — prefer **Domain** property (verified once via DNS TXT, covers all subdomains). Fallback: URL-prefix property with meta-tag verification.
3. **If using URL property / meta-tag method:**
   - GSC shows a `<meta name="google-site-verification" content="...">` tag. Copy the content value.
   - In Vercel → **Settings → Environment Variables** → add `PUBLIC_GSC_VERIFICATION` with that value.
   - Redeploy.
   - Back in GSC, click **Verify**.
4. **Submit the sitemap**: GSC → **Sitemaps** → add `https://trailhustle.com/sitemap-index.xml` (full URL, not just the filename — Domain properties require absolute URLs).
5. **URL Inspection** → paste `https://trailhustle.com` → **Request indexing** to trigger a priority crawl.
6. **Admin → Settings → Users & Permissions** — add anyone else who needs access.

## Out of scope

Deliberately *not* shipping in Phase 1: Google Tag Manager, Facebook Pixel, LinkedIn Insight, Cookiebot/OneTrust, Partytown. Add them only when there's content or ad spend to justify them.
