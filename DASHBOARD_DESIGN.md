# Host dashboard design system

Status: **implemented admin system**, 14 October 2026. The owner explicitly authorized rebuilding the admin dashboard after the design documentation changed. This supersedes the 12 October visual-redesign deferral. The implemented scope is Properties, Train Hermes and fictional Guest tests in `src/admin.jsx`, `src/admin.css` and `src/admin.html`; existing trainer behaviour remains. The initial rebuild was published. The subsequent minimal listing/sidebar refinement is published; authenticated flows were checked in development. DESIGN.md is the entry point and its dashboard-prefixed frontmatter owns the normative tokens. PRODUCT.md defines behaviour and data truth.

## Latest scoped override — minimal listings and shared shell

The owner's 14 October request to redesign listings and sidebars using the new minimalist screenshot supersedes the earlier cream/red presentation on those surfaces. Reference: [minimal listing and navigation analysis](design-refs/minimal-listings-analysis.md). Keep real property functions and the three existing destinations. The shared shell is white, the sidebar pale grey, selection neutral grey, and listing actions black. Training/test red controls, 24px panels and their behaviour remain; shared page, soft, border and muted values inherit the shell override. Signed-out entry, website and public sandbox retain their established systems.

| Scoped token | Value | Purpose |
| --- | --- | --- |
| `minimal-page` | `#FFFFFF` | Signed-in workspace |
| `minimal-sidebar` | `#FAFAFA` | Sidebar and metadata chips |
| `minimal-soft` | `#F6F6F7` | Placeholder and quiet status/hover surfaces |
| `minimal-border` | `#E3E3E7` | Shared edges, listing cards and chips |
| `minimal-placeholder-border` | `#ECECEF` | Empty photo slot edge |
| `minimal-muted` | `#606069` | Supporting text |
| `minimal-text` | `#18181B` | Listing titles/actions and selected navigation |
| `minimal-selected` | `#EDEDF0` | Current navigation background |
| `minimal-action-hover` | `#35353B` | Listing primary-action hover |

Listing card/panel/action corners are 8px; navigation, input and empty-photo corners are 6px. Card padding is 16px desktop / 14px phone. Listing titles are medium weight: 20px/28px desktop, 18px/26px tablet, 16px/24px phone. Saved type and amenity-count chips are derived from records. Cards now show a real stored listing-photo cover when available; **Importing photos…**, **No photo added** and **Photo unavailable** cover pending, missing and failed image display. There is no manual photo-upload or editing workflow. **Edit property** and the property title open the existing editor. No calendar, occupancy, live switch or invented navigation was added.

The sidebar has an outlined compass and uppercase LOGOUT wordmark. Desktop sidebar width is 240px; 768–1199px remains 196px. The top header is 72px desktop / 64px phone. Saved listings span the full content width, followed by import/history tools in two desktop columns and one below 1200px. Phone navigation remains visible above the workspace, without a drawer.

## Listing photos — established system extension

Authorized 14 October 2026: import available real photos from the property listing into Convex file storage, show a cover in the card and a gallery above editor fields. Cards keep their white surface, 8px corners and black actions. Covers use 6px corners and `object-fit: cover`; original pixels are preserved apart from the display crop. The editor gallery uses 12px gaps, 6px link corners and 4:3 cover-fit thumbnails: four columns desktop, three at 768–1199px and two on phone. Each image has property-based alternative text; gallery links open the stored image.

New imports read listing HTML once for facts/photo candidates, save facts first, then download bounded photos. Existing properties offer **Import photos**; editors with photos offer **Refresh photos**. Controls show **Importing photos…**, become disabled while pending and expose saved photo counts, partial/unavailable/failure feedback. A photo failure keeps property details and already stored photos. Import/refresh deduplicates source identities and does not rewrite edited facts. No manual upload, photo editing, generated imagery or external source-image hotlinks were added. Source URL and file identifier are stored; the protected admin queries compute image URLs from storage.

