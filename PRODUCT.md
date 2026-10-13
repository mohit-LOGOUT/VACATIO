# Product

## Current priority: host–Hermes feedback loop

Approved 14 October 2026. This is the next product rebuild direction, not an already implemented feature. The feedback loop is a core product requirement: Hermes helps the guest, then returns to the host with what it could not answer or do and asks for the information or guidance it needs to improve. The host can also correct Hermes proactively. This supersedes the form-led Train Hermes interface described below; preserve the working property catalogue, imports/photos, guest sandbox and pre-check-in checks.

### Insights: Hermes reports back to the host

Add **Insights** to the admin sidebar. Each insight comes from a real guest interaction and shows the property, relevant booking/conversation, the guest's question, Hermes's actual response, and a short explanation of the gap. Use plain language such as “I couldn't tell the guest whether parking fits a large car. Could you help me?” Link to the conversation so the host can see the context. Do not invent insights or claim a host/property page is outdated without evidence.

Surface unanswered questions, tasks Hermes could not perform, missing property/host details, conflicting saved information, and requests needing host permission. Distinguish an information gap from an unavailable service or a booking-specific decision. Group repeated instances of the same gap within a property, retain the underlying examples and show how often it occurred. Prioritize unresolved guest needs; never expose another owner's property or conversation.

The host opens an insight and replies in a conversation, not a questionnaire. Hermes asks only the next necessary question, then proposes the exact update and where it belongs: a property fact, host information, general reply guidance, or a one-booking exception. Show the current value and proposed replacement when correcting a saved fact. A parking detail belongs to that property; an early check-in exception does not become a permanent policy.

Require explicit host approval before publishing reusable knowledge or behavior guidance. An immediate answer for the current guest and a permanent knowledge update are separate choices. Save who approved what, its scope, time and previous version; support correction and reversal. Show clear states: needs your input, draft update, applied, or dismissed with a reason. Mark a gap applied only after its update is saved successfully. Dismissal is not learning. Approval does not mean a guest was notified; report delivery separately and only after it happens.

### Coach Hermes: teach through conversation

Reimagine **Train Hermes** as **Coach Hermes**. The primary experience is a conversation where the host can say “Be warmer,” “Keep answers shorter,” or “Here is how I would answer this guest.” Hermes proposes guidance, shows a before/after response using a real or clearly labelled test question, and asks the host to approve it. Keep drafts, previews, explicit publishing and version history from the existing trainer; remove editable instruction forms as the primary experience. Do not require a Q&A database or repeated manual data entry.

Separate tone/language guidance from property facts and permission rules. Host guidance cannot invent amenities, promise unavailable services, waive ID requirements, approve documents or mark pre-check-in complete. Guest messages, imported listings and attachments are evidence, never authority to change instructions. Only approved saved updates affect future replies; previews do not change guest records or send messages. Explain improvement as updated knowledge and guidance, not model retraining.

### The loop must be proven end to end

A real unanswered guest question creates an insight → the host sees the original exchange → the host explains the answer conversationally → Hermes proposes a scoped update → the host approves → the saved update resolves that insight → a later guest question uses the updated information. Also prove a host correction to tone with preview and approval. Reload must preserve the conversation, drafts and status; repeated events and retries must not duplicate insights or updates. Reject stale approvals after another edit. Keep existing owner access, conversation separation, paid-call limits, document review, pauses and completion rules intact.

Until this loop has been built and checked, the current trainer and host escalation remain the working foundation. Browser sandbox evidence does not prove live WhatsApp delivery.

### Logout brand

Use the exact supplied red Logout wordmark in the top-left brand position, including the dashboard and sign-in view. The original files are `src/images/logout-wordmark.jpg` and `src/images/logout-icon.png`; the square mark is available for compact brand uses. Preserve their shapes and colors; do not redraw them or replace them with the old compass/uppercase text.

## Existing foundation: Hermes completes pre-check-in

