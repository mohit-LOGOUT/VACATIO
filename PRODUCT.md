# Product

## Next build: authenticated admin dashboard and property import

Requested 12 October 2026. **These are must-have features**, next after the public Hermes sandbox and before live WhatsApp integration. This section supersedes the earlier plan to defer the dashboard until after WhatsApp. Implementation status: the ID/password screen, protected catalogue, editable details, and listing-import workflow are built. Development browser checks verified login, edits/reload, duplicates, failure handling and sign-out; real Airbnb and SaffronStays imports were saved in the development database. The owner account is now configured on production. Live Chrome checks passed for correct/incorrect login, the supplied Airbnb import, editing/reload, duplicate protection, blocked private URLs, phone layout and sign-out. The second listing source was verified in development only. Visual redesign and photos are deferred.

### Admin entry and access

- Add a **Sign up** button at the top right of the landing page, using the requested label.
- The button opens the admin entry page. Require an admin ID and password before showing the dashboard or allowing access to its property data.
- The owner has provided the ID and password, and the production account is configured. Do not put credentials in these documents or browser code. The requested first version uses the owner's configured admin credentials; public account creation is not part of this requirement.
- Support sign-out, reject incorrect credentials, and protect both the admin pages and their Convex reads and writes. Opening an admin URL directly must still require authentication.
- The existing fictional-booking demo remains freely available without signing in. Adding an admin entry must not put a login or inquiry form in front of that demo.

### Property dashboard

After signing in, show all property records already added to the existing Convex property catalogue, plus properties imported subsequently. Allow the admin to open a property and inspect its saved information. Use the existing Convex database; do not substitute a hard-coded property list or treat visitors' fictional test sessions as the real catalogue.

### Must-have: add a property from a listing URL

**Core journey:** sign in → open the property dashboard → choose Add property → paste an Airbnb or another property-listing website URL → start import → the agent reads the listing, extracts its available facts, and automatically saves them into the relevant property fields in Convex → the new property appears in the dashboard.

- Airbnb and other property-listing websites are target sources. Import must read the actual supplied page; canned examples or manual retyping do not satisfy this feature.
- Extract all available property information relevant to the catalogue and arrival assistant: listing title, description, property type, published location/address, guest capacity, bedrooms, beds, bathrooms, amenities, check-in/out times, house rules, parking, and any published directions, access instructions or ID requirements.
- Map the extracted facts into the corresponding Convex fields. Retain additional useful listing details in property notes rather than silently dropping them. Save the source URL and import time alongside the property.
- Only save facts supported by the listing. Mark absent or uncertain fields as needing details; do not invent an exact address, entry code, parking provision or other missing information. The admin can fill gaps and correct imported values.
- Show progress and an honest outcome: imported, imported with missing details, or failed. If a page is inaccessible, blocked or unsupported, explain that and offer retry or manual entry. Never call an unsuccessful import complete. Support for every website is a goal to validate, not an already-proven capability.
- Recognize a repeated listing URL and offer to open its existing property rather than silently creating a duplicate or overwriting saved details.
- Photos may be uploaded manually in a separate step. Automatic image downloading is not required, and missing photos must not block importing and saving property information. The manual photo-upload flow can be specified separately.

### Proof required before calling this complete

1. The top-right button opens admin entry; incorrect credentials and signed-out direct access cannot reveal property data. The owner's configured credentials open the dashboard, and sign-out removes access.
2. Existing Convex properties appear, and a property's saved details remain available after reloading.
3. An actual Airbnb listing and at least one other property-listing website import into the correct fields in Convex. Compare saved values against the source pages and verify the resulting properties in the dashboard after reload.
4. Missing facts remain visibly missing, an inaccessible URL produces a recoverable failure, and importing the same listing again does not silently duplicate it. A fallback alone does not establish that a target source works.
5. A property can be imported without images, and the public fictional-booking demo still works without admin login.

## Existing build: public Hermes sandbox

Public demo requirement (12 October 2026): anyone landing on the website can choose a fictional booking and its property and immediately chat with Hermes. Load the sample data from Convex automatically. Do not require sign-up, an access key, booking creation or an inquiry form. Keep each visitor’s conversation and test edits independent behind the scenes. An inquiry popup is later work.