Development proof: all 40 tests pass, TypeScript checking and development backend push are clean. `scripts/check-property-photos.mjs` passed sequentially with twelve real Airbnb photos, loaded cover/gallery, source-identity deduplication, unchanged edited facts, reload, anonymous access rejection and no overflow at 320px, 390px, 768px and 1280px. `scripts/check-admin.mjs` passed sign-in/import/save/reload/duplicate/private-URL/sign-out checks. `scripts/check-new-property-photos.mjs` also verified a fresh development listing automatically saved its property facts and twelve photos, with all stored image URLs loading. Final photo screenshot review in `.impeccable/review/photos-*` returned **Ship**, without blockers. One overlapping test run saw another test's temporary note; the sequential rerun passed. This was test interference, not evidence of a product failure. Production backend deployment succeeded and the photo frontend was published at https://grateful-llama-909.convex.site/admin.html#properties (deployment `c49ebae7-902c-464e-8a6b-bad85639e3ee`). Photo-only backfill completed for Vana - A Thoughtfully Designed Stay; Shadow Barn: Cuckoo Landour w/ Balcony+Valley View; and Aum & Aura | Ganga Views | Yoga Haven | Tapovan, with twelve photos each (36 stored files total). Production storage checks confirmed supported image types and each file between 1 and 5,000,000 bytes. Before/after SHA-256 fingerprints of all non-photo property fields matched, confirming saved facts stayed unchanged. Live signed-out admin entry, configured sign-in, access protection and phone-layout checks passed. Authenticated cover/gallery UI was checked in development; production proof here covers saved data/storage and signed-out entry. Earlier publication evidence below applies to the preceding builds.

## Direction — retained baseline

Calm, spacious and practical: warm pale background, white surfaces, rounded cards, fine outline icons, dark readable text and a single red action colour. The travel dashboard supplies the clearest repeated component system. The light chat supplies the inbox structure. The room-management screen supplies the property list/detail structure. The lending screens contribute generous spacing and quiet metric cards; the orange dashboard contributes warmth.

Keep the existing Geist font and Logout palette. The screenshots' blue, yellow, lime and coral accents belong to separate reference products. Combining all of them would make our screens inconsistent. Heavy translucent panels over saturated wallpaper, as in the dark Messenger reference, make small operational text harder to read; use solid surfaces for the dashboard.

All reference measurements and colour estimates are approximate. Device photos distort sizes, and screenshots cannot establish font names or invisible interaction behaviour. The implemented admin values below are extracted from code, not claimed samples from the references. Guidance for later screens remains provisional.

## Shared identity, separate surfaces

| Rule | Website | Dashboard |
| --- | --- | --- |
| Main purpose | Explain the product and let a visitor try Hermes | Let a host complete work and resolve exceptions |
| Background | Existing cream `#FFF7F0` | White signed-in workspace; pale-grey sidebar |
| Main accent | Existing red `#F04438` | Black listing actions; retained red training/test controls |
| Font | Existing Geist | Geist, regular body and medium/semibold headings |
| Image role | Approved large landing hero | Real imported listing-photo covers and honest fallback placeholders |
| Layout | Existing landing and sandbox rules | Labelled navigation, task lists, forms, and optional detail panel |
| Decoration | Existing hero and phone treatment | Quiet surfaces; no device frames around working screens |

The public Hermes sandbox retains its documented teal header, beige chat background and green guest bubbles. It is a familiar guest-chat demonstration, not a sample of dashboard navigation.

## Colour rules — retained component baseline

These names describe the original reusable values. Inside the signed-in shell, page/soft/border/muted inherit the scoped overrides above; listing actions also inherit black. Training/test red controls and document semantic colours remain. The newer navigation overrides the original red selection treatment.

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
| `dashboard-attention-bg` | `#FFF0ED` | Selected navigation or attention panel |
| `dashboard-success` / `dashboard-success-bg` | `#176447` / `#E8F5ED` | Completed state with a text label |
| `dashboard-waiting` / `dashboard-waiting-bg` | `#795100` / `#FFF4D6` | Waiting for guest or document check |
| `dashboard-error` / `dashboard-error-bg` | `#B42318` / `#FFF0ED` | Error or replacement needed |
| `dashboard-neutral` / `dashboard-neutral-bg` | `#595650` / `#F1EFEB` | Not started, paused, secondary status |
| `dashboard-focus` | `#171717` | Visible keyboard focus ring |

