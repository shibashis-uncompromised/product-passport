# Uncompromised · Product Passport

A complete local HTML, CSS and JavaScript passport, built around the Turmeric Traceability **4a** reference and the passport route handoff. The original reference files are untouched.

## Open the passport

Open **index.html** directly, or run `python3 server.py` from this folder and visit:

- **http://127.0.0.1:4387/** — default sample passport
- **http://127.0.0.1:4387/passport/UNC-H-000000012345** — pack / QR route
- **http://127.0.0.1:4387/passport/UNC-H-000000012345#inputs-used** — direct section link
- **http://127.0.0.1:4387/passport/unknown** — unknown or retired code state

The server binds to this computer only. There is no deployment, account requirement, backend, analytics, or build dependency.

## Included flow

- Immediate compact opening with all four record sections closed.
- Product pack illustration beside SKU, Lot ID and Batch ID, following 4a.
- Four expandable record sections in the label's order: Farm Location, Inputs Used, Crop Performance, Processing Done.
- Sticky section navigation, active scroll tracking, deep links, with selected-tab highlighting.
- Grower photograph, complete farm profile, coordinates, satellite reference image, interactive map viewer, and external map link.
- All 22 source activity entries, including 2 planned entries; 2 sample cleaning and packing entries finish the illustrative journey.
- One photograph for each of the 24 events (20 original field photographs and 4 explicitly labelled reference-image uses), with enlarged viewing, previous / next controls, keyboard arrows, swipe, Escape to close, and focus restoration.
- Light and dark themes, a locally remembered theme preference, responsive layouts, print formatting, and reduced-motion support.
- Core passport text, native expandable sections, and inline field photographs remain available without JavaScript. Interactive viewers and client-side lot selection require JavaScript.

## Data and asset provenance

The reference data comes from https://tracebility-tau.vercel.app/chickpea-sarai1.html. Farm address, coordinates, area, field lead, activity descriptions, and field photos are based on that source. Shared-crop records remain labelled. Seven completed spray / drench entries and one planned entry are shown. Input counts exclude the planned entry.

The grower name **Ratan Lal**, lot and batch codes, pack artwork, and cleaning / grading / packing entries are illustrative. The grower photograph is a source field photograph; the pictured person's identity is not supplied. The website explicitly labels this distinction. **Tejpal Singh** is the source field lead, not an asserted identity for the person pictured.

The **18.0228 acres** figure is the whole farm, not a surveyed product-specific plot area. Coordinates locate the farm. Individual photo GPS, plot boundaries, irrigation records, disease records, input quantities and yield were not supplied; the interface does not invent those facts.

Brand SVGs were copied from the supplied TM logo set. Their background rectangles and excess artboard margins were removed without changing the marks. The pack is a CSS illustration adapted to chickpea using the supplied label's visual structure.

Photograph thumbnails, optimized larger photographs and the supplied satellite image are local assets. The live OpenStreetMap view and outbound links require an internet connection. Fonts use local system fallbacks; no external font request is needed.

## Files

- `index.html` — complete readable passport and dialog markup
- `styles.css` — brand tokens, mobile / desktop layouts, themes and print styles
- `app.js` — navigation, theme, scan state, lot handling and media viewers
- `data.js` — structured lot data and activity / photo metadata
- `assets/` — local logos, photographs and reference map
- `server.py` — optional local preview server with clean passport routes

The default record is deliberately present in HTML for direct opening and weak connections. When replacing sample data, update both `index.html` and `data.js`; visible record tables and the photo viewer must stay consistent. A live rollout should connect those two outputs to the same maintained lot data source.

## Verification

JavaScript syntax, local assets, unique element IDs, internal links, route responses, input counts and record/photo consistency have been checked. Automated DOM interaction checks cover section opening, theme switching, photo navigation, map opening, modal close behaviour and invalid lots. The compact opening has also been visually checked in the local phone preview. All four collapsed sections fit in the first viewport, each section button was exercised, selected states remained correct after scrolling, and the browser reported no script errors.

## Photo captions

Every timeline event has exactly one image. Plot identifiers have been removed from timeline photo captions and the enlarged viewer, and replaced with the farm coordinates (24.601660° N, 73.960907° E). These are farm coordinates, not independently measured camera coordinates. The four entries without source photos use labelled reference photographs, with their original dates retained. Source plot details remain available in the farm and activity record tables.

## Contact

The closing contact block links to traceability@uncompromised.in, supplied by the product owner. The email subject includes the displayed sample lot ID to make enquiries easier to identify. Opening the email link does not send a message.


Generic “Other” activity categories are presented as Pest monitoring, Tip-pruning and Threshing, based on the corresponding source descriptions.

## Demo presentation

At the product owner’s request, visible sample / illustrative / representative-photo labels are hidden for the local demonstration. The underlying data and provenance notes above remain unchanged: grower identity and final processing stages are still demonstration data, and four events use reference images. This presentation change does not validate those records.

## Compact opening layout

The header contains the original Uncompromised mark, Product passport and the theme control, above smaller section buttons. The identity panel reads Item, Village (Sarai / Cluster: Udaipur), Season (Rabi 2025), Lot ID and Batch ID. All four record sections begin closed; opening a deep link opens only its target. Input-count chips precede the dated application table. Navigation highlights immediately on selection and uses one header offset to align the target, preventing the previous double-offset mismatch.

## Collapsible activity log and header refresh

The activity log is a native, keyboard-accessible disclosure and begins closed, with its entry count visible. Its contents open for event deep links and printing. The extra “Six months / One photo per event” label is removed. The header uses a balanced brand row with a softer theme control and a compact continuous tab row; the selected section has a turmeric underline and matching text.

The reading progress bar has been removed; the gold underline now belongs exclusively to the active navigation tab. Scroll-based section highlighting is retained.

## Opening loader restored

Every valid page opening or refresh now shows the themed Uncompromised wordmark and opening spinner for 750 milliseconds. The loader is hidden when JavaScript is unavailable, honours reduced-motion styling, and releases the record on a fixed timer even if later initialization fails. It does not restore the reading progress bar. The default record and timeline remain collapsed; explicit section links continue to open their target.

## Timeline preview

The collapsed activity log shows a non-interactive preview of the first activity images and captions, fading towards the bottom. “See more” expands the complete 24-entry log; “See less” collapses it. The preview is hidden from assistive technology to avoid duplicate records, while the native disclosure announces its expanded state. The timeline heading and first entry no longer have a separating rule.

The timeline fade now uses a theme-coloured gradient overlay across a cropped image and its caption, rather than fading empty space below a complete image. See more / See less are unboxed text controls with chevrons.
