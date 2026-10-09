# VACATIO

Logout AI landing page for vacation rental operators. The approved copy and visual guidance are in DESIGN.md.

Live site: https://grateful-llama-909.convex.site

Public source code: https://github.com/mohit-LOGOUT/VACATIO

## Local preview

Run `npm run build`, then `npm run dev`. Open the printed address on a phone connected to the same Wi-Fi.

The primary button opens WhatsApp for +91 8208215436. This release is a landing page; automated booking onboarding is not implemented.

Geist loads from Google Fonts; Arial is the fallback when that service is unavailable.

## Publish with Convex

Install dependencies with `npm install`. Authenticate/configure the existing Convex project using `npx convex dev --once` if needed, then run `npm run deploy`. The static hosting component serves the page at the deployment's `.convex.site` address.

Keep credentials in server-side environment variables. Never commit `.env` files.

## Verification

`npm test` checks approved copy, the WhatsApp destination and public-file safety. Browser screenshots should additionally be checked at 320px, 390px and 1280px.
