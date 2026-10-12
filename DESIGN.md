# DESIGN.md

Before building or changing any screen, read DESIGN.md and follow it. If a choice isn't covered there, ask me instead of guessing.

## Current build: Hermes sandbox

Public demo requirement (12 October 2026): anyone landing on the website can choose a fictional booking and its property and immediately chat with Hermes. Load the sample data from Convex automatically. Do not require sign-up, an access key, booking creation or an inquiry form. Keep each visitor’s conversation and test edits independent behind the scenes. An inquiry popup is later work.

This is the next interface to build. It takes priority over the later dashboard screens described below. A website visitor tests as a guest in a browser chat; WhatsApp number integration comes later. Hermes is the assistant's name in this interface. The sandbox interface and Hermes backend were implemented on 12 October 2026. Browser checks verified real model replies, follow-ups, host input, updated saved context, booking separation, reload and restart, and layouts at 320px, 390px, 768px and 1280px. Live WhatsApp and full document onboarding remain unbuilt.

Published location: **https://grateful-llama-909.convex.site/**. The sandbox sits below the landing hero image; “Try with a booking” scrolls to it. A same-origin embedded sandbox preserves the approved chat design and expands to fit booking edits or host requests. `/sandbox.html` remains available as a direct view. The published frontend and Hermes backend use the same production deployment.

Reference: **[Hermes sandbox screenshot](design-refs/hermes-sandbox.png)**, supplied on 12 October 2026. Use its centered title, three-column layout, phone silhouette, generous empty space and familiar chat composition. The screenshot is a visual reference, not evidence of billing, available features or live agent activity.

### Layout and reference map

The screenshot is approximately 1964 × 1356 pixels. Measurements and colours below are visual estimates, not sampled values.

Read as a 5 × 5 grid:

| Row | Left two columns | Centre column | Right two columns |
| --- | --- | --- | --- |
| 1 | White margin; left panel begins near bottom | Centered title and subtitle; phone begins below | White margin; activity panel begins near bottom |
| 2 | Session card and explanatory caption | Phone header, greeting, chat | Activity card, then empty space |
| 3 | Empty space | Tall chat body | Empty space |
| 4 | Empty space | Tall chat body | Empty space |
| 5 | Empty space | Composer, home indicator and bottom phone frame | Empty space |

The phone is the visual focus. Side panels align with its top and remain lighter than the dark frame. Preserve this hierarchy, but fit the chat into the available screen height so sending a message never requires scrolling the whole desktop page.

### Elements from the screenshot

- Page: white background; centered “Test xyz” heading, approximately 48px bold; gray subtitle “Chat with your agent to make sure everything feels right.”, approximately 22px.
- Left card: white surface, thin pale border, approximately 24px corners and 32px padding. Coin icon, “Credits this session”, Reset with a circular arrow, large “0.00”, “Nothing spent yet”, divider, “Last reply”, “Avg / reply”, dash values, wallet icon, “Balance left”, “4,769.39”. Muted billing/reset caption underneath. These financial figures are reference content only; do not reproduce them as real product data.
- Phone: approximately 550px wide in the reference, near-black frame, deeply rounded corners, soft large shadow and small side buttons. Decorative status time, camera cutout, signal/Wi-Fi/battery icons and bottom home indicator.
- Chat header: deep teal surface, round mint robot avatar, “xyz”, “online”, back arrow and call/video icons. The latter icons are not functional requirements.
- Chat body: warm beige background, white left-aligned greeting bubble “Hello, how can I help you?” with soft corners and a small shadow; otherwise empty.
- Composer: pale gray strip, white pill input “Type a message” and round muted teal send button with a paper-plane icon.
- Right card: white surface, thin border, approximately 24px corners; sparkle icon, “Agent activity” heading and muted explanation of reading/searching/composing. Its compact size gives the chat room to breathe.

### Our screen: Test Hermes

Heading: **Test Hermes**

Subtitle: **Chat as a guest and test Hermes with a dummy booking.**

Small visible note: **Sandbox only. Messages stay here.**

