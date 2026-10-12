# VACATIO

Logout AI landing page for vacation rental operators. The approved copy and visual guidance are in DESIGN.md.

Live site: https://grateful-llama-909.convex.site

Public source code: https://github.com/mohit-LOGOUT/VACATIO

## Local preview

Run `npm run build`, then `npm run dev`. Open the printed address on a phone connected to the same Wi-Fi.

The primary button scrolls to Test Hermes below the landing banner. The sandbox uses fictional bookings and a real AI agent; live WhatsApp onboarding is not implemented.

Geist loads from Google Fonts; Arial is the fallback when that service is unavailable.

## Publish with Convex

Install dependencies with `npm install`. Authenticate/configure the existing Convex project using `npx convex dev --once` if needed, then run `npm run deploy`. The static hosting component serves the page at the deployment's `.convex.site` address.

Keep credentials in server-side environment variables. Never commit `.env` files.

## Verification

`npm test` checks approved copy, the WhatsApp destination and public-file safety. Browser screenshots should additionally be checked at 320px, 390px and 1280px.

## Document review

The host screen is `/review.html`. It lists documents by review status, shows the original file and booking requirements, and saves a host's approve/reject decision. Rejections create a pending replacement request in `messages`; no WhatsApp delivery integration exists yet. This is manual review, not AI identity verification.

All review endpoints deny access unless `REVIEW_ACCESS_KEY` is set on the Convex deployment to a random secret of at least 32 characters and the host supplies that key. The key is not included in the build or saved in browser storage. This initial screen serves one private operator workspace; separate operator accounts and permissions must be implemented before using a shared deployment for multiple operators.

To configure once network access is available:

1. Generate a random host key and store it securely. Set it on the existing deployment using `npx convex env set REVIEW_ACCESS_KEY <your-key>`.
2. Run `npx convex dev --once --typecheck enable` to publish the review functions and new review-status index.
3. Run `npm test` and `npm run dev`, then open `http://localhost:5173/review.html`.
4. Enter the host key to load real documents. With an empty database, the review queue is empty; this screen does not create bookings or uploads.
5. Choose **Try sample reviews** to explore fictional documents without accessing or changing Convex. Sample decisions reset on page reload.

The build embeds only the public `CONVEX_URL`, read from the environment or `.env.local`. Never put `REVIEW_ACCESS_KEY` into frontend files. Automated rule checks run with `npm test`; the saved browser flow runs with `node scripts/check-review.mjs` against the local preview, or with `REVIEW_TEST_URL` set to the deployed screen URL. It verifies only the labelled sample flow, not live database persistence.

Current verification limitation: the restricted session on 10 October 2026 could not reach Convex, start the preview server, or launch Chromium. The backend type check and automated tests passed. Deployment and real browser/live-save verification remain outstanding.

## Hermes sandbox

The sandbox is below the landing banner at https://grateful-llama-909.convex.site/ and directly at `/sandbox.html`. The published version uses the same **production** Convex deployment, a real `@convex-dev/agent` conversation thread for each dummy booking, and `gpt-4o-mini` when `OPENAI_API_KEY` is configured. Without that key it uses the Convex AI Gateway, which requires an enabled gateway. Model requests are billable to the configured provider; there is no billing counter in this interface.

The published sandbox is open to every visitor: no sign-up, access key or inquiry form. Opening the page automatically loads two fictional bookings and property details into Convex. Visitors choose a stay and start chatting. A random browser session keeps conversations and edits independent, and reloads preserve them; returning sessions renew for 30 days. Existing property, booking and ID-review tables are not used by this chat. An inquiry popup is deferred.

Run `npm run build` and `npm run dev`, then open `http://localhost:5173/sandbox.html`. On a phone on the same Wi-Fi use the preview server's printed network address.

Test: ask about parking; ask “Is it free?”; request early check-in; give a host answer; edit property context; switch bookings; reload; restart one conversation. Host answers are conversation-specific. ID uploads, automatic verification, live WhatsApp and the dashboard are not implemented in the sandbox.

`npm test` covers existing landing/review rules plus sandbox validation, ownership, repeated-send handling and stale reply/timeout guards. `node scripts/check-sandbox.mjs` walks the real model flow with Chrome and captures 320/390/768/1280px screenshots. Optional `SANDBOX_TEST_URL` selects another sandbox URL. Browser checks create only fictional sessions and consume model calls.

Production verification covers the published page and its embedded chat; local preview alone does not count as delivery. The static hosting build uses the production VITE_CONVEX_URL supplied by its deploy command. Model credentials must exist on production, separately from development. Sandbox access does not require a configured key.

`node scripts/check-live-landing.mjs` checks public entry from a clean browser on the published landing page, real replies for both sample stays, reload persistence, independent visitors and mobile layouts. No session link or access key is required.

## Admin property catalogue

`/admin.html` is the protected admin page linked by **Sign up** in the landing header. The public demo remains open. Convex Auth handles password hashing and sessions; every admin data operation also checks the configured owner and an active, unexpired session. Public account creation is disabled.

