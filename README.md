# Business HQ — service-to-repeat prototype

A static HTML/CSS/JavaScript sample for returning customers and a solo home-service provider.

**Live site:** [rikbanerjee.github.io/smbOS](https://rikbanerjee.github.io/smbOS/)

## Owner navigation on phones

The owner workspace has four persistent destinations: **My day**, **Jobs & money**, **Requests**, and **My business**. My day shows the schedule, next stop, preparation, and decisions. My business contains **Services & prices**, repeat customers, and an explicit customer-page preview.

On phones, service setup starts with the selected service, price, and time needed. Customer questions and customer preview are expandable sections. A fixed **Save changes** action and saved/unsaved labels keep the edit state clear. Unsaved changes survive navigation within the open page; save before refreshing. Refreshing an owner view returns that tab to My day. Customer and owner navigation stay separate; switch explicitly through the demo's customer-page or workspace controls.

## New: five connected workflows

1. **Service setup:** open **Joe’s workspace → My business → Services & prices**. Edit starting price/time, booking mode, and questions. Questions support select/text/number answers, required answers, conditions based on earlier questions, and matching-answer effects on price, duration, preparation, and owner review. Try the live customer preview, then **Save changes**. Publishing is browser-local and applies to new visits; agreed visits keep a snapshot of their rules and prices.
2. **Quote to booking:** start a gutter visit and choose **3 or more stories**, or publish a quote-only service. Submit **Request an owner quote**. In **Joe’s workspace → Requests**, provide an exact total including travel, service time, and included work. Switch to **My bookings** to accept the offer, choose a fitting slot, and confirm. A request/offer itself reserves no time; accepting a newer quote invalidates an earlier review. Declining an offer creates no appointment.
3. **Multiple services:** add services in the customer scope screen. The visit combines service time, question effects, tools, and a single travel charge. Only whole-visit slots are offered. Oversized combinations can request an owner quote instead of bypassing capacity rules.
4. **Job to payment:** use **Jobs & money** to mark on-the-way or started, propose additional work, and complete a job with actual time. In **My bookings**, approve or decline extras. Approval updates time, preparation, and invoice total only if the enlarged visit fits the calendar; pending extras block completion. Owner invoice controls record partial/full fictional cash payments and preview a payment follow-up; the customer hub records a fictional remaining-balance payment. Job completion and payment status are independent. No real payment or message is sent.
5. **Repeat & seasonal:** from a customer visit choose **Plan repeat visits**, select weekly/every two weeks, review up to three dates and current totals, and confirm. Capacity is rechecked before reservation. **Pause plan** releases unstarted, unpaid repeat appointments, preserving the source visit; payments or started jobs require resolution first. **Remind me next fall** saves an opt-in browser-local reminder; **Preview next-fall rebooking** opens the remembered scope on October 28, 2027 with current rules. It requires review and confirmation; there is no background notification, renewal, or automatic charge.

Useful walkthrough: create a three-story gutter quote for **$220 / 120 minutes**, book it at **1:15 PM**, propose **$25 / 15 minutes** of additional work, approve as the customer, complete it, record **$50** in fictional cash, and settle the **$195** demo balance. Test repeat plans on a standard leaf/mowing visit; assessment services need a fresh quote.

Storage adds `business-hq-rules-v3` and `business-hq-workflows-v3`. Existing v1 bookings and v2 preparation/weather state remain intact. Previous bookings without snapshots are assigned the original catalog rules in memory. Refresh after deployment if an older tab is open.

## Earlier returning-customer and weather experiences

1. **Returning customer:** on the home page, choose **Book again**. Switch between Mary's home and rental to see remembered services, property scope, access, parking, and previous service time. Choose **Nothing changed — choose a time** for the shorter path or **Something changed** to edit the scope. Review the freshly calculated total before confirming.
2. **Provider's working day:** choose **Try Joe's working day** or open **Joe's workspace → Try a sample day**. Two fictional visits appear on an available sample day without replacing existing bookings. Check the next departure, route details, job scopes, access, parking, combined tools/materials, and the missing-access attention item. Preview the customer's answer and save it. Complete a job and record the actual minutes to update that property's repeat-booking history.
3. **Rain delay:** with a sample day loaded, select **Plan a rain delay**. Review proposed new times and prices, then **Send demo change requests**. The original appointments remain confirmed and the proposed slots are reserved. Select the proposed date in Joe's workspace to see held proposals. Open **My bookings** to role-play each customer's acceptance or decline. Acceptance moves the visit and confirms the displayed new price; decline preserves the original and flags follow-up for Joe. New bookings on the rain day stay paused.

On the October sample day, Dave's gutter visit moves from **$156 to $168** in November because the October discount expires. This is disclosed before owner approval and again before customer acceptance.

## Scheduling and persistence

- Fixed sample Thursdays: October 29 through December 17, 2026, plus October 28 and November 4, 2027 for seasonal rebooking. Sample clock: **1 PM Eastern** on the chosen day.
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

Tests cover conditional rule effects, immutable price/scope snapshots, quotes, additional-work approval and conflicts, completion, partial payments, repeat-plan reservations and pausing, plus earlier departure buffers, weather holds, packing, and property history. No install or build step is required.

## Hosting

GitHub Pages source: **main / repository root**. Keep `index.html`, `styles.css`, `app.js`, `model.js`, `operations.js`, `experience.js`, `rules.js`, `workflow-model.js`, and `workflow-ui.js` together. `.nojekyll` disables Jekyll processing. Pushing to `main` publishes the static site through GitHub Pages.

## Demo limits

All properties, contact details, jobs, weather changes, travel times, and material quantities are fictional or illustrative. No real messages, payments, weather forecast, traffic routing, or inventory connection is made. Calendar downloads are one-way `.ics` files, not live calendar sync. Tax is illustrative at $0.

There is no shared customer database, authentication, or server-authoritative calendar. A production implementation needs verified addresses, route estimates, transactional capacity holds, secure customer approval links, real notifications, payments, and calendar integrations. The interface optionally loads Google Fonts, with system fonts as fallback.

This static sample is separate from the React contribution in `nullwavelabs/business-hq-web`.