Desktop layout: centered container, maximum width 1440px, 32px outer padding and 32px gaps. Three columns: flexible left panel (about 300–360px), phone chat (about 380–460px), flexible right panel (about 300–360px). All content is left aligned within panels; only the page heading is centered.

**Left: Test booking**

- Booking selector; clearly identify fictional sample bookings.
- Summary: guest name, property name, arrival/departure dates and guest count.
- Expandable “Property details”: check-in/out times, location/directions, entry instructions, parking, house rules and ID requirements.
- “Edit test details” opens labelled editable fields within this panel; “Save test details” and Cancel finish the edit. Validate required fields, dates and positive guest count. Failed saves retain the entered text and the last saved context.
- “Restart test” starts a fresh conversation for the selected booking after confirmation. Explain that it clears this test's chat and activity, not property or booking details. Do not imply provider charges are refunded.
- Switching bookings loads a separate conversation and its own activity. A reply already in progress stays with its original booking.

Use this panel instead of the reference's credits card. Do not add invented credit balances, price counters or billing notices. Usage tracking can be designed separately when actual billing data exists.

**Centre: Guest chat**

- Phone silhouette and chat colours follow the reference. Phone decorations are optional desktop-only, hidden from assistive tools, and never obscure messages or controls.
- Header: robot avatar, **Hermes**, and an honest status: “Ready”, “Replying…” or “Unavailable”. Do not claim a live WhatsApp connection or show “online” without a real connection state.
- Initial welcome uses the selected booking: “Hi [guest name], I’m Hermes, your arrival assistant for [property name]. Ask me about your stay.” Show only once per fresh conversation.
- Hermes replies on the left in white bubbles; guest messages on the right in pale green bubbles. Maximum bubble width 85%; preserve paragraphs, wrap long links and show readable timestamps.
- Scrollable message area; header and composer remain visible. Scroll to new messages when the reader is near the bottom; otherwise show a “New message” control.
- Bottom composer: labelled multiline input with “Type a message”, circular Send button. Enter sends; Shift+Enter adds a line. Send is disabled for empty input and during a pending reply; keep unsent text when a request fails.
- Show typing/loading feedback, failed-message feedback and Retry without duplicating an already accepted message.
- No call/video/back controls unless they have a working purpose. No attachment control until uploads and document checking are implemented; plain chat must never pretend that an ID has been verified.

**Right: Agent activity**

- Title: **Agent activity** with a quiet sparkle icon.
- Empty: “Send Hermes a message to see which booking details it uses.”
- During a reply show only actual events, such as “Reading booking”, “Checking property details” and “Writing reply”. Do not animate a fake search or expose private internal reasoning.
- After a reply show a short factual summary and source labels, such as “Answered using Parking in property details”. Show these only when supported by the underlying response data.
- Unknown or permission-dependent answers show **Needs host answer**, the guest question and a short reason. Hermes tells the guest that host input is needed; do not claim a host notification was sent.
- Provide a labelled host answer field and “Give answer to Hermes” for continuing the test. This answer belongs to this booking's conversation; it does not silently become permanent property knowledge.
- Failed requests show “Hermes couldn’t reply. Try again.” with Retry. Preserve the conversation and booking context.

### Sandbox colours, type and shape

This screenshot-specific palette applies only to the sandbox. The existing landing page and later host screens retain their palette below.

| Purpose | Value |
| --- | --- |
| Page and cards | #FFFFFF |
| Main text / phone frame | #111827 |
| Secondary text | #6B7280 |
| Small supporting text | #667085 |
| Borders / dividers | #E5E7EB |
| Chat header and enabled Send | #075E54 |
| Avatar | #8DECB0 |
| Chat canvas | #ECE5DD |
| Hermes bubble | #FFFFFF |
| Guest bubble | #DCF8C6 |
| Composer strip | #F3F4F6 |
| Error / needs attention | #B42318 |

Font: **Geist**, consistent with this project. Desktop title 40px/44px, panel headings 20px/28px semibold, chat and body 16px/24px, supporting text 13px/18px. Mobile title 28px/34px. Panel corners 24px, bubbles 16px with a subtly squared sender-side corner, composer pill fully rounded. Use 8px spacing steps, 24–32px panel padding and at least 44px touch targets. Use stronger supporting text contrast than the very pale text in the reference.

