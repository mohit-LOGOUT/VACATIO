# Host dashboard design system

Status: **proposed design rules**, extracted from the owner's 22 screenshots on 13 October 2026. This document specifies a future visual direction; it does not claim that components exist, work, or have been tested. DESIGN.md remains the entry point. PRODUCT.md defines behaviour and data truth. Visual redesign is still deferred until requested.

## Direction

Calm, spacious and practical: warm pale background, white surfaces, rounded cards, fine outline icons, dark readable text and a single red action colour. The travel dashboard supplies the clearest repeated component system. The light chat supplies the inbox structure. The room-management screen supplies the property list/detail structure. The lending screens contribute generous spacing and quiet metric cards; the orange dashboard contributes warmth.

Keep the existing Geist font and Logout palette. The screenshots' blue, yellow, lime and coral accents belong to separate reference products. Combining all of them would make our screens inconsistent. Heavy translucent panels over saturated wallpaper, as in the dark Messenger reference, make small operational text harder to read; use solid surfaces for the dashboard.

All reference measurements and colour estimates are approximate. Device photos distort sizes, and screenshots cannot establish font names or invisible interaction behaviour. The values below are **selected implementation targets**, not claimed samples from the source designs.

## Shared identity, separate surfaces

| Rule | Website | Dashboard |
| --- | --- | --- |
| Main purpose | Explain the product and let a visitor try Hermes | Let a host complete work and resolve exceptions |
| Background | Existing cream `#FFF7F0` | Warm neutral `#F7F5F2` |
| Main accent | Existing red `#F04438` | Same red; dark red fill for small white-text buttons |
| Font | Existing Geist | Geist, regular body and medium/semibold headings |
| Image role | Approved large landing hero | Small property thumbnails and relevant detail images |
| Layout | Existing landing and sandbox rules | Labelled navigation, task lists, forms, and optional detail panel |
| Decoration | Existing hero and phone treatment | Quiet surfaces; no device frames around working screens |

The public Hermes sandbox retains its documented teal header, beige chat background and green guest bubbles. It is a familiar guest-chat demonstration, not a sample of dashboard navigation.

## Colour rules

These names describe the purpose of each reusable value, also called a design token.

| Name | Value | Use |
| --- | --- | --- |
| `dashboard-page` | `#F7F5F2` | Page background |
| `dashboard-surface` | `#FFFFFF` | Cards, forms, navigation |
| `dashboard-surface-soft` | `#F1EFEB` | Quiet nested sections, hover |
| `dashboard-text` | `#171717` | Names, values, main text |
| `dashboard-text-secondary` | `#595650` | Supporting text, dates, captions |
| `dashboard-border` | `#DEDAD4` | Card edges and separators |
| `dashboard-control-border` | `#8A8278` | Input edges that need to be visible |
| `dashboard-accent` | `#F04438` | Large accent details and active-agent indicator |
| `dashboard-action` | `#B42318` | Primary button fill with white text, urgent labels |
| `dashboard-action-hover` | `#912018` | Primary button hover |
| `dashboard-attention-bg` | `#FFF0ED` | Selected conversation or attention panel |
| `dashboard-success` / `dashboard-success-bg` | `#176447` / `#E8F5ED` | Completed state with a text label |
| `dashboard-waiting` / `dashboard-waiting-bg` | `#795100` / `#FFF4D6` | Waiting for guest or document check |
| `dashboard-error` / `dashboard-error-bg` | `#B42318` / `#FFF0ED` | Error or replacement needed |
| `dashboard-neutral` / `dashboard-neutral-bg` | `#595650` / `#F1EFEB` | Not started, paused, secondary status |
| `dashboard-focus` | `#171717` | Visible keyboard focus ring |

White small text on the existing bright red does not provide enough contrast; use the darker action fill above. Retain bright red as the brand accent. Use dark text on pale selected surfaces. Never communicate readiness, selection or error by colour alone. A green dot must not claim someone is online without actual connection data.

## Type, spacing and shape

