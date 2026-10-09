# Product

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
Not before first value in v1. The operator should experience the first booking before being asked to create an account.

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