White small text on the existing bright red does not provide enough contrast; use the darker action fill above. Retain bright red as the brand accent. Use dark text on pale selected surfaces. Never communicate readiness, selection or error by colour alone. A green dot must not claim someone is online without actual connection data.

## Type, spacing and shape

| Style | Size / line height | Weight | Use |
| --- | --- | --- | --- |
| Page title | 32px / 40px desktop; 24px / 32px phone | 600 | Properties, Train Hermes, Guest tests |
| Section heading | 20px / 28px | 600 | Property details, Guest documents |
| Card title | 16px / 24px | 600 | Guest/property name |
| Body and inputs | 16px / 24px | 400 | Messages, instructions, editable values |
| Labels and supporting text | 14px / 21px | 500 / 400 | Fields and supporting copy |
| Caption | 12px / 18px; count labels 13px / 19.5px | 400 | Property metadata and saved count |

Use spacing steps of 4, 8, 12, 16, 24, 32 and 48px. Card padding: 24px desktop, 20px vertical / 16px horizontal on phone. Gaps between cards: 16–24px. Related label/value gap: 8px. Separate form sections by 32px. Keep paragraph line lengths near 60–75 characters; do not stretch a form across a wide screen.

Cards: 24px corners. Property rows: 12px corners; property symbols and nested previews: 16px corners. Inputs: 12px corners. Status labels and toolbar controls may be pills. Use a 1px card border and little or no shadow. No menu/dialog shadow is implemented in this admin rebuild. Do not stack multiple bordered cards around every individual field.

Controls should be at least 44px tall, and every touch target at least 44 × 44px. Icons: 20px in buttons and desktop navigation, 16px in phone navigation; consistent approximately 1.75px stroke, rounded ends. Use one outline icon family already available in the project. A circular icon button needs a clear accessible name and a tooltip on desktop; major actions need visible words.

## Layout

Desktop, 1200px and wider: a 240px labelled sidebar, a 72px account header and main content with 40px vertical / 32px horizontal padding, capped at 1440px. Destinations are Properties, Train Hermes and Guest tests. Each view stays mounted but is hidden while inactive, preserving training drafts when navigating.

Properties places full-width saved listing cards before import/history panels, which form two columns on desktop and one below 1200px. The property form groups Property essentials, Arrival and access, and Guest requirements and directions. Existing import, manual-add and save functions remain connected to saved data. Cards show real stored-photo covers where available, with labelled fallback placeholders.

At 768–1199px: a 196px labelled sidebar stays visible, main padding becomes 32px vertical / 24px horizontal, and property/import content stacks. Below 768px: visible horizontal navigation moves above the workspace, the account header becomes 64px, forms and import cards use one column, and main padding becomes 28px vertical / 16px horizontal. There is no drawer. No page-wide horizontal overflow was observed at 320px, 390px, 768px or 1280px.

Later Check-ins and One Inbox screen compositions below are reference guidance only; they were not built by this rebuild.

## Reusable components — implementation and later guidance