| Style | Size / line height | Weight | Use |
| --- | --- | --- | --- |
| Page title | 32px / 40px desktop; 24px / 32px phone | 600 | Check-ins, One Inbox, Listings |
| Section heading | 20px / 28px | 600 | Property details, Guest documents |
| Card title | 16px / 24px | 600 | Guest/property name |
| Body and inputs | 16px / 24px | 400 | Messages, instructions, editable values |
| Labels and supporting text | 14px / 20px | 500 / 400 | Fields, status, dates |
| Caption | 13px / 18px | 400 | Timestamps and secondary metadata |
| Summary number | 36px / 40px | 500 | Real task counts; same colour throughout the number |

Use spacing steps of 4, 8, 12, 16, 24, 32 and 48px. Card padding: 24px desktop, 16px phone. Gaps between cards: 16–24px. Related label/value gap: 8px. Separate form sections by 32px. Keep paragraph line lengths near 60–75 characters; do not stretch a form across a wide screen.

Cards: 24px corners. Compact list rows and images: 16px corners. Inputs: 12px corners. Status labels and toolbar controls may be pills. Use a 1px card border and little or no shadow. A floating menu or dialog may use `0 12px 32px rgb(23 23 23 / 12%)`. Do not stack multiple bordered cards around every individual field.

Controls should be at least 44px tall, and every touch target at least 44 × 44px. Icons: 20px in buttons, 24px in navigation; consistent approximately 1.75px stroke, rounded ends. Use one outline icon family already available in the project. A circular icon button needs a clear accessible name and a tooltip on desktop; major actions need visible words.

## Layout

Desktop, 1200px and wider: a 224px labelled sidebar, a 72px top header and a flexible content area with 32px padding. Maximum main-content width 1440px. Navigation follows the approved screens in DESIGN.md; the references' Trips, Cards, Reports and other unrelated destinations are not requirements.

For ordinary task screens, place title and explanation first, relevant filters second, then the work list. A page has one main action. Show exceptions before completed work. No map or chart grid just because the reference has one.

One Inbox may use three content panes on large screens: conversation list 280–320px, flexible chat at least 400px, context panel 280–320px. At 1200px, open context on demand so the three panes plus sidebar do not squeeze the chat. Use all three panes only when at least 1280px of content width is available. Keep header and composer visible; scroll messages within their area.

At 768–1199px: compact navigation opens a labelled drawer; use at most a list and detail pane, with context in a drawer. Below 768px: one active pane at a time, a visible Back to conversations/listings control, 16px page padding and stacked forms/cards. Filters wrap or open in a sheet. No page-wide horizontal scrolling at 320px. These responsive rules are proposals; only reference 7 shows a phone version.

## Reusable components

| Component | Anatomy and variations | Behaviour to implement |
| --- | --- | --- |
| Page header | Title, short explanation, main action | Action describes its result: Create listing, Save changes, Review issue |
| Navigation item | Outline icon, visible label, optional real count | Active item uses pale red background, dark text and a selected marker; announce current page |
| Primary button | Dark red fill, white text, optional leading icon | Hover darker; visible focus; pending label such as Saving…; prevent duplicate submission |
| Secondary button | White/neutral fill, dark text, visible edge | For Cancel, Reload, secondary navigation |
| Text field | Persistent label, input, optional hint, inline error | Focus visible; keep entered values after failure; never rely on placeholder as label |
| Filter bar | Search, status/property filters, optional dates, Clear filters | Applied choices visible; Apply/Cancel if editing a draft; keep date range and query together |
| Status pill | Short text, optional icon, semantic pale fill | Use product states; never rely on a tiny coloured dot |
| Guest task card | Name, property, stay, guest count, status, short summary | One main destination; exception reason visible before secondary details |
| Property row | Thumbnail, name, location, active state | Selecting opens Property Context; distinguish selected row; no invented availability or price |
| Detail panel | Title, record context, grouped facts or fields, main action | Keep selected record obvious; use full screen on phone |
| Conversation row | Avatar/initials, name, property, preview, time, handler, unread/attention | Selected pale red row; readable preview; distinguish unread from needs host help |
| Message | Sender, text, time, optional attachment | Familiar left/right bubbles; distinguish guest, Hermes and host with labels; preserve paragraphs |
| Attachment | Type icon, filename, status, permitted preview | Explicit received/checking/result states; failing preview offers retry; do not expose identity documents in decorative galleries |
| Composer | Labelled multiline input, Send | Visible when host is handling; Enter sends, Shift+Enter newline; retain draft after failure |
| Summary card | Label, real count, reporting window, optional detail link | Use only if it answers a host question; no invented trends or decorative rankings |

