## 1. How the product works

Interface: Host uses a mobile-first web app to monitor upcoming check-ins, review exceptions and take over when needed. Guest uses WhatsApp to complete pre-arrival onboarding, upload IDs and ask arrival questions.

Business logic: When a booking enters the check-in window, LOGOUT AI starts onboarding automatically, collects and verifies IDs, sends arrival information and answers guest questions from booking and property context. If it is unsure, it escalates to the host instead of guessing.

Database: Properties and their context, bookings, guests, check-in status, required and uploaded IDs, ID verification status, WhatsApp conversations, current conversation owner, escalations, agent settings and learned property information.

Third party: Existing LOGOUT booking API for booking and guest data; WhatsApp Business API for guest messaging; AI/vision API for understanding conversations and checking uploaded IDs; secure file storage for identity documents. All API keys and credentials stay server-side in environment variables.

Not in v1: Payments, pricing, inventory, booking changes, refunds, in-stay concierge, menus, upsells, activities, housekeeping workflows, checkout automation, advanced analytics and automatic learning without host review.

When I report a bug, I'll name the part. Look there first, and tell me if you think I named the wrong one.

## 2. How we work

- Read IDEA_SCOPE.md, PRODUCT.md, PLAN.md and PROGRESS.md before anything else, and DESIGN.md before any screen work.
- Before writing code, tell me in two or three sentences what you think I'm after, then your plan. Wait for my yes. Don't guess.
- One milestone at a time: the next one in PLAN.md, working end to end. Nothing outside it.
- If I ask for something new mid-milestone, add it to the parked list in PLAN.md and carry on.
- Never say "done" until you've seen it work through a test or a screenshot at phone width and told me exactly how to check it on my phone.
- When I report a bug, find the cause before changing anything. Fix only that.
- When we add something new, write tests so what already works doesn't break. When I drop a feature, drop its tests.
- Build and test only where my users will actually use it: the host experience in the mobile-first web app and the guest experience on WhatsApp. Do not create separate test interfaces that bypass the real flow.
- After I confirm a milestone works: commit, push, and add one line to PROGRESS.md.
- Never put a key or password in code, in a VITE_ variable, or in a committed file. Anything secret stays server-side.
- Guest-facing interactions stay on WhatsApp unless the product flow explicitly requires opening a link, such as uploading an ID. Do not invent a separate guest app or screen.