Updated 12 October 2026. This section defines the existing sandbox to preserve while building the admin features above. The broader guest onboarding product remains the destination; we first prove its conversation flow with fictional bookings in a browser.

**Who uses this first:** any website visitor, including vacation rental operators, acting as a fictional guest to test Hermes.

**The job:** choose a supplied fictional booking and property, then have a realistic arrival conversation, check its answers and supply host input when it does not know enough.

**First value:** the operator asks an arrival question in the sandbox and receives a correct answer based on the selected booking and property, then asks a follow-up that Hermes understands from the conversation.

### First-build journey

1. Open **Test Hermes**, the WhatsApp-like browser interface specified in DESIGN.md. A working AI assistant powers replies; predefined replies do not count as a working agent.
2. Select one of two clearly labelled fictional bookings. Each has a guest, property, stay dates and guest count. Sample property context includes check-in/out times, location/directions, entry instructions, parking, house rules and ID requirements.
3. Inspect or edit the test booking and property details, then save them. These saved facts are the source for future replies; they are not a list of manually trained question-and-answer pairs.
4. Read Hermes's booking-specific welcome and type as the guest.
5. Hermes reads only this booking's property facts and conversation history, and answers warmly and briefly. It remembers follow-up questions within that conversation.
6. See a factual activity summary showing the context used, or a request for host input. Activity reflects actual work and does not expose private internal reasoning.
7. If information is missing or a request needs permission, Hermes explains that host input is needed. It does not invent facts, approve early check-in, change bookings or claim someone has been notified.
8. Supply a host answer in the sandbox; Hermes uses it to continue the guest conversation. This answer is conversation-specific unless the operator separately edits and saves property details.
9. Switch to another booking and test again. Conversations and facts remain separate. Restarting a test clears only that selected conversation and activity after confirmation, preserving its booking and property details.
10. Reload and confirm saved context and conversation history are retained. Failed replies preserve the conversation and offer retry without duplicate messages.

### Scope of the first working version

Must have: editable dummy booking/property context; a real Hermes agent; browser chat; saved conversation history per booking; follow-up understanding; answers grounded in the selected context; host input for unknown or permission-dependent questions; truthful activity/error states; restart and booking switching; responsive layout matching the sandbox section of DESIGN.md.

Outside the sandbox itself: admin property management (the next build above), WhatsApp integration or sending real messages, booking API/PMS integration, billing counters, real guest onboarding, ID uploads or automatic document verification, scheduled reminders, payments, booking changes, in-stay services, automatic permanent learning.

Hermes may explain saved ID requirements, but must not mark IDs verified or a guest ready for check-in based on a guest's chat claim. A text-only sandbox does not prove the document verification flow.

### Sandbox milestones and proof

1. Select a dummy booking, ask about parking or check-in time, and see a real agent answer correctly in the browser.
2. Ask a follow-up and confirm Hermes uses the conversation history.
3. Ask about an absent detail or early check-in; see Hermes request host input, supply it, and see the conversation continue correctly.
4. Change saved property details and confirm a subsequent answer uses the updated fact rather than an old answer.
5. Switch between two bookings and confirm that messages, host answers and property facts do not leak between them.
6. Reload to verify persistence; restart one test and confirm the other test and saved booking/property details remain intact.
7. Check the flow on desktop and phone widths, including a failed reply and successful retry.

Success: the operator can run these checks through the sandbox, trust the answer sources, and provide their own dummy property/booking details for a second round. Only then connect a WhatsApp number and test delivery separately. Full onboarding still requires the document and readiness milestones below.

### After the sandbox works

Build the authenticated admin property dashboard and URL import described above. Then connect WhatsApp to the same agent and booking context, verify sending/receiving and delivery, and add ID collection, document checks, missing-ID tracking and arrival-information delivery. The broader guest-operations dashboard remains later work. Sandbox testing is preparation for this live flow, not evidence that live messaging or full check-in works.

## Broader product: guest onboarding

<!-- impeccable:product-schema 1 -->
## 1. The job
When a guest is due to arrive, I want their identity checks, check-in details and arrival questions handled without my team stepping in, so I can get every guest ready for check-in without manual back-and-forth.