Destructive actions use explicit labels and explain what is being removed. Saving should show pending, success and failure in the same area. Cancel returns to the last saved value. An unrelated request or record switch must not publish someone else's draft.

## Apply the references to our screens

**Check-ins:** use the travel history rows' clear grouping, with one guest card per row on phones. Show guest, property and check-in date before supporting facts. Group Needs your help and ID needs review first. Preserve all approved screen fields; maps, revenue and travel rankings are outside this job.

**One Inbox and Conversation:** borrow the light chat's list/chat/context arrangement and restrained surfaces, plus Messenger's understandable pane divisions. Keep the existing WhatsApp-style left/right message rhythm. Right context contains selected booking facts, guest checklist and relevant activity. It can be hidden. No oversized contact portrait, video gallery, call button or “Active now” without a real function. Take over/Hand back to LOGOUT AI must reflect the saved handler state.

**Listings and Property Context:** borrow the room-management list/detail pairing. Property photos help identify a record; a compact thumbnail is enough in the list. The detail view groups arrival times, ID policy, directions, entry, parking, rules and Wi-Fi into labelled sections. Save changes is the main action. Room inventory, nightly prices and hotel financial tools are not included.

**ID Review:** document preview and reason for review dominate the screen. Preserve the selected guest name, booking and applicable requirement next to the decision. Show extracted and expected names when relevant. Keep host decisions separate from automated name checks. Do not use the reference finance charts or coloured scores to imply document authenticity.

**Agent Settings and Train Hermes:** reuse ordinary form sections, labelled fields, previews and save feedback. Avoid oversized metric cards. Saved version/date, unsaved draft and preview state should be readable without interpreting colours.

**Agent Learning:** one question at a time, the relevant property, suggested information and one Save to property context action. Keep the supporting daily summary compact and grounded in real data.

## Product states and unfinished work

For document checks, PRODUCT.md takes precedence: **Received**, **Checking**, **Name check passed**, **Replacement needed**, **Host review needed**, **Check failed — retry needed**. A host approval is shown as a host decision. Do not translate all positive outcomes into “government verified”. A document service error is not an invalid document.

Loading: preserve the layout, show a short descriptive label, and announce progress without repeatedly interrupting screen-reader users. Empty first visit: explain the next action. No search results: show the applied filters and Clear filters. Load failure: explain which section failed and offer Retry. Save failure: keep the draft and last saved data. Successful save: show confirmation and updated saved state.

For disabled controls, explain the reason when it is not obvious. Give dialogs keyboard focus, return focus to their trigger on close, and make Escape close non-destructive overlays. Motion is limited to 120–180ms colour/opacity transitions; respect reduced-motion preferences. No always-pulsing agent indicator.

## Future implementation checks

When a dashboard build is requested, inspect the actual pages at 320px, 390px, 768px and 1280px. Confirm readable text, keyboard access, reachable composer with the phone keyboard, persistent labels, long-name wrapping, and no horizontal page overflow. Walk search/filter, selected-record changes, save/retry, conversation handoff and relevant document-review flows against real saved data. Verify text and control contrast against their actual backgrounds. Screenshots establish appearance; they do not prove any of these behaviours.

Current delivery: documentation only. No dashboard code, public website, backend or live deployment changed.

Source details: [22-image analysis](design-refs/dashboard-reference-analysis.md).
