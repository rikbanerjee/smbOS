# Business HQ — day-ready prototype

A static HTML/CSS/JavaScript sample for returning customers and a solo home-service provider.

**Live site:** [rikbanerjee.github.io/smbOS](https://rikbanerjee.github.io/smbOS/)

## Try the three experiences

1. **Returning customer:** on the home page, choose **Book again**. Switch between Mary's home and rental to see remembered services, property scope, access, parking, and previous service time. Choose **Nothing changed — choose a time** for the shorter path or **Something changed** to edit the scope. Review the freshly calculated total before confirming.
2. **Provider's working day:** choose **Try Joe's working day** or open **Joe's workspace → Load sample working day**. Two fictional visits appear on an available sample day without replacing existing bookings. Check the next departure, route details, job scopes, access, parking, combined tools/materials, and the missing-access attention item. Preview the customer's answer and save it. Complete a job and record the actual minutes to update that property's repeat-booking history.
3. **Rain delay:** with a sample day loaded, select **Simulate rain delay**. Review proposed new times and prices, then **Send demo change requests**. The original appointments remain confirmed and the proposed slots are reserved. Select the proposed date in Joe's workspace to see held proposals. Open **My bookings** to role-play each customer's acceptance or decline. Acceptance moves the visit and confirms the displayed new price; decline preserves the original and flags follow-up for Joe. New bookings on the rain day stay paused.

On the October sample day, Dave's gutter visit moves from **$156 to $168** in November because the October discount expires. This is disclosed before owner approval and again before customer acceptance.

## Scheduling and persistence

- Fixed Thursdays: **October 29, November 5, November 12, 2026**. Sample clock: **1 PM Eastern** on the chosen day.
- Joe works **1–5 PM**. Earliest arrival is **1:15 PM**, allowing the first drive. Each visit also reserves a 15-minute travel/setup buffer after service; the final buffer must finish by 5 PM.
- Instant booking requires supported scope and travel zone. Oversized jobs, unsupported zones, full days, and rain-paused days do not offer slots.
- Tools are combined across confirmed jobs. Leaf-bag quantities are illustrative scope estimates. Checkmarks persist per day; a changed material quantity requires packing that quantity again.
- Bookings and job history use local storage `business-hq-prototype-v1`; packing and rain-paused dates use `business-hq-operations-v2`. They remain local to each visitor's browser. A fresh browser profile starts with the fictional returning-customer properties and no appointments.
- Portable links are readable, unsigned snapshots, not live recovery links. Use fictional data only. Pending weather requests are not shared by snapshot links.

## Local development and tests

```sh
python3 -m http.server 4181 --bind 127.0.0.1
```

Open `http://127.0.0.1:4181/`. Node.js is only needed to run the domain checks:

```sh
npm test
```

Tests cover repeat scope/history, current pricing, departure buffers, packing, proposed holds, customer acceptance/decline, stale requests, and full calendars. No install or build step is required.

## Hosting

GitHub Pages source: **main / repository root**. Keep `index.html`, `styles.css`, `app.js`, `model.js`, `operations.js`, and `experience.js` together. `.nojekyll` disables Jekyll processing. Pushing to `main` publishes the static site through GitHub Pages.

## Demo limits

All properties, contact details, jobs, weather changes, travel times, and material quantities are fictional or illustrative. No real messages, payments, weather forecast, traffic routing, or inventory connection is made. Calendar downloads are one-way `.ics` files, not live calendar sync. Tax is illustrative at $0.

There is no shared customer database, authentication, or server-authoritative calendar. A production implementation needs verified addresses, route estimates, transactional capacity holds, secure customer approval links, real notifications, payments, and calendar integrations. The interface optionally loads Google Fonts, with system fonts as fallback.

This static sample is separate from the React contribution in `nullwavelabs/business-hq-web`.
