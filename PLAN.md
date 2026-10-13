# PLAN.md

## Next approved rebuild: feedback loop — 14 October 2026

Build Insights and conversational Coach Hermes to the acceptance criteria at the top of PRODUCT.md and AGENT.md. Reuse existing host escalation and trainer persistence. The key proof is a real knowledge gap → host conversation → exact scoped proposal → explicit approval → saved update → a later correct guest answer. Preserve current property/photo imports and pre-check-in. Status: product direction recorded; Insights and the conversational rebuild are not implemented yet. Supersedes the form-led trainer as the next interface direction.


## Current addition: host trainer — 13 October 2026

Build a protected Train Hermes panel in admin: natural-language feedback → AI-proposed editable guidance → same-agent preview → explicit save. Keep revision history and an option to restore a previous version as a draft. Saved guidance applies to all browser test bookings. Fix the first-answer reminder delay and request only each guest's missing document groups in a separate friendly message. Preserve pauses, document review, completion, property facts and ownership boundaries.

Verification: automated access/revision/reminder rules, real browser suggestion/preview/save/reload, production guest answer using saved guidance, mobile layout, and existing landing/pre-check-in checks. Status: deployed to the existing production Convex site on 13 October 2026. Live Chrome checks passed for suggestions, drafts staying unpublished, grounded previews, the third-guest-only reminder, no completion reminder, save/reload, saved guidance controlling the actual guest reply, immediate first-answer follow-up, denied anonymous access, stale-edit rejection and 320/390/768px layouts. All 33 automated checks and TypeScript validation passed. The existing live fictional Aadhaar/PAN/passport, three-guest completion and pause flow passed again. Default welcoming guidance was restored after testing. WhatsApp and real-ID evaluation remain later work.

## Implemented: per-guest pre-check-in (13 October 2026)

Authorized: build and deploy image-AI name checking in the existing browser sandbox before WhatsApp. The public demo accepts fictional documents; the protected admin shows progress/review and can start a fictional booking using a saved property. Real-ID accuracy has not yet been evaluated.

1. Track each named guest and property-specific one-of/combined ID requirements. Reuse booking email; do not collect it again.
2. Save an upload against its guest and booking, acknowledge receipt, then read type/name with GPT-4.1 mini. Compare the name in code; route unclear/mismatched results to replacement or host review.
3. Answer guest questions and add appropriate reminders in separate messages. Respect pause requests and avoid reminders while checks are pending.
4. Save completion only after every guest satisfies requirements and essential arrival information is provided. Show guest and protected host notices; preserve isolation, retry safety and reload progress.
5. Test fictional images/PDFs through the actual image reader and live browser. Publish on the existing Convex link. Report real-ID evaluation and external delivery as separate, unproven capabilities.

Status: deployed on the existing production Convex site on 13 October 2026. Live Chrome checks passed for Aadhaar/PAN/passport fictional-image reading, PDF reading, wrong-name rejection, three-guest completion, reload/isolation, reminder pause, host data protection, host-created property tests and phone widths. 27 automated checks and TypeScript validation passed. Real-ID accuracy, real booking integration and external notifications remain future work. No WhatsApp integration or design overhaul in this phase.

## Implemented: admin dashboard and property URL import

Requested 12 October 2026. These are must-have features, ahead of live WhatsApp. This order supersedes older instructions to defer the dashboard. Requirements are recorded in PRODUCT.md. Core implementation is published. The owner account is configured and authenticated production browser checks passed for login, the supplied Airbnb import, saved edits/reload, duplicates, private-address rejection and sign-out. Airbnb and SaffronStays imports were also tested in development. Keep the published landing page and free Hermes demo working throughout.

1. **Admin entry and authentication.** Add the requested top-right **Sign up** button and an admin ID/password entry page. Set up protected admin pages and Convex access, failed-login feedback and sign-out. The owner has supplied credentials and the production account is configured; never commit them or put them in browser code. Prove correct login, rejection of incorrect login, and protection of direct page/data access.
2. **Existing property catalogue.** Show all existing property records from Convex in the authenticated dashboard, with a detail view. Keep fictional test sessions separate. Prove that real stored properties and their details appear and survive reload.
3. **Import a property from a URL.** Add Add property with a listing-link field. The agent reads an Airbnb or other property-listing page, extracts its available property facts, maps them to the relevant Convex fields and automatically saves the property. Store source URL, import time and additional useful listing notes. Show progress, saved results and missing fields. Start by proving extraction from actual Airbnb and one other listing website; do not promise universal coverage before checking it.
4. **Reliable import outcomes.** Handle invalid/inaccessible/unsupported links, partial information and repeated listing URLs. Offer retry or manual entry after failure; permit corrections to imported facts. Restrict the importer to public website addresses, and treat page text as data rather than instructions. Prove no invented facts, silent duplicates or unintended overwrites. Images are optional for this flow; manual uploads are a separately specified step.
5. **Verify and publish the complete admin flow.** On the existing Convex website, sign in, inspect an existing property, import a real listing, compare saved fields with its source, reload the dashboard and sign out. Verify both target source types, error recovery, signed-out data protection and that public visitors can still test fictional stays without logging in.

Next: owner review of the live dashboard and imported property facts. Production checks passed with the owner-approved credentials on 12 October 2026; setup secrets were removed after the password was hashed. The second listing source was tested in development, not production. Visual redesign and manual photo uploads remain deferred.

## Existing build: Hermes sandbox — preserve and check

Approved 12 October 2026 and already implemented with browser verification. Public visitors enter directly, choose a fictional stay loaded from Convex and chat without a key or form. Keep these checks as the baseline while adding admin features; this is not a claim of user sign-off on every milestone.

1. Select a fictional booking and receive a real Hermes answer from saved property details.
2. Test conversation memory and host input for unknown or permission-dependent questions.
3. Save updated context, switch between isolated bookings, reload history and restart one test.
4. Verify desktop/phone layout and retry failures in the real browser flow.

Use the sandbox sections in PRODUCT.md, DESIGN.md and AGENT.md. No milestone is complete until its actual flow has been verified. Preserve the existing landing page and manual ID review work.

## Later: live guest onboarding

After the browser pre-check-in flow passes, evaluate the document reader on authorised real samples in a protected environment, decide real-ID retention/access rules, then connect actual booking data and WhatsApp. Verify sending, receiving and completion-notification delivery separately. Fictional test completion does not prove government authenticity or physical check-in.

Parked (not now):
- Inquiry form popup before testing
- In-stay concierge
- Menus and food ordering
- Personalised upsells
- Things to do and local recommendations
- Early check-in and late checkout against live availability
- Housekeeping and maintenance workflows
- Payments for add-ons
- Booking modifications
- Refunds
- Pricing and inventory management
- Checkout automation
- Advanced analytics
- Automatic permanent learning without host review
- PMS / channel-manager integrations beyond the existing LOGOUT booking source
