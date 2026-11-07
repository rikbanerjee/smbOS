# Booking-flow port

This release brings over the rest of Derek's November 1, 2026 working copy (`joes-business-riks-example`). That copy branched from `9e9df77` / `readable-5`. Part of it reached `main` through the customer zip (see [customer-zip-integration.md](customer-zip-integration.md)). This change adds what the zip left out.

## Added

- Multi-select service cards with a Continue bar, category chips, and search.
- Locked, collapsing booking sections with Preselected states and required-field markers.
- Tap-card answers for visit questions and home stories, replacing dropdowns.
- Guidance through required fields: each selection glides to the next required input, and Done or Continue highlights what is missing in soft yellow and returns to it.
- Saved-property picker, in-place editing, and new properties with city and state (`areaForCity`).
- Access answers that wait for owner confirmation (`accessAnswered`), plus the owner access checkbox in the older day and Jobs & money views.

## Merge decisions

Kept from `main`:

- **Book again**, including `recentDraft` review rules and `recentServices` filtering. Derek's copy merged recent rows into the Continue selection; this release keeps them separate, so the home page has both controls.
- Promotion snapshots, legacy pricing, cent rounding, and discount labels.
- The field desk, four-way owner navigation, Help, owner header, and `?view=owner`.

Changed while merging:

- `askQuestions` no longer parses HTML with a `<template>`. `wf.questions` takes an `unanswered` predicate, so the flow renders in Node tests.
- Book again now marks the sections it already knows as confirmed, so review opens directly on the questions, and reads the property with saved customer edits.
- Field desk: added the **Customer replied** tag and **Review access from …** task, because customer answers no longer confirm access by themselves.
- `combined-12` replaces `combined-10` in every asset URL.

## Validation

`npm test` covers the merged logic in Node. Headless Chrome walked through these flows with no JavaScript errors: card booking through confirmation, Book again (fast and review paths), new and edited properties, the owner sample day, the access round trip, and the phone-width layout (390 px). Animated transitions were tested with reduced motion only.
