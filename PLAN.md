# PLAN.md

## Next build: admin dashboard and property URL import

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

After the admin property catalogue and URL import are verified, connect WhatsApp and resume these milestones:

1. I can upload a valid identity document and a random PDF, and LOGOUT AI accepts the ID but rejects the random file.
2. I can give LOGOUT AI one real booking and property context, ask an arrival question, and get the correct answer.
3. I can start onboarding for a booking and the guest receives an ID request on WhatsApp.
4. I can upload IDs for multiple guests and see exactly which required documents are still missing.
5. I can see LOGOUT AI mark the guest as ready for check-in only when all required valid IDs have been received.
6. I can see LOGOUT AI send the guest the correct arrival and check-in information.
7. I can ask something LOGOUT AI cannot safely answer and see it escalate instead of making up an answer.
8. I can close it, reopen it, and my data is still there.

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