| Component | Anatomy and variations | Behaviour to implement |
| --- | --- | --- |
| Page header | Title, short explanation, main action | Action describes its result: Create listing, Save changes, Review issue |
| Navigation item | Outline icon, visible label, optional real count | Active item uses neutral grey background and near-black text, with no selected marker; announce current page |
| Primary button | Black listing fill; retained dark-red training/test fill, white text | Hover darker; visible focus; pending label such as Saving…; prevent duplicate submission |
| Secondary button | White/neutral fill, dark text, visible edge | For Cancel, Reload, secondary navigation |
| Text field | Persistent label, input, optional hint, inline error | Focus visible; keep entered values after failure; never rely on placeholder as label |
| Filter bar | Search, status/property filters, optional dates, Clear filters | Applied choices visible; Apply/Cancel if editing a draft; keep date range and query together |
| Status pill | Short text, optional icon, semantic pale fill | Use product states; never rely on a tiny coloured dot |
| Guest task card | Name, property, stay, guest count, status, short summary | One main destination; exception reason visible before secondary details |
| Property row | Stored photo or honest placeholder, name, location, real type/amenity chips, saved/missing-details state | Selecting opens grouped editable property details; no invented availability or price |
| Detail panel | Title, record context, grouped facts or fields, main action | Keep selected record obvious; use full screen on phone |
| Conversation row | Avatar/initials, name, property, preview, time, handler, unread/attention | Selected pale red row; readable preview; distinguish unread from needs host help |
| Message | Sender, text, time, optional attachment | Familiar left/right bubbles; distinguish guest, Hermes and host with labels; preserve paragraphs |
| Attachment | Type icon, filename, status, permitted preview | Explicit received/checking/result states; failing preview offers retry; do not expose identity documents in decorative galleries |
| Composer | Labelled multiline input, Send | Visible when host is handling; Enter sends, Shift+Enter newline; retain draft after failure |
| Summary card | Label, real count, reporting window, optional detail link | Use only if it answers a host question; no invented trends or decorative rankings |

The table includes future patterns (filters, guest task cards, inbox/composer and summary cards); these are not implemented production screens. Current components are navigation, page header, buttons, fields, property rows, panels, status pills, trainer previews and fictional test-document review.

Destructive actions use explicit labels and explain what is being removed. Saving should show pending, success and failure in the same area. Cancel returns to the last saved value. An unrelated request or record switch must not publish someone else's draft.

## Apply the references to later screens

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

## Verification and remaining work

Latest minimal listing/sidebar refinement: all 33 automated tests passed; `scripts/check-admin-design.mjs` and `scripts/check-admin.mjs` passed in development, including the 320px, 390px, 768px and 1280px layout checks. Review returned **Ship**, with no findings. Paid model checks were not repeated because training/model code was unchanged. The refinement was published to https://grateful-llama-909.convex.site/admin.html#properties (deployment `74835245-c019-4a75-8a05-1c671f259f5b`), without a backend deployment. Live signed-out admin checks passed: protected entry, configured sign-in and phone layout. Authenticated screens were checked in development. The evidence below records the earlier dashboard baseline separately.


Development verification on 14 October 2026: `npm test` passed all 33 tests. `scripts/check-admin.mjs` checked authentication protections, import/edit/reload, duplicates, private-link rejection and sign-out. `scripts/check-trainer.mjs` checked real model suggestions, preview/save and a real guest reply, then restored original settings. `scripts/check-precheck-host.mjs` checked a fictional three-person booking. `scripts/check-admin-design.mjs` checked navigation, draft retention, keyboard access and no horizontal overflow, with screenshots at 320px, 390px, 768px and 1280px.

Visual review of all variants in `.impeccable/review` returned **Ship**, with no material blocker. Minor observations remain: Add manually can wrap at 768px, and native selects may clip long selected text. These are not evidence of lost saved data.

These checks were run in development. The rebuilt frontend was published to production at https://grateful-llama-909.convex.site/admin.html (deployment `e97c496b-9697-4bc8-9935-7155f803f5a4`), without a backend source/function deployment. Live signed-out admin checks passed: the landing Sign up link opens the protected admin page, the configured sign-in is enabled, anonymous property reads are rejected and the phone layout fits. Authenticated redesigned flows were checked in development. The separate public guest-demo check did not pass: its old last-message assumption reads the separate ID reminder, and a proposed count-based replacement raced with welcome messages. Guest-demo source was not changed; the failed check remains an explicit verification limitation. No photos were included in that earlier build; photo support is documented separately above. Production inbox and Check-ins screens remain unbuilt. Future screens still need their own data flows and browser checks; reference screenshots do not prove behaviour.

Source details: [latest minimal listing/sidebar analysis](design-refs/minimal-listings-analysis.md), [earlier 22-image analysis](design-refs/dashboard-reference-analysis.md).