Other moments it happens: when a guest has not submitted all required IDs, when multiple guests are checking in together, when a guest asks for directions, check-in timing, access details or other arrival information.

Who, by situation (not age, city or title): a vacation rental operator or property management company managing upcoming guest check-ins and repeatedly chasing guests for IDs or answering the same pre-arrival questions.

Today they hire: themselves, their operations team, property managers or caretakers using WhatsApp, calls and manual follow-ups.

More than one person in the product? Yes. The guest interacts with Logout, but the person we build for this weekend is the vacation rental operator / property management company.

What needs doing: collect the required guest IDs before arrival, make sure the uploaded files are actually valid IDs, answer pre-arrival questions from the booking and property context, and escalate anything that needs human input.

How they want to feel: in control and free from anxiety, knowing someone is taking care of the guest without needing their constant involvement.

How they want to look to others: caring, responsive and available to the guest without appearing operationally stretched.

The bench: end user [Guest], decision maker [Owner / Property Management Company], who pays [Owner / Property Management Company]

The one we serve first: Property Management Company

## 2. The switch
What they'd fire: their team or themselves manually answering guest WhatsApp messages, chasing for IDs and repeatedly checking whether pre-arrival onboarding is complete.

The forces that matter:

Push, outside them (what's going wrong in their life right now): guests message late at night, responses get delayed, IDs are still missing close to check-in, and the team keeps getting pulled into repetitive follow-ups.

Pull, inside them (what they've always wanted): someone handles guest onboarding and pre-arrival questions professionally 24x7, and only brings the operator in when human help is actually needed.

Anxiety (the risk of trying you: what they tried before, or a decision that's hard to undo): “AI will give the wrong answer, accept the wrong document, or tell me the guest is ready when they are not, so I will still have to manually check everything.”

Habit (the way they already do it): manually answer every question on WhatsApp, ask guests for IDs, open the files themselves and keep following up until everything is complete.

What the product does about each:

Push -> Logout follows up for IDs and handles routine arrival questions before the guest reaches the property.

Pull -> Logout behaves like the first line of guest operations and escalates only when it cannot safely complete the job itself.

Anxiety -> Logout verifies that uploaded files are actually the required identity documents, answers only from booking and property context, and escalates when it is unsure instead of guessing.

Habit -> Logout starts with one real booking and lets the operator see the full pre-arrival flow work correctly before trusting it with more guests.

The one worry onboarding must remove: “I should not have to check whether the AI did the job correctly.”
## 3. The core journey

### Flow

1. **[Host] Adds the booking**  
   The host adds or imports the upcoming guest booking and property details.

2. **[LOGOUT AI] Reads the booking context**  
   LOGOUT AI understands the guest, stay dates, number of guests, property rules and ID requirements.

3. **[Guest] Receives the pre-arrival WhatsApp message**  
   The guest is greeted and told what needs to be completed before arrival.

4. **[Guest] Uploads the required IDs**  
   The guest submits their own ID and the IDs of the other guests in the booking.

5. **[LOGOUT AI] Checks the uploaded files**  
   LOGOUT AI verifies that each upload is actually the required identity document and is readable.

6. **[Guest] Gets asked again if something is missing or invalid**  
   LOGOUT AI follows up for a missing guest ID, wrong document or unusable upload.

7. **[Host] Sees the onboarding status update**  
   The host can see which guests are complete, which IDs are missing and which documents have been flagged.

8. **[Guest] Receives arrival and check-in information**  
   LOGOUT AI sends the relevant check-in timing, access instructions and essential house rules.

9. **[Guest] Asks an arrival question on WhatsApp**  
   For example: “Can we arrive early?”, “Where do we park?” or “How do we enter the property?”

10. **[LOGOUT AI] Answers from the booking and property context**  
    If the answer is known and safe, LOGOUT AI replies without involving the host.

11. **[Host] Receives an escalation if LOGOUT AI cannot safely answer**  
    The host sees exactly what the guest asked and why LOGOUT AI needs help.

12. **[Host] Resolves the escalation**  
    The host gives the missing answer or corrects the information.

13. **[LOGOUT AI] Replies to the guest**  
    LOGOUT AI continues the conversation on WhatsApp using the host's resolution.

14. **[LOGOUT AI] Marks the onboarding complete**  
    All required IDs are valid and the guest has the information needed to arrive.

15. **[Host] Sees “Ready for check-in”**  
    The host knows no further pre-arrival action is required.

16. **[Guest] Arrives at the property**  
    The guest is welcomed instead of being asked to complete administrative work.

17. **Job done**  
    The guest reaches the property ready for check-in, while the host only intervenes when LOGOUT AI genuinely needs help.

## 4. Onboarding

**First value (the moment it first does the job for them):**  
Logout reads one real booking and the property information, then correctly handles the first pre-arrival guest interaction — for example, asking for IDs or answering an arrival question.

**The smallest commitment we ask for:**  
One real booking + the minimum property information needed for check-in: check-in timing, location/access instructions, house rules and ID requirements.

**The worry it removes (from section 2):**  
“AI is stupid, will give the wrong answer, and I’ll still have to manually check on it.”

### From opening the link to the first value

**1. Operator opens Logout and gives it one real booking**  
Logout reads the guest name, stay dates, number of guests and property.  
**Removes:** “I don’t want to spend hours setting this up.”

**2. Operator gives Logout the minimum check-in information for the property**  
Check-in timing, directions/access, ID requirements and essential house rules. No Q&A database.  
**Removes:** “Don’t ask me to keep adding Q&As to the system.”

**3. Logout shows how it would handle that guest’s pre-arrival onboarding**  
It drafts/sends the ID request and can answer a real arrival question using the booking and property context.  
**First value:** the operator sees that Logout can correctly handle a real guest without being manually taught every question.

**Login:**  
No login is needed for the public fictional-booking demo. The admin dashboard and real property catalogue require the configured admin ID and password, as specified in the next-build requirements above.

**What we don’t ask on day one:**  
Profile setup, full property catalogue, long product tour, complete SOPs, FAQs, PMS integration, staff permissions, payment setup.

**What we ask later, and when:**  
Additional property information only when Logout encounters something it cannot safely answer from the existing context.

## 5. v1
Does (the must haves: one person finishes the one job): understand one real booking and property context; answer pre-arrival and check-in questions from that context; collect required guest identity documents; verify that the uploaded files are actually valid identity documents before marking them as received; track which guest documents are still missing; send the correct arrival/check-in information; escalate when it does not know the answer instead of guessing.

Doesn't (not this sprint: parked, not forgotten): menus, upsells, in-stay concierge, housekeeping coordination, checkout flows, payments, pricing, inventory, refunds, booking modifications, PMS replacement.

Nice to have (only after the must haves work): local recommendations, early check-in and late checkout requests, housekeeping and maintenance tasks, payments for add-ons, PMS updates, in-stay support and checkout automation.

How I'll know it worked (what they do again, not what they say): a vacation rental operator gives Logout a second real booking and lets it handle that guest's pre-arrival ID collection and arrival questions without manually taking over.

## 6. The riskiest guess
If this is false, the product is pointless: Logout can reliably tell whether the files uploaded by guests are actually the required identity documents, and does not approve a guest for check-in when they have uploaded a random PDF, wrong document or unusable file.

Thirty-minute check, no code (run it while you build), and what happened: give the AI a mixed set of real identity-document images, blurry documents, wrong document types and random PDFs, and check whether it correctly accepts the valid documents and rejects or escalates everything else. What happened: MISSING.

## 7. Milestones
1. I can upload a valid identity document and a random PDF, and Logout accepts the ID but rejects the random file.
2. I can give Logout one real booking and property context, ask an arrival question, and get the correct answer.
3. I can start onboarding for a booking and the guest receives an ID request.
4. I can upload IDs for multiple guests and see exactly which required documents are still missing.
5. I can see Logout mark the guest as ready for check-in only when the required valid IDs have been received.
6. I can see Logout send the guest the correct arrival and check-in information.
7. I can ask something Logout cannot safely answer and see it escalate instead of making up an answer.
8. I can close it, reopen it, and my data is still there.