### Responsive behaviour and access

Breakpoints use the sandbox’s available width. When embedded below the landing banner, the landing page’s side padding reduces that width, so a 768px outer page may use the compact single-column sandbox layout. Keep this layout usable rather than forcing two cramped columns.

- At 1100px and above: three columns, chat about 560–720px tall depending on available height; preserve a usable message area on shorter screens.
- At 768–1099px: two columns, booking and activity stacked beside the chat; scale or remove decorative phone chrome to avoid squeezing text.
- Below 768px: one full-width chat, without an outer phone frame or imitation status bar. “Test booking” and “Agent activity” are collapsible sections above/below the chat. Keep selected guest/property visible near the chat header.
- Use available viewport height and allow for the mobile keyboard. Keep the composer reachable with no horizontal scrolling at 320px width.
- Inputs have visible labels; icon buttons have accessible names; keyboard focus is clearly visible. New status/reply updates are announced politely to screen readers. Reduced-motion settings suppress decorative transitions. Colour alone never communicates a failure or host request.

### Review before calling the interface working

Check at 320px, 390px, 768px and 1280px widths. Verify: send and receive a real Hermes reply; follow-up uses conversation history; property facts come from saved test details; an unknown question requests host input; host answer continues the conversation; switching bookings never mixes facts/messages; restarting affects only the selected test; errors retain messages and allow retry; reloading restores the intended saved conversation. Inspect the page visually and walk the chat flow in the browser. Record any untested item plainly.

The dashboard, live WhatsApp delivery, billing and automatic ID verification are later work. The user authorized sandbox implementation on 12 October 2026. The sandbox is built; the broader dashboard and live onboarding remain later work.

## 1. The feeling, in labels

- **Overall product:** calm and in control, by showing what needs attention and hiding operational noise.
- **LOGOUT AI:** alive but quiet, by using a subtle orb and short human summaries instead of making the product feel like a chatbot.
- **Check-in cards:** scannable and exception-first, by making guest status, missing IDs and “Needs your help” visible before secondary information.
- **Conversations:** familiar and human, by borrowing the simplicity of WhatsApp rather than inventing a new messaging interaction.
- **Visual style:** modern, warm and premium, through cream backgrounds, strong typography, rounded surfaces, generous whitespace and one red accent.

## 2. References, one per component

### Landing hero
Reference: **Landing hero: design-refs/landing-hero.png**

Take:
- Use this exact image as the landing page hero, without regenerating or recolouring it.
- The welcoming host, arriving guests and luggage communicate a warm arrival at a vacation rental.
- Keep the host and guests visible when adapting the image for phone and desktop screens.
- Keep the headline and main action on a separate cream surface so they remain easy to read.

Ignore:
- Do not copy the image's greens and blues into navigation, buttons or status colours.
- Do not add text over the detailed foliage or people.
- Do not imply that an in-person welcome is a required part of the product's check-in flow.

Palette fit and proposed fix:
- The greens and blues work with cream **#FFF7F0**, which echoes the villa walls and warm sunlight. Their strong saturation could compete with the red **#F04438** main action if the button sits directly over the image.
- Keep the image's original colours, frame it with generous cream space, and place the red main action beside or above it on cream. Use the image as the only large green/blue area; retain the section 3 palette for the interface.

### Check-in cards
Reference: **MISSING — add screenshot/link**

Take:
- One guest per card
- Clear hierarchy between guest, stay and status
- Easy to scan vertically on mobile
- Important exception visible without opening the card

Ignore:
- Commercial booking information
- Dense tables
- Multiple competing CTAs

### Conversation
Reference: **WhatsApp conversation UI**

Take:
- Familiar left/right message rhythm
- Clear timestamps
- Inline attachments
- Message composer that feels immediately understandable

Ignore:
- WhatsApp branding
- Status/Stories
- Calling controls
- Consumer messaging features unrelated to guest operations

### ID review
Reference: **MISSING — add screenshot/link**

