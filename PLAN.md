# PLAN.md

## Current build: Hermes sandbox

Approved 12 October 2026. Build the browser chat before WhatsApp or the dashboard.

1. Select a fictional booking and receive a real Hermes answer from saved property details. <- now
2. Test conversation memory and host input for unknown or permission-dependent questions.
3. Save updated context, switch between isolated bookings, reload history and restart one test.
4. Verify desktop/phone layout and retry failures in the real browser flow.

Use the sandbox sections in PRODUCT.md, DESIGN.md and AGENT.md. No milestone is complete until its actual flow has been verified. Preserve the existing landing page and manual ID review work.

## Later: live guest onboarding

These milestones resume after the sandbox works and WhatsApp is connected:

1. I can upload a valid identity document and a random PDF, and LOGOUT AI accepts the ID but rejects the random file.
2. I can give LOGOUT AI one real booking and property context, ask an arrival question, and get the correct answer.
3. I can start onboarding for a booking and the guest receives an ID request on WhatsApp.
4. I can upload IDs for multiple guests and see exactly which required documents are still missing.
5. I can see LOGOUT AI mark the guest as ready for check-in only when all required valid IDs have been received.
6. I can see LOGOUT AI send the guest the correct arrival and check-in information.
7. I can ask something LOGOUT AI cannot safely answer and see it escalate instead of making up an answer.
8. I can close it, reopen it, and my data is still there.

Parked (not now):
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