To configure the owner's permanent credentials, use the **production Convex dashboard environment settings** to enter `ADMIN_SETUP_ID` and `ADMIN_SETUP_PASSWORD` (at least 7 characters; a longer unique password is recommended). Do not paste credentials into chat or put them in source files. Run `npx convex run adminSetup:configure '{}' --prod` from the trusted project terminal, then remove both setup environment variables. This internal action creates or resets the owner account and invalidates that account's old sessions. Signing keys (`JWT_PRIVATE_KEY`, `JWKS`) and `SITE_URL` are configured separately; never rotate them casually. The configured admin ID is case-insensitive.

Temporary browser testing uses `node scripts/setup-admin-test.mjs [--prod]`. It refuses to replace an already-configured admin, stores its random credentials only under `/private/tmp`, and gives test access a one-hour expiry. After testing, run `npx convex run adminSetup:endTemporaryAccess '{}' [--prod]` to revoke it immediately. Temporary accounts cannot access admin data once that grant expires or is revoked.

The import runs as a Convex workflow: read a public webpage, extract property facts with the existing OpenAI model through the agent component, then save the property and source URL in Convex. The reader checks public IP addresses, pins the checked address during the request, validates redirects, and limits response size/time. Airbnb embedded listing data is supported, including its full explicit amenities list. Missing facts stay blank and are flagged for editing. Site blocking, inaccessible pages and non-listing pages produce a visible failure with retry/manual entry. Automatic photo import and manual photo uploads are not implemented in this phase. Support for every listing website is not guaranteed.

`node scripts/check-admin.mjs [--prod]` checks actual ID/password sign-in, rejected anonymous data access and public sign-up, the supplied Airbnb listing, saved edits/reload, duplicate links, private-address rejection and sign-out. `node scripts/check-import-details.mjs [--prod]` checks real extraction against Airbnb and SaffronStays. Browser tests read credentials from a private local file, using an authorized owner or an active temporary account; remove that file after testing. Model calls consume provider usage. Development browser tests use the local preview; production tests use the existing public Convex link. Built scripts and styles use content-based filenames to avoid mixing cached code with updated HTML.

## Pre-check-in browser test (13 October 2026)

Hermes now has a per-person fictional ID checklist. In `/sandbox.html`, use **Use matching sample** or **Try wrong-name sample**, or upload a clearly labelled fictional JPG/PNG/WebP/PDF up to 5 MB. The actual image reader uses `HERMES_ID_MODEL` (default `gpt-4.1-mini-2025-04-14`) and the existing server-side OpenAI key. Names are read without supplying the expected answer, then compared by code. Unclear readings go to host review; the model cannot complete the booking itself. No photo matching or government authenticity check is performed.

The admin page shows recent checklists, protected document inspection/manual review, and **Create test booking** for a saved property. This creates a fictional guest test, not a live PMS booking. Its private session link grants access to that test. Set one-of/combined requirements and full guest names in the checklist. Email is taken as existing booking data; the demo uses a fictional contact and never requests email. Missing essential arrival details prevent completion until the host fills them in and shares them. Guest confirmation and host status are saved in-app; no WhatsApp or email is sent.

Uploaded test files are deleted after 24 hours. Accidentally submitted unmarked real documents are rejected and removed after classification; users are explicitly asked not to submit them. Real-ID accuracy and real guest use remain unapproved/unproven until protected evaluation and a real-data retention policy are in place. Fake sample cards demonstrate the workflow, not real-world ID recognition accuracy. Public visitors cannot read other sessions or protected host records.

`node scripts/check-precheck.mjs [--prod]` covers actual image reads for three document types, wrong-name rejection, multi-guest completion, reload, separation, reminder pause and mobile widths. `check-precheck-pdf.mjs` checks actual PDF reading and protected host evidence; `check-precheck-host.mjs` checks the admin-created property test. The host tests read a private temporary credential file (same convention as existing admin tests), which must be removed afterward. `npm test` protects name rules, requirements, incomplete/late/duplicate results and reminder suppression.

### Train Hermes

Sign in at `/admin.html#train-hermes`. Describe a speaking change, generate an editable suggestion, preview a guest question, then **Save for Hermes**. Guidance applies to future answers across test bookings. Property facts and guest ID requirements stay in their existing editors. This saves instructions; it does not retrain the underlying model. Preview uses the same answer generator and reminder rules with fictional guests and no conversation history. Restore defaults or an earlier saved version into a draft, then save to publish. Suggestions/previews are capped at 60 per owner per hour.

The first eligible guest answer includes a separate ID reminder immediately. The default subsequent reminder interval is two minutes; the host can choose every eligible answer. Completed, paused and pending-review guests are excluded.

Trainer verification: `node scripts/check-trainer.mjs --prod` checks the real authenticated suggestion/preview/save flow and a public guest reply, then restores the original guidance. It reads approved owner test credentials from a private temporary file, never from source. Latest production check: passed 13 October 2026; guest ID flow also rechecked successfully.