Take:
- Uploaded document gets most of the visual attention
- Reason for the flag is immediately visible
- One obvious decision at a time

Ignore:
- Complex verification dashboards
- Multiple risk scores
- Back-office compliance tooling

### Property context
Reference: **MISSING — add screenshot/link**

Take:
- Information broken into clear editable sections
- Easy to scan what LOGOUT AI knows
- Editing feels lightweight rather than like configuring software

Ignore:
- Long setup wizards
- FAQ-by-FAQ bot training
- Dense PMS configuration screens

## 3. Type and colour

Font: **Geist**

Sizes: display **40px / 44px** for the main headline · heading **24px / 30px** · body **16px / 24px** · small **13px / 18px**

Text: **#171717** on **#FFF7F0**

Accent: **#F04438**, only on the main action, active LOGOUT AI state and information that genuinely requires attention

Errors: **#B42318**

## 4. Screens

Flow: booking becomes an upcoming check-in → LOGOUT AI starts onboarding → guest uploads IDs → LOGOUT AI verifies them → host resolves exceptions → guest asks arrival questions → LOGOUT AI answers or escalates → host resolves if needed → guest becomes ready for check-in → host sees ready

---

### Check-ins

For: seeing every guest arriving in the next 7 days and immediately knowing which check-ins need attention.

Top to bottom:
- Header: Check-ins
- “Next 7 days”
- Search / filter
- One guest card per row
- Each card shows:
  - Guest initials/avatar
  - Guest name
  - Property name
  - Number of guests
  - Check-in date
  - Expected check-in time
  - Pending collection, if any
  - LOGOUT AI orb
    - highlighted = agent is actively engaged
    - faded = no active interaction
  - One status:
    - Not started
    - Waiting for IDs
    - ID needs review
    - Needs your help
    - Ready for check-in
  - One short AI summary:
    - “Waiting for Aadhaar from 2 of 4 guests.”
    - “Uploaded document needs review.”
    - “Guest asked about parking. Answered.”
    - “Guest wants early check-in. Needs your help.”
    - “All IDs received. Ready for check-in.”

Main action: Tap guest card → Check-in Detail

Empty, first visit: “No check-ins in the next 7 days.”

Empty, coming back: “You’re all clear. No upcoming check-ins need attention.”

Loading: “Loading upcoming check-ins…”

Error: “We couldn’t load upcoming check-ins.” [Retry]

Done: the host can see who is ready, who is waiting on the guest, and who needs human attention without opening every booking.

If the AI answer is wrong: open the guest’s Check-in Detail and inspect the underlying status, document or conversation.

---

### Check-in Detail

For: understanding exactly what has happened with one guest’s pre-arrival onboarding.

Top to bottom:
- Guest name
- Property
- Check-in date and expected time
- Current status
- LOGOUT AI orb / current agent state
- Guest count
- Pending collection, if applicable
- ID completion:
  - Guest 1 — Verified
  - Guest 2 — Missing
  - Guest 3 — Needs review
- Arrival information status:
  - Check-in instructions sent
  - House rules sent
  - Arrival time received
- Short LOGOUT AI summary of the check-in
- Recent activity:
  - ID requested
  - ID uploaded
  - ID rejected
  - Reminder sent
  - Guest question answered
  - Escalation created

Main action: [Review issue] → opens the specific ID Review or Conversation that needs attention

Empty, first visit: “Onboarding hasn’t started yet.” [Start onboarding]

Empty, coming back: “No outstanding action for this guest.”

Loading: “Loading check-in…”

Error: “We couldn’t load this check-in.” [Retry]

Done: the host knows exactly what is complete and what, if anything, still needs attention.

If the AI answer is wrong: open the affected document or conversation and correct it there.

---

### Guest ID Upload

For: letting the guest submit the required identity documents from the WhatsApp link without involving the host.

Top to bottom:
- Property name
- “Complete your check-in”
- Short explanation of why the IDs are required
- Guests expected on the booking
- Status beside each guest:
  - ID needed
  - Uploaded
  - Verified
  - Try again
