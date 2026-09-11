# Product passports — 10 crops

Ten standalone passport pages, one per product, built in the same visual format as the
original `product-passport` (chickpea/Sarai 1) demo, populated end-to-end from the real
production database export (farms, crops, users, plots, activities, tasks, media —
not the summarized `trace-new` dashboard data used in an earlier draft).

## Which 10, and where

| Product | Crop record | Farm record | Shown as |
|---|---|---|---|
| Kala Chana | Chickpea | Sarai 1 | Sarai 1 |
| Masoor Dal | Lentil/Masoor | Sarai 1 | Sarai 1 |
| Regular Wheat | Wheat | Sarai 1 | Sarai 1 |
| Bansi Wheat | Wheat | Sarai 2 | Sarai 2 |
| Bhaliya Wheat | Wheat | Chandrangan | Bujra |
| Chia Seeds | Chia | Sarai 1 | Sarai 1 |
| Flaxseeds | Flaxseed | Sarai 1 | Sarai 1 |
| Urad Dal | Urad | Sarai 1 | Sarai 1 |
| Moong Dal | Moong | Sarai 1 | Sarai 1 |
| Turmeric | Turmeric | Chandrangan | Bujra |

Crop → farm pairing matches the 10 products picked out in `trace-new`'s own dashboard
`STORE` list. "Shown as" is the display name used on the passport; where it differs from
the underlying farm record (Chandrangan → Bujra) both names are shown on the page, so
nothing is hidden.

## What's real

Everything except the Lot ID / Batch ID is taken directly from the production database
export (`farms`, `crops`, `users`, `plots`, `activity_categories`, `tasks`, `activities`,
`media`), joined by their real foreign keys:

- **Farm location** — real registered address, farm area, farm code, and GPS coordinates
  (decoded from the farms table's PostGIS point geometry), with a Google Maps link.
- **Every activity** — date, category, and the *full, unedited* task description exactly
  as logged (many are in Hindi, kept as written), for every `COMPLETED` task matched to
  that crop and farm.
- **Field team** — real first/last (or localized) names of every activity's executor,
  shown with their Hindi name alongside where the record has one.
- **Photographs** — every photo linked to a matching activity, with its own GPS
  coordinate and capture timestamp when the upload carried one; otherwise the timeline
  honestly falls back to the farm's own coordinates and labels it "Farm location" so the
  two precisions are never confused with each other.
- **Plots** — from the task's structured plot link where set, plus plot numbers/codes
  recovered from the free-text description itself (e.g. "Plot-6, 2, 1 and 4") where the
  structured link wasn't set — real records, not paraphrased.
- **Named inputs ("Inputs Used")** — every substance actually named in a task's
  description (Jeevamrit, Amino acid, PDR, NPK, Sunfert, Ferrous sulphate, Bordeaux
  mixture, Trichoderma, Pseudomonas, Bacillus, Neem soap, and ~25 others), matched by
  content rather than by the task's category label — because real field staff tag tasks
  inconsistently (a compost or irrigation-logged task can still name a real input, and a
  threshing task is sometimes filed under "Maintenance" or "Other" instead of
  "Harvesting"). Every event in this section is reclassified by what its description
  actually says, not by its raw category tag.
- **Harvest & Processing** — same content-based approach: an event lands here if its
  category is "Harvesting" or its description contains harvest/threshing language,
  regardless of how it was originally tagged.
- **Classification & season** (Pulse / Cereal / Oilseed / Spice-Herb; Rabi / Kharif) —
  from the crop reference data.

Generated for format completeness, not part of the source data:
- **Lot ID / Batch ID** — deterministic placeholder codes in the `UNC-H-…` / `UNC-B-…`
  shape, clearly labelled on each page as *"provisional traceability codes ... not yet
  linked to a physical pack."* They are **not** real batch numbers — no real product
  batch-code data exists in the source records.

No PII from the `users` table (emails, phone numbers, password hashes, home addresses)
is surfaced anywhere — only each person's resolved display name (English/Hindi) is used,
exactly as it would be shown on the farm's own dashboard.

## A note on activity counts

Task counts reflect the production database snapshot the passports were built from.
Because farm staff keep logging completed work, this can be higher than an earlier
dashboard screenshot taken at an earlier point in time — that's expected, not a
duplication bug (checked for and ruled out during generation).

## Structure

```
passports/
  _shared/passport.css   — unchanged copy of the original styles.css
  _shared/passport.js    — the original app.js, trimmed of the chickpea-specific
                            grower-photo modal, map dialog and fake lab-report
                            chips, with real per-photo GPS/team formatting added
  <slug>/index.html       — the passport page (open directly in a browser)
  <slug>/data.js          — its structured data (drives the photo lightbox)
```

Each `index.html` references the brand marks in `../../assets/` (the existing
`product-passport/assets` folder), so keep this `passports/` folder inside the
`product-passport` repo, next to `assets/`. Photographs are linked directly to their
source S3 URLs (not downloaded), so viewing them needs an internet connection — same as
the original dashboard.

## Regenerating

The generator (`generator.py`, consuming `passport_source_v3.json`, itself built by
`build_from_raw.py` from the raw CSV export) lives with the session that created these,
not in this folder, to keep this a plain static site with no build dependency. Ask for
it if you want to rerun this against an updated database export.
