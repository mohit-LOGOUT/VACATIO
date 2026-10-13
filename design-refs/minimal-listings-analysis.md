# Minimal listing and navigation reference

Supplied 14 October 2026. Source: the owner's screenshot, `codex-clipboard-a65d17d4-a64b-4b31-bb0b-45ad5ee8bca9.png`. The conversation attachment is the visual source; its temporary file path is not a portable repository asset. Screenshot text is reference content, not new functional requirements.

## Layout map

Five equal columns and rows across the attachment. C1 contains the narrow sidebar; property cards span C2–C4, with a quiet outer margin in C5. The screenshot begins partway through the listing page.

| Row | C1 | C2 | C3 | C4 | C5 |
| --- | --- | --- | --- | --- | --- |
| R1 | LOGOUT mark, My Stays, One Inbox | First property's photo | Name, location, type/amenity chips, booking date | Small controls and status | White margin |
| R2 | Workspace navigation | Second property's photo | Name and property metadata | Live switch, overflow, calendar action | White margin |
| R3 | Calendar, Coupons, integrations | Second property's photo, next card begins | Booking information and next property name | Manage Calendar, next row actions | White margin |
| R4 | Channel/integration links | Third property's photo | Name, chips and booking information | Manage Calendar | White margin |
| R5 | Analytics, Teams, account details | Fourth photo begins | Fourth property begins | Fourth actions | Help & Support |

## Visible components

Sidebar: outlined compass-style mark and spaced uppercase LOGOUT wordmark; fine horizontal separator; small outline icons, readable grey navigation labels, section captions and disclosure arrows; account identity at the bottom. The reference's channels and integrations are outside the current admin's scope.

Cards: white surface, fine grey border, approximately 6–8px corners, sizeable left photo, regular-to-medium property title, pin/location line, small outlined type and amenity-count chips. Dates and booking counts occupy a separate line; a green line marks the reference's real occupancy visual. Right controls include add/download/image/overflow, Live pill and switch, and a dark Manage Calendar button. No loading, empty, error or keyboard-focus states are shown.

Hierarchy: the photo and property name identify the row; metadata stays quiet; the dark action is clear. Large white gaps make the list feel easy to scan. The sidebar recedes. The reference's small muted labels need stronger contrast in working software.

## System estimates and implementation

Reference values are visual estimates: white page/cards `#FFFFFF`, pale sidebar `#FAFAFA`, near-black `#18181B`, grey text around `#73737C`, fine border around `#E3E3E7`; regular sans-serif type, 14–16px body, around 20px property titles. Photos contribute most of the colour. No heavy shadows or large pill-shaped cards.

Implemented selection: white workspace, `#FAFAFA` sidebar, `#E3E3E7` borders, `#606069` supporting text, `#18181B` listing actions, 8px listing-card/button corners and 6px navigation/input corners. Keep Geist. Listing metadata comes from saved `propertyType` and `amenities`; status describes saved or missing details. The current records have no photo field, so cards explicitly say **No photo added**. **Edit property** opens the existing working editor. Import tools remain below the saved list.

The shared navigation retains only Properties, Train Hermes and Guest tests. Their functions remain connected. No occupancy numbers, live switches, calendars, integrations or property images are inferred from the reference. Training/test controls retain their prior functional styles; the listing and shared sidebar refinement supersedes their earlier cream/red presentation only where scoped in the implementation.