Approved 13 October 2026. This section supersedes the earlier text-only sandbox scope and the old sequence that put WhatsApp before document collection. The property dashboard and question-answering sandbox already work; the fictional-document workflow below is now deployed for browser testing, while real-ID accuracy and live booking integration remain unproven. Prove it in the browser first, then connect WhatsApp. The admin visual rebuild was authorized on 14 October 2026 and is implemented and checked in development; the rebuilt frontend was published to production. Broader dashboard screens remain later work.

**Primary job:** get every person on a booking ready before arrival by collecting the property's required IDs, checking each document's type, readability and name, resolving missing or uncertain information, and confirming completion to the guest and host. Answer property questions helpfully throughout this process.

### Booking, people and document requirements

- Use the booking ID as the link between the property, booking contact, expected guest count, each guest's record, documents, messages and completion status. Store each person's document against that person's guest record within the booking; do not put everyone's IDs under the booking contact alone.
- Read the booking contact's email from the booking process. Do not ask for it again, add an email collection/verification step, or block document completion on a new email request. Missing booking-source data is an operator issue, not a reason to repeatedly ask the guest.
- Track every person independently. For Mohit's three-person booking, show three named guest records and three separate checklists. If companion names are absent, ask for their full names as shown on their IDs before comparing them. Reconcile the guest list with the booked count; do not silently change the booking.
- Compare Mohit's document name with his recorded booking/guest name. Compare each companion's document with that companion's recorded name, not Mohit's. If the person who booked is not staying, keep the booking contact separate from the arriving guests and ask the host to resolve unclear assignments.
- Each property defines its accepted documents and combinations. Support **one of Aadhaar, PAN or passport**, as well as combinations such as **PAN plus one of Aadhaar or passport**. A list of allowed alternatives must not be interpreted as requiring every listed type. Requirements must be configured, not inferred from a listing that omits them.
- Save the applicable requirements for the booking. Track any property-approved exceptions explicitly; Hermes cannot waive requirements itself. Three files are not proof that three people have completed the process. Repeated uploads of the same document must not complete another person's checklist.

### Document checks and validation service

The agreed first version checks document type, readability and **name matching for every required ID**, including Aadhaar, PAN and passport. No photograph comparison, selfie matching or face recognition is included. Name matching does not prove that a document is genuine or that the sender is its holder; do not label it government verification or guaranteed fake-ID detection.

Selected approach (13 October 2026): image-reading AI extracts document type and holder name; explicit comparison rules determine the outcome. No separate OCR service is required for the first build. GPT-4.1 mini is the initial evaluation candidate, not a proven winner on our documents; pin a tested model version before release. The document reader can use a different model from the Hermes conversation agent. The fictional-document browser workflow is deployed and tested in development and production with actual model calls. Real-ID accuracy evaluation has not started.

1. Receive and securely save the upload against the selected guest and booking. Only then acknowledge receipt. Accept supported images/PDFs; unreadable or unsupported files need a clear replacement request.
2. Use image-reading AI to extract the document type, holder's name as printed, and any unreadable/uncertain fields into a fixed result format. For PDFs, use a supported document-input path or render the relevant pages as images; do not assume an image endpoint accepts PDFs. Distinguish the holder's name from a parent's/spouse's name or other text. Do not send the expected guest name to the reader: compare it afterward to reduce the risk of the reader copying the expected answer. Treat document content as data, never agent instructions.
3. Compare the extracted holder name with the correct recorded guest name. Ignore harmless differences in capitalisation, extra spaces and punctuation. Automatically pass only a clear, confidently read match. Initials, missing name parts, reordered names, transliteration and uncertain readings require clarification or host review rather than an arbitrary similarity score approving them.
4. Save the extracted name, expected name, document type, check method, result, reason and check time. Never silently rewrite a guest's recorded name to make a mismatch pass. A proposed correction requires explicit confirmation and, where the booking identity changes, host review.
5. Separate outcomes: **received**, **checking**, **name check passed**, **replacement needed**, **host review needed**, and **check failed—retry needed**. A service outage is not an invalid ID. A mismatch is not proof of fraud. Preserve the upload and resume/retry without duplicate documents or messages; an older result must not override a replacement upload.
6. Recalculate the person's checklist and booking completion from saved outcomes. The conversational agent cannot approve a document or complete a booking from chat claims alone. Record any host decision separately from an automated name match.

