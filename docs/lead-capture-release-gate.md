# Oculivo website: native demo intake release gate

## Deployment wiring (not active until independently verified)
- Website Cloudflare Worker: `oculivo-site` (`oculivo.com`), GitHub `taxresolutioncrm/oculivo-site`.
- Admin Portal/Supabase integration: `taxresolutioncrm/taxcasereview-CRM`, Supabase project `mpxgxfqdbquzkrvvejkh`.
- Existing booking fallback: `https://taxrescrm.app/book?product=oculivo`, which must keep its existing appointment/calendar workflow.
- The first-party demo form POSTs to `/api/demo-request` and only shows success after the verified Admin intake endpoint returns a 2xx after database persistence.
- In Cloudflare Workers, set `OCULIVO_LEAD_WEBHOOK_URL` to `https://mpxgxfqdbquzkrvvejkh.supabase.co/functions/v1/oculivo-demo-intake` and configure `OCULIVO_LEAD_WEBHOOK_SECRET` as a secret, **never in code**. The same value belongs in the Admin Supabase Edge Function secret.
- The Admin project migration `supabase/migrations/20261103_oculivo_demo_requests.sql` and function `oculivo-demo-intake` must be applied/deployed through the approved Supabase workflow. Function `verify_jwt=false` because a server-only bearer secret is checked in the function. Never allow anonymous database inserts.
- No new paid providers: Admin uses its existing RomyLabs Stalwart sender via `romylabs_stalwart_transport_for_product`.
- If backend/secret is missing or fails, the native form reports failure and points to the working booking calendar. Never show a fake lead success.

## Acceptance tests
- [ ] Cloudflare sandbox: `npm run verify:closeout && npm run build` and exact candidate SHA green.
- [ ] `/demo/` serves a first-party form (not an external 302).
- [ ] Homepage, pricing, optometry, ophthalmology and optical CTA links lead to `/demo/`.
- [ ] Submit with a valid new `request_id` and test contact (no patient data). Verify exactly one `romylabs_demo_requests` record in Admin project with `product_id=oculivo`.
- [ ] Submit same request ID twice; verify no duplicate row.
- [ ] Verify the Admin Portal `/crm-admin/tasks` displays lead owner, status, mail audit and contact follow-up controls, independently of booking.
- [ ] Verify Stalwart submission ID and actual inbox delivery, not just send acceptance.
- [ ] Temporarily simulate mail failure: durable lead/task persists, mail failure visible, no false email-delivered claim.
- [ ] Submit invalid form, forged Origin, no bearer secret, wrong product, and empty/invalid email. Confirm rejection and no database insert.
- [ ] Make an actual Oculivo booking via existing product-aware calendar. Verify `calevents.product_id=oculivo`, Admin booking alert, email, and task.
- [ ] Confirm GA4 events `oculivo_cta_click`, `oculivo_booking_start`, `oculivo_demo_submit_success` and `oculivo_demo_submit_failure` where applicable.
- [ ] Desktop/tablet/mobile, accessibility, redirects, canonical, sitemap and attribution verified.
- [ ] Production only on explicit `deploy` and after all above; verify exact Cloudflare/Supabase production versions.

## Search optimization
Search Console's 2,735 impressions over three months do not equal visits. The priority is first-party capture and indexed high-intent snippets; ranking gains and qualified leads are not guaranteed by code. Review Google/Bing clicks, CTR, and conversion events by page and query after release.

## Existing Worker proxy
The homepage still uses an approved legacy upstream origin for presentation. This change normalizes homepage metadata and CTA links without redesigning the homepage. Retiring that proxy requires separate visual parity acceptance rather than breaking the established UI.