- Upload area
- Supported document instructions
- Privacy / document-handling note

Main action: [Upload ID] → document is checked by LOGOUT AI

Empty, first visit: “Upload the ID required for your stay.” [Upload ID]

Empty, coming back: “You still have IDs left to submit.” [Continue]

Loading: “Checking your document…”

Error: “We couldn’t verify this as the required ID. Please upload a clear image or PDF of the correct document.” [Try again]

Done: “ID received and verified.”

If the AI answer is wrong: guest can [Try again]; a document LOGOUT AI cannot confidently verify is sent to the host for review instead of being approved.

---

### ID Review

For: letting the host resolve a document that LOGOUT AI could not safely verify.

Top to bottom:
- Guest name
- Property
- Check-in date
- Which guest this ID belongs to
- Uploaded document preview
- LOGOUT AI assessment
- Reason it was flagged:
  - Document type unclear
  - Image unreadable
  - Wrong document
  - File does not appear to be an identity document
- Relevant booking requirement

Main action: [Approve ID] → ID becomes verified and onboarding continues

Alternative action: [Reject & ask again] → LOGOUT AI asks the guest for another document

Empty, first visit: “No IDs need your review.”

Empty, coming back: “You’re caught up. No documents need review.”

Loading: “Checking document…”

Error: “We couldn’t load this document.” [Retry]

Done: the document is either verified or sent back to the guest for replacement.

If the AI answer is wrong: host overrides LOGOUT AI by approving or rejecting the document.

---

### One Inbox

For: seeing guest conversations LOGOUT AI is currently handling and finding the ones that require human intervention.

Top to bottom:
- Header: One Inbox
- Search
- Filters:
  - All
  - AI handling
  - Needs your help
  - Human handling
- Conversation rows showing:
  - Guest initials/avatar
  - Guest name
  - Property
  - Last message
  - Time
  - Unread state
  - Handler: LOGOUT AI / You
  - Attention indicator

Main action: Tap conversation → Conversation

Empty, first visit: “No guest conversations yet.”

Empty, coming back: “No conversations match this filter.”

Loading: “Loading conversations…”

Error: “We couldn’t load your conversations.” [Retry]

Done: the host can immediately see which conversations LOGOUT AI is handling and which need a human.

If the AI answer is wrong: open that conversation and take over.

---

### Conversation

For: reviewing exactly what LOGOUT AI has said and taking over when human judgement is needed.

Top to bottom:
- Guest name
- Property
- Check-in date
- Current handler: LOGOUT AI / You
- LOGOUT AI orb
- WhatsApp-style conversation
- Guest messages
- LOGOUT AI messages
- Host messages
- Uploaded documents inline
- System events:
  - ID received
  - ID verification failed
  - LOGOUT AI escalated
  - Host took over
  - LOGOUT AI resumed
- Message composer when host is handling

Main action: [Take over] → LOGOUT AI stops replying and the host becomes the active responder

When the host finishes: [Hand back to LOGOUT AI] → LOGOUT AI resumes with the corrected conversation context

Empty, first visit: “No messages yet.”

Empty, coming back: “No new messages.”

Loading: “Loading conversation…”

Error: “We couldn’t load this conversation. Your messages have not been lost.” [Retry]

Done: the guest gets the correct answer and LOGOUT AI can continue handling the conversation.

If the AI answer is wrong: host taps [Take over], sends the corrected response, then hands the conversation back to LOGOUT AI.

---

### Listings

For: finding the property whose context the host wants to view or update.

Top to bottom:
- Header: Listings
- Search
- [Create listing]
- Active property cards
- Each card shows:
  - Property image
  - Property name
  - Location
  - Active/inactive state

Main action: Tap property → Property Context

Empty, first visit: “No listings yet.” [Create listing]

Empty, coming back: “No listings match your search.”

Loading: “Loading listings…”

Error: “We couldn’t load your listings.” [Retry]

Done: the host can find and open the property they want to manage.

If the AI answer is wrong: open the relevant property and correct its Property Context.

---

### Property Context

For: giving LOGOUT AI the factual information it needs to answer guests correctly for one property.