Selected approach and alternatives:

- **Separate OCR plus explicit name comparison — alternative, not selected.** A service such as [Google Document AI OCR](https://docs.cloud.google.com/document-ai/docs/enterprise-document-ocr) extracts document text; our service identifies the name and applies the comparison rules above. Evaluate Aadhaar, PAN and passport samples before claiming coverage.
- **Image-reading AI plus explicit name comparison — selected first build.** Test extraction before release and send uncertain cases to review. A model-generated confidence score alone cannot authorize acceptance. Check result completeness, apply the comparison rules outside the model, and measure false approvals on representative samples. It does not independently authenticate the document.
- **Document-specific authenticity checks — optional later enhancement.** For example, [UIDAI's digitally signed Aadhaar QR code](https://www.uidai.gov.in/images/Circular_regarding_dos_and_donts_of_the__tamper_proof_QR_code_scanning_by_residents__dated_22032023.pdf) provides a separate check of signed data when available. It is Aadhaar-specific, does not provide PAN/passport coverage, and does not replace matching the name to the guest. No document-specific authenticity service is selected or integrated yet.

Cost and reliability decision: image AI is selected for the first implementation, not on a promise of lowest cost or uninterrupted service. Measure cost per completed check, including multiple sides/pages, retries and host review. As an illustrative estimate using [GPT-4.1 mini pricing](https://developers.openai.com/api/docs/models/gpt-4.1-mini) and [image billing rules](https://developers.openai.com/api/docs/guides/images-vision), one 1024 × 1024 image plus 400 text-input tokens and 200 output tokens costs about $0.00114, or $1.14 per 1,000 single-image checks. This is a calculation, not a measured production cost, and excludes storage, tax and retries. Google's [basic OCR pricing](https://cloud.google.com/products/document-ai/pricing) lists a free initial tier and then $1.50 per 1,000 pages at standard first paid-tier rates; field interpretation is additional work. Neither price proves which approach will be cheaper on our actual uploads.

Protect the flow from failure: save the upload before starting the check; use bounded retries for temporary service failures; validate the returned format; keep a clear pending/retry status; route unclear readings to a replacement request or host review; and never mark success because a request timed out. Small text, blur and rotation must be included in the evaluation. No provider is promised to operate without failures.

### Friendly conversation and separate messages

- Start with a warm, booking-specific greeting and explain that completing the IDs before arrival helps everyone enjoy their stay without paperwork on arrival. Ask for the next missing item, not the entire checklist repeatedly.
- Answer the guest's actual question fully and naturally first, using saved property facts. If an ID reminder is appropriate, send it as a **second chat message**, not appended to the answer in one large bubble. Persist messages in order; reload/retry must not repeat either bubble.
- Use specific, friendly reminders: say whose ID is missing and which accepted options they can send. Do not interrupt every answer with another request. Skip reminders while a submitted document is being checked, after a recent request, when the guest has asked to continue later, and after completion. For a pending host review, explain that review is in progress instead of asking for the same ID again.
- Record pending items and the last reminder so the conversation can resume after questions or reload. Any later scheduled outreach must have an explicit timing/channel policy; the browser version must not pretend to send messages to a guest who is offline.
- Keep wording warm and varied without pressure, excessive apologies or repeated sales language. Explain the benefit once; later reminders can be shorter. Do not withhold useful property answers until IDs arrive.

Example when the property confirms parking inside the gate and one guest's ID remains missing:

**Message 1:** “Yes, there's a parking spot inside the gate—you can park your car there.”

**Message 2:** “When you have a moment, could you send an ID for your third guest? We'd love to finish the paperwork before you arrive, so you can settle in and enjoy your stay.”

After an upload is successfully saved:

**Receipt message:** “Thanks, we've received your ID. We're checking the name and details now and will let you know when the check is complete.”

After that person's required checks pass but another guest is incomplete:

**Result message:** “Your ID name check has passed, Mohit. Thank you!”

**Separate next-step message, when appropriate:** “We just need Priya's ID to finish pre-check-in for everyone.”

For a mismatch, ask for clarification without accusing the guest: “The name we read on this ID doesn't match Priya's booking details. Could you check that you've sent the right document for Priya?”

### Completion, host notice and stored records

- A person's checklist is complete only when their property's required document choice/combination passes the agreed checks or receives a recorded host resolution. Receipt alone is never acceptance.
- Booking pre-check-in is complete only when every expected guest is accounted for, each required checklist is complete, essential arrival information has been provided, and no blocking onboarding review remains open. An unrelated optional question must not block completion.
- Confirm to the guest only after completion is saved: “The ID name checks for all three guests have passed, and your pre-check-in is complete. We look forward to welcoming you!” Adapt wording honestly if a host reviewed a document instead of an automatic check passing.
- Create a host completion notice linked to the booking and guest checklist: “Mohit's booking: pre-check-in complete for all 3 guests. Required ID checks are complete.” Show the check method and any host decisions in the protected detail view, not full ID numbers in the notification.
- For this browser build, show the guest confirmation in chat and the host notice in the authenticated admin view. Keep any public-demo host preview confined to that visitor's fictional session. WhatsApp/email delivery is later work; never claim those notifications were sent now.
- Save completion separately from notification delivery so a failed notification can retry without rechecking documents or sending duplicate completion notices. If a relevant requirement, guest or accepted document changes, reassess readiness and clearly show any reopened task.
- **Pre-check-in complete / ready for check-in** means the pre-arrival tasks are finished. It does not mark the guest physically checked in or imply they have arrived.
- Keep files and results in protected storage linked to the guest and booking. Limit access to the correct booking session and authorised host; keep raw IDs out of public chat/activity, logs and generic model history. Before real-ID use, define the retention/deletion policy and the permitted validation-service handling. Do not expose existing real documents in the open demo.

### Required proof before calling this flow working

1. A three-person booking starts with three separate checklists and an existing booking email. Hermes requests missing guest names/IDs and never asks for the email again.
2. A property's one-of requirement accepts one allowed document; a combination requirement stays incomplete until each required part passes. Missing requirements trigger host setup, not guessed rules.
3. Aadhaar, PAN and passport checks compare the holder name to the correct guest. Test clear matches, harmless formatting changes, a parent's name, initials, mismatches, unclear text, the wrong document type, duplicate uploads and random PDFs. Ambiguous cases must not auto-pass.
4. A parking question receives a useful answer, with an appropriate friendly ID reminder in a separate bubble. Repeated questions do not produce repetitive reminders; a request to continue later is respected.
5. Successful upload gets a receipt acknowledgement before a later check result. Upload failures never say “received”; pending checks never say “complete.” A validation-service outage is retryable and does not imply a fake ID.
6. Two completed guests out of three remain incomplete. A replacement document can resolve the third guest's failure and complete the booking exactly once. The guest confirmation and protected host notice reflect the saved result.
7. Switching/reloading bookings preserves progress without leaking documents or messages. A guest chat instruction cannot approve an ID. Retry and late results cannot duplicate notices or overwrite a newer check.
8. Prove the workflow with clearly labelled fictional fixtures in the public browser demo. Fixture outcomes demonstrate the flow, not real validation accuracy. Separately evaluate the selected service on authorised document samples in a protected test before claiming real-ID support. Record results. Fictional Aadhaar/PAN/passport image and PDF checks passed on the live site on 13 October 2026; the authorised real-document evaluation has not run yet.

## Implemented foundation: authenticated admin dashboard and property import

Requested 12 October 2026. **These must-have foundation features are implemented**, following the public Hermes sandbox and ahead of live WhatsApp integration. This section supersedes the earlier plan to defer the dashboard until after WhatsApp. Implementation status: the ID/password screen, protected catalogue, editable details, and listing-import workflow are built. Development browser checks verified login, edits/reload, duplicates, failure handling and sign-out; real Airbnb and SaffronStays imports were saved in the development database. The owner account is now configured on production. Live Chrome checks passed for correct/incorrect login, the supplied Airbnb import, editing/reload, duplicate protection, blocked private URLs, phone layout and sign-out. The second listing source was verified in development only. Automatic listing-photo import was authorized on 14 October 2026 and is now implemented and checked in development; photo support is deployed, with production storage/data checks complete; authenticated cover/gallery UI was checked in development. Manual photo upload/editing remain later work. The owner authorized rebuilding the existing admin dashboard on 14 October 2026, superseding the earlier visual-redesign deferral. Properties, Train Hermes and explicitly fictional Guest tests now use the documented dashboard system while retaining their existing protected data/functions. Development checks cover imports, edits/reload, authentication, training and guest tests; the redesigned frontend was published to production at https://grateful-llama-909.convex.site/admin.html; authenticated redesigned flows were checked in development. Live signed-out admin entry, access protection and phone-layout checks passed on 14 October. Production Check-ins and One Inbox screens were not added.

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
- Authorized 14 October 2026: automatically import available real listing photos into our Convex file storage. Read the listing HTML once for text and photo candidates, save extracted property facts first, then run the bounded image downloads. Missing or failed photos must not block saved property information.
- Existing imported properties offer **Import photos**; the editor offers **Refresh photos** when photos exist. Import/refresh preserves edited property facts and existing photos, deduplicates source identities and fills eligible missing photos up to twelve stored images. The first available image is the cover; the editor gallery opens stored images. No manual photo upload or editing is implemented.
- Accept at most twelve JPEG, PNG or WebP photos per property, each up to 5,000,000 bytes. Check content type and file signature, impose download timeouts, validate public DNS addresses and recheck redirects. Exclude unrelated gallery/review/profile imagery rather than collecting every page image.
- Store each photo's source URL and Convex file identifier as provenance. Protected admin list/detail queries compute stored-image URLs; the UI does not hotlink source website images. These are real listing photos, not generated images. Loading, partial import, unavailable source, failed download and failed display remain distinct, truthful feedback. No photo success is inferred from saved text alone.

### Listing-photo implementation proof — 14 October 2026

Development checks passed: 40 automated tests, TypeScript checks, clean development backend push, and a sequential `scripts/check-property-photos.mjs` run with twelve real Airbnb photos. The browser loaded covers and the editor gallery; source identities deduplicated; edited facts stayed unchanged; reload retained photos; anonymous access was blocked; 320px, 390px, 768px and 1280px layouts had no page overflow. Existing `scripts/check-admin.mjs` sign-in/import/save/reload/duplicate/private-link/sign-out checks also passed. Final UI review returned Ship. An overlapping test run encountered another test's temporary note; a sequential rerun passed. Production backend deployment succeeded and the photo frontend was published at https://grateful-llama-909.convex.site/admin.html#properties (deployment `c49ebae7-902c-464e-8a6b-bad85639e3ee`). Photo-only backfill completed for Vana - A Thoughtfully Designed Stay; Shadow Barn: Cuckoo Landour w/ Balcony+Valley View; and Aum & Aura | Ganga Views | Yoga Haven | Tapovan, with twelve photos each (36 stored files total). Production storage checks confirmed supported image types and each file between 1 and 5,000,000 bytes. Before/after SHA-256 fingerprints of all non-photo property fields matched, confirming saved facts stayed unchanged. Live signed-out admin entry, configured sign-in, access protection and phone-layout checks passed. Authenticated cover/gallery UI was checked in development; production proof here covers saved data/storage and signed-out entry.

Fresh-import proof (14 October 2026): the development importer created Vana — A Thoughtfully Designed Stay with saved property facts and 12 real listing photos in one workflow. All stored image URLs loaded. This verifies new imports in addition to the photo-only imports checked on existing properties.

### Proof required before calling this complete

1. The top-right button opens admin entry; incorrect credentials and signed-out direct access cannot reveal property data. The owner's configured credentials open the dashboard, and sign-out removes access.
2. Existing Convex properties appear, and a property's saved details remain available after reloading.
3. An actual Airbnb listing and at least one other property-listing website import into the correct fields in Convex. Compare saved values against the source pages and verify the resulting properties in the dashboard after reload.
4. Missing facts remain visibly missing, an inaccessible URL produces a recoverable failure, and importing the same listing again does not silently duplicate it. A fallback alone does not establish that a target source works.
5. A property can be imported without images, and the public fictional-booking demo still works without admin login.

## Existing build: public Hermes sandbox

Public demo requirement (12 October 2026): anyone landing on the website can choose a fictional booking and its property and immediately chat with Hermes. Load the sample data from Convex automatically. Do not require sign-up, an access key, booking creation or an inquiry form. Keep each visitor’s conversation and test edits independent behind the scenes. An inquiry popup is later work.

Implemented baseline from 12 October 2026. The conversation capabilities below must remain working while the current pre-check-in priority adds per-person document collection and checks. The baseline is not the full onboarding product.

**Who uses this first:** any website visitor, including vacation rental operators, acting as a fictional guest to test Hermes.

**Existing baseline:** choose a supplied fictional booking and property, test arrival answers and supply host input. **Next outcome:** complete the per-person pre-check-in flow specified above in the same browser interface.

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

### Implemented baseline and next scope

Must have: editable dummy booking/property context; a real Hermes agent; browser chat; saved conversation history per booking; follow-up understanding; answers grounded in the selected context; host input for unknown or permission-dependent questions; truthful activity/error states; restart and booking switching; responsive layout matching the sandbox section of DESIGN.md.

The next browser build adds guest checklists, test-document uploads, type/readability/name checks, separate chat messages and guest/host completion notices as specified above. Continue to defer WhatsApp and other external message delivery, booking API/PMS integration, billing counters, unattended scheduled outreach, payments, booking changes, in-stay services and automatic permanent learning. Real-ID use requires the protected validation evaluation; the public demo uses fictional fixtures.

Hermes must never mark IDs checked or guests ready from a chat claim. The next build may report completion only from saved document-check results and booking readiness. The existing text-only sandbox does not yet prove this flow.

### Sandbox milestones and proof

1. Select a dummy booking, ask about parking or check-in time, and see a real agent answer correctly in the browser.
2. Ask a follow-up and confirm Hermes uses the conversation history.
3. Ask about an absent detail or early check-in; see Hermes request host input, supply it, and see the conversation continue correctly.
4. Change saved property details and confirm a subsequent answer uses the updated fact rather than an old answer.
5. Switch between two bookings and confirm that messages, host answers and property facts do not leak between them.
6. Reload to verify persistence; restart one test and confirm the other test and saved booking/property details remain intact.
7. Check the flow on desktop and phone widths, including a failed reply and successful retry.

Baseline success: the operator can run these conversation checks and trust the answer sources. Next, complete the document and readiness milestones above in the browser; only after that connect WhatsApp and test delivery separately.

### After the sandbox works

Use the implemented admin property catalogue as the foundation. Build and verify the complete pre-check-in workflow in the browser first, including the selected document service and protected host notices. Then connect WhatsApp to the same booking state and verify actual sending/receiving and delivery separately. The broader guest-operations dashboard remains later work.

## Broader product: guest onboarding

<!-- impeccable:product-schema 1 -->
## 1. The job
When a guest is due to arrive, I want their identity checks, check-in details and arrival questions handled without my team stepping in, so I can get every guest ready for check-in without manual back-and-forth.

Other moments it happens: when a guest has not submitted all required IDs, when multiple guests are checking in together, when a guest asks for directions, check-in timing, access details or other arrival information.

Who, by situation (not age, city or title): a vacation rental operator or property management company managing upcoming guest check-ins and repeatedly chasing guests for IDs or answering the same pre-arrival questions.

Today they hire: themselves, their operations team, property managers or caretakers using WhatsApp, calls and manual follow-ups.

More than one person in the product? Yes. The guest interacts with Logout, but the person we build for this weekend is the vacation rental operator / property management company.

What needs doing: collect the required guest IDs before arrival, check document type, readability and the holder name against the correct guest, answer pre-arrival questions from the booking and property context, and escalate anything that needs human input.

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

Anxiety -> Logout checks document type, readability and name against the correct guest, answers from booking/property context, and sends uncertain document checks or unanswered questions to the host. These checks do not guarantee authenticity.

Habit -> Logout starts with one real booking and lets the operator see the full pre-arrival flow work correctly before trusting it with more guests.

The one worry onboarding must remove: “I should not have to check whether the AI did the job correctly.”
## 3. The core journey

### Flow

1. **Read the booking.** Load property requirements, booking contact and existing email, guest count and named guests. Ask only for missing companion names needed for their checks.
2. **Welcome the guest and start pre-check-in.** Explain the benefit of completing IDs before arrival and ask for the next missing document. Start in browser chat; WhatsApp is a later channel.
3. **Answer questions throughout.** Give useful, friendly answers from saved property facts. Send a separate ID reminder when appropriate; do not repeat it after every answer. Escalate unknown facts or permission-dependent requests to the host.
4. **Receive and acknowledge each upload.** Save the file against the correct guest and booking, then say it was received and is being checked. Do not claim completion yet.
5. **Run document checks.** Identify the document type, read the holder name and compare it with that guest's recorded name. No photograph comparison. Save the method, result and reason.
6. **Resolve outstanding items.** Ask for a replacement when necessary, route ambiguity to host review, and track each person's remaining requirements. Resume after questions or reload without losing progress.
7. **Provide arrival information.** Share the saved arrival/check-in details and essential house rules. Missing essential information requires host input.
8. **Confirm readiness from saved records.** Account for all guests, satisfy each document requirement and resolve blocking onboarding issues. Then save pre-check-in completion.
9. **Confirm to both sides.** Send the guest a completion message and create the protected host notice. Track notification delivery separately and retry failures without duplication.
10. **Welcome the guest on arrival.** Pre-check-in completion means the paperwork is ready; physical arrival/check-in remains a separate event.

## 4. Onboarding

**First value (the moment it first does the job for them):**  
Hermes reads a booking and its property requirements, shows the named guest checklist, and begins collecting the next missing ID while answering arrival questions. Full success is completion for every guest and a saved host notice.

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
It sends a friendly request for the next missing guest ID in browser chat and can answer an arrival question, using a separate message for an appropriate reminder.

**First value:** the operator sees that Logout can correctly handle a real guest without being manually taught every question.

**Login:**  
No login is needed for the public fictional-booking demo. The admin dashboard and real property catalogue require the configured admin ID and password, as specified in the admin requirements above.

**What we don’t ask on day one:**  
Profile setup, full property catalogue, long product tour, complete SOPs, FAQs, PMS integration, staff permissions, payment setup.

**What we ask later, and when:**  
Additional property information only when Logout encounters something it cannot safely answer from the existing context.

## 5. v1
Does (the must haves: one person finishes the one job): understand one real booking and property context; answer pre-arrival and check-in questions from that context; collect required guest identity documents; acknowledge successfully saved uploads immediately, then check type, readability and each holder name against the correct guest; support alternative and combined document requirements; track missing items per person; use the existing booking email without collecting it again; send separate friendly answers and appropriate reminders; confirm saved pre-check-in completion to guest and host; send the correct arrival/check-in information; escalate when it does not know the answer instead of guessing.

Doesn't (not this sprint: parked, not forgotten): menus, upsells, in-stay concierge, housekeeping coordination, checkout flows, payments, pricing, inventory, refunds, booking modifications, PMS replacement.

Nice to have (only after the must haves work): local recommendations, early check-in and late checkout requests, housekeeping and maintenance tasks, payments for add-ons, PMS updates, in-stay support and checkout automation.

How I'll know it worked (what they do again, not what they say): a vacation rental operator gives Logout a second real booking and lets it handle that guest's pre-arrival ID collection and arrival questions without manually taking over.

## 6. The riskiest guess

The document service can reliably read each supported ID's holder name and distinguish clear matches from uncertain or mismatched names without falsely approving a guest. Reading an image is not proof of authenticity or of the sender's identity.

Validation trial: use authorised samples for Aadhaar, PAN and passport, including clear/blurred text, alternate name formatting, parent names, mismatches, incorrect document types and random PDFs. Record extraction accuracy and false approvals separately from whether the conversation works. Uncertain results must go to review. Status: **fictional image/PDF flow tested with GPT-4.1 mini on production; authorised real-ID accuracy evaluation not run**.

## 7. Milestones

1. A booking with three named guests and an existing contact email starts three individual ID checklists without asking for the email again.
2. Hermes answers an arrival question fully and gives an appropriate, friendly ID reminder as a separate message without nagging.
3. Each successful upload is saved against its guest and booking and acknowledged as received before checking finishes.
4. Aadhaar, PAN and passport type/readability/name checks pass or request replacement/review based on saved results, with no photograph matching or unsupported authenticity claims.
5. Property requirements support both one-of alternatives and required combinations; two completed guests out of three never complete the booking.
6. Resolving the final required check and other blocking onboarding tasks saves pre-check-in completion and produces the guest confirmation and protected host notice without duplicates.
7. The browser flow survives reload, booking switching, failed checks, replacements and retries; unrelated questions do not lose progress or block completion.
8. After browser proof and protected document-service evaluation, connect WhatsApp and verify real message delivery separately.

## Host trainer — 13 October 2026

Must-have: a protected **Train Hermes** section inside the admin dashboard. The host describes what Hermes should do differently; the trainer agent proposes editable speaking guidance and options. The host previews a real model reply against a fictional booking and either the demo property or a saved property, then chooses **Save for Hermes**. Unsaved drafts do not affect guests. Saved instructions apply across test bookings to future replies; in-progress replies keep their starting version. Keep the latest ten versions accessible for restoring a draft.

Training controls tone/language, how thoroughly to answer, relevant saved arrival context, a natural offer of help, and ID-reminder frequency. Default: first eligible answer gets a separate warm reminder immediately, later reminders at least two minutes apart. A host may choose a reminder after every eligible answer. Request only the missing document groups for the next eligible guest, respecting one-of and combined requirements. Do not chase completed, paused, or waiting-for-review guests.

Preview scenarios: all guests missing IDs, only the third guest missing, IDs being checked, pre-check-in complete, and paused reminders. Preview calls use the same response generator and reminder rules as guest chat, without writing guest conversations or changing bookings. Preview is a single-turn example; real conversations also include history.

These are saved instructions, not model fine-tuning. Training must not invent property facts, change ID requirements, collect email again, authenticate government documents, mark guests complete, or bypass access checks. Property corrections belong in property details; checklist changes remain in guest setup. Only the signed-in owner can read/write training or call its AI tools. Bound suggestions/previews to 60 calls per owner per hour, validate text length, preserve revisions, and reject stale edits from another window.