Top to bottom:
- Property name and image
- Check-in time
- Check-out time
- ID requirements
- How to reach
- Access / entry instructions
- Parking
- Essential house rules
- Wi-Fi information
- Other pre-arrival information LOGOUT AI can use

Main action: [Save changes] → LOGOUT AI uses the updated property context in future conversations

Empty, first visit: “Add the essentials LOGOUT AI needs to help guests at this property.” [Add details]

Empty, coming back: existing property context is displayed.

Loading: “Loading property information…”

Error: “We couldn’t save your changes. Your previous information is still active.” [Try again]

Done: “Property information updated.”

If the AI answer is wrong: host edits the incorrect or missing source information here and saves it.

---

### AI Agent Settings

For: controlling how LOGOUT AI behaves with guests, rather than what it knows about a property.

Top to bottom:
- LOGOUT AI Active / Paused
- Tone:
  - Warm & welcoming
  - Professional
  - Casual & friendly
- Guest greeting
- Greeting preview
- Behaviour controls:
  - Start onboarding
  - Follow up for missing IDs
  - Answer pre-arrival questions
  - Send arrival information
  - Escalate when unsure
- Host notification controls:
  - Needs your help
  - ID needs review
  - Check-in incomplete
  - Ready for check-in

Main action: [Save changes] → future LOGOUT AI conversations use these settings

Empty, first visit: “Set how LOGOUT AI should speak and when it should involve you.” [Use recommended settings]

Empty, coming back: current settings are displayed.

Loading: “Loading agent settings…”

Error: “We couldn’t save your changes. Your previous settings are still active.” [Try again]

Done: “LOGOUT AI settings updated.”

If the AI answer is wrong: behaviour/tone is corrected here; factual property information is corrected in Property Context; a live conversation is corrected in One Inbox.

---

### Agent Learning

For: letting LOGOUT AI tell the host what it could not answer and collect missing property knowledge so it can answer correctly next time.

Top to bottom:
- Header: Agent Learning
- Conversational daily summary:
  - “I handled 18 conversations today.”
  - “I needed help with 3.”
  - “There are 2 things you can teach me.”
- One learning conversation at a time
- LOGOUT AI asks the missing question
- Example:
  - “Guests keep asking what the weather is like at Pine House in December. What should I tell them?”
- Host response field
- Suggested learnings gathered from One Inbox:
  - “You told a guest that Pine House has parking for two cars. Should I remember this?”
- Learning states:
  - Needs your answer
  - Suggested
  - Learned
  - Ignored

Main action: [Save to property context] → answer becomes reusable context for that property

Empty, first visit: “I haven’t found anything I need help learning yet.”

Empty, coming back: “You’re caught up. I don’t need any new information from you right now.”

Loading: “Reviewing recent guest conversations…”

Error: “I couldn’t load what I learned from recent conversations.” [Try again]

Done: “Got it. I’ll use this for future guests at this property.”

If the AI answer is wrong: host edits the suggested information before saving it, corrects previously learned information in Property Context, or chooses not to save it.

## 5. The first screen's words

Headline: **Guests arrive ready to check in.**

Under it: **For vacation rental operators, Logout AI collects guest IDs, handles arrival questions on WhatsApp, and escalates only when your team is needed.**

Button: **Try with a booking**

Five-second test: **MISSING — must be tested with a real vacation rental operator / property management company.**

## 6. Principles (kept, not tactics)

- **The flow decides the screens; the screens never decide the flow.**
- **One main action per screen.**
- **The host manages exceptions, not conversations.**
- **Show what needs attention before showing everything that happened.**
- **LOGOUT AI never hides uncertainty. If it does not know, it escalates.**
- **AI-generated status must always be traceable to the underlying booking, document or conversation.**
- **Property knowledge and agent behaviour are separate: Listings define what LOGOUT AI knows; Agent Settings define how it behaves.**
- **Guest-facing interactions stay on WhatsApp unless WhatsApp cannot complete the job.**
- **Every extra screen needs to earn its place by serving a step in the core flow.**
- **Mobile first: one card per row, large tap targets, no dense operational tables.**
