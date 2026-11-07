# Business HQ — service-to-repeat prototype

A static HTML/CSS/JavaScript sample for returning customers and a solo home-service provider.

**Live site:** [rikbanerjee.github.io/smbOS](https://rikbanerjee.github.io/smbOS/)

## Combined customer and owner release

Derek's November 1 customer-home package is now integrated on top of the landscaper field desk. See [integration details](docs/customer-zip-integration.md) for the source package and conflict resolutions.

- Customers now have the Share control, Eastern-time opening status and weekly-hours dialog, a compact fall promotion, discounted service prices, and the Recently ordered selection/rebooking flow.
- The owner keeps My day, Schedule, To do, My business, Help, job progression, phone bookings, notes/photos, equipment, stock, payments, customer history, and export.
- New visits receive a snapshot of the current promotion: 15% off leaf cleanup and 10% off gutters for September–November visits, including future years. These are prototype campaign rates, configured in `model.js`. November's medium leaf+gutter bundle is $347.25 including one $48 travel charge; December's is $393.
- Existing saved bookings retain the earlier October-2026-only gutter policy and their stored agreed totals. Adding $25 to a pre-existing $198 leaf job produces $223. Owner-approved fixed quotes show no separate automatic promotion deductions.
- New rebookings use the current promotion. Changed service selections, newly changed questions, or missing required answers open scope review before scheduling. Unchanged service selections retain the quick path.
- Browser-local storage keys are preserved. Asset URLs use `combined-12` so refreshed tabs load a consistent release.
- Logic and Node rendering/event smoke checks cover both sides. Visual browser verification for this integration was unavailable because local browser use was disabled in Work settings.

## Sectioned customer booking

Derek's booking-flow work from the same November 1 copy, which was not part of the customer zip above. See [the port notes](docs/booking-flow-port.md).

- **Home:** tick one or more service cards, then **Continue** from the bar anchored at the bottom. Category chips filter the cards, and a search box appears once there are seven or more services. **Recently ordered → Book again** keeps its own selection and its fast path for unchanged scope.
- **Booking steps:** each section stays locked until the one above is complete, then collapses with a green check. Prefilled values are marked **Preselected** and count only once the customer confirms them. Joe's questions with set answers use tap cards and start with none selected. After each selection the page glides to the next required input. Pressing Done or Continue early highlights what is missing in soft yellow and glides back to it, even if the customer has scrolled past. If everything is answered but Done hasn't been tapped, Done is what gets highlighted. On the time step, picking a day or time doesn't scroll, so the calendar and start times stay together on one screen.
- **Properties:** choose a saved property, edit it in place, or add a new one with street, city, and state. The travel zone comes from city and state; anywhere Joe doesn't serve is blocked with an explanation. Storage: `business-hq-properties-v1` and `business-hq-property-edits-v1`.
- **Access:** access text from a customer is now an answer for Joe to confirm, not a confirmation. Changing a saved property's address or access clears its confirmation. The field desk shows **Customer replied** and a **Review access from …** task until Joe saves it.

## Sharing, readability, and calendar overview

- One sticky company header shows the brand, tagline, and live Eastern-time opening status. Both sides have **Share**; customers have Call and owners have Help. Opening the status shows the full weekly hours. Copy the public booking link or open the device's share options. The link opens the customer page even if that tab previously used owner mode, and carries no booking details.
- Body text, controls, and helper text are larger, with darker text, stronger card boundaries, and fewer repeated header sections. The integrated customer home uses Derek’s greeting and “Services we offer” heading, with readable sizes retained on phones.
- Seasonal guidance sits above the greeting and recently ordered shortcuts. New visits use the September–November campaign; choosing a December date recalculates the estimate at regular prices.
- Service selectors appear before their scope and conditional questions. New bookings no longer ask where to park; existing saved notes remain available to the owner.
- The estimate stays on the booking page. On phones, tapping the footer total opens a price-breakdown sheet without losing the current step or answers.
- **My day / Week / Month** provide detail and overview separately. Week/month buttons navigate periods; working-day tiles open the daily jobs and checklist. Week view combines estimated tools and materials for remaining confirmed work. Completed jobs stay in calendar history, cancelled jobs are omitted, and proposed holds are shown separately.

## Landscaper field desk

Open **[the owner working-day sample](https://rikbanerjee.github.io/smbOS/?view=owner&sample=1)**. The explicit sample link adds two fictional visits only when no active working-day sample exists; it preserves existing jobs and history. Normal refresh remembers the selected sample workday within the tab.

The four owner destinations are **My day**, **Schedule**, **To do**, and **My business**:

- **My day:** next customer, agreed work/price, arrival and finish times, a combined tools/materials load-up list, and the day in order. Load-up checkmarks use the existing operations storage. Changed material quantities must be checked again. Schedule provides the existing week/month views; My day remains focused on doing today's work.
- **Open job:** guided scheduled → on the way → working → completed steps; scope, access, saved parking information, per-service work checklist, private job notes, property notes, optional before/after photos, and activity history. Approved extras become explicit checklist items. Equipment, access, and job scope remain visible without opening configuration.
- **Finish:** confirm the agreed work is complete, record actual minutes and leaf bags used, and update supply stock once. Completion leaves payment separate. Record partial/full fictional cash or test-card payments, or preview a follow-up for a completed unpaid job.
- **Phone bookings:** Add a job records an agreed service, scope, date, and complete fitting slot. Email is optional for an owner-created phone job, while any supplied email must be valid. Normal customer bookings retain email validation. The customer-agreement checkbox is required; assessment/quote-only services still need a reviewed quote through the existing quote workflow.
- **Changes:** propose a different appointment without moving the original. The new slot is held until the customer accepts or declines in My bookings. Extra work also remains pending until customer approval and must fit calendar capacity. Unstarted, unpaid appointments can be released only after recording customer agreement; started/paid/pending-change work is protected.
- **To do:** owner actions (quotes, access, completed unpaid jobs, equipment/supply issues) are separate from customer approvals still pending.
- **My business:** services/prices, My kit, customer/property history, detailed jobs/money, repeat visits, customer-page preview, and private record export. My kit flags unavailable equipment and tracks leaf-bag stock. Quantities are estimates, not live inventory integration.

Field records use `business-hq-field-desk-v1`; existing booking, rules, workflow, and preparation storage keys remain unchanged. Photos are compressed locally (six per job, JPG/PNG/WebP input under 8 MB, compressed output under 350 KB each). Browser storage is limited; a quota failure is reported. JSON exports contain job, payment, and field records but exclude photo bytes. Keep exports private. No photo or private note is uploaded by the prototype.

Try: load a sample day → mark tools loaded → open Mary's job → record on-the-way / start → add a note/photo → finish with 88 minutes and 4 bags → record $50 cash → see the remaining $125.50 in To do for a fresh discounted sample ($148 for a legacy $198 job). Try Dave's access confirmation, My kit shortages, a phone booking with no email, and customer approval of a reschedule or extra work.

The header Help control explains the flow and demo boundaries. All notifications, approvals, and payments remain browser-local role-play. The customer-home/promotion zip is integrated in the combined release described below.

## New: five connected workflows

1. **Service setup:** open **Joe’s workspace → My business → Services & prices**. Edit starting price/time, booking mode, and questions. Questions support select/text/number answers, required answers, conditions based on earlier questions, and matching-answer effects on price, duration, preparation, and owner review. Try the live customer preview, then **Save changes**. Publishing is browser-local and applies to new visits; agreed visits keep snapshots of their catalog and promotion policy.
2. **Quote to booking:** start a gutter visit and choose **3 or more stories**, or publish a quote-only service. Submit **Request an owner quote**. In **Joe’s workspace → Requests**, provide an exact total including travel, service time, and included work. Switch to **My bookings** to accept the offer, choose a fitting slot, and confirm. A request/offer itself reserves no time; accepting a newer quote invalidates an earlier review. Declining an offer creates no appointment.
3. **Multiple services:** add services in the customer scope screen. The visit combines service time, question effects, tools, and a single travel charge. Only whole-visit slots are offered. Oversized combinations can request an owner quote instead of bypassing capacity rules.
4. **Job to payment:** use **Jobs & money** to mark on-the-way or started, propose additional work, and complete a job with actual time. In **My bookings**, approve or decline extras. Approval updates time, preparation, and invoice total only if the enlarged visit fits the calendar; pending extras block completion. Owner invoice controls record partial/full fictional cash payments and preview a payment follow-up; the customer hub records a fictional remaining-balance payment. Job completion and payment status are independent. No real payment or message is sent.
5. **Repeat & seasonal:** from a customer visit choose **Plan repeat visits**, select weekly/every two weeks, review up to three dates and current totals, and confirm. Capacity is rechecked before reservation. **Pause plan** releases unstarted, unpaid repeat appointments, preserving the source visit; payments or started jobs require resolution first. **Remind me next fall** saves an opt-in browser-local reminder; **Preview next-fall rebooking** opens the remembered scope on October 28, 2027 with current rules. It requires review and confirmation; there is no background notification, renewal, or automatic charge.

Useful walkthrough: create a three-story gutter quote for **$220 / 120 minutes**, book it at **1:15 PM**, propose **$25 / 15 minutes** of additional work, approve as the customer, complete it, record **$50** in fictional cash, and settle the **$195** demo balance. Test repeat plans on a standard leaf/mowing visit; assessment services need a fresh quote.

Storage adds `business-hq-rules-v3` and `business-hq-workflows-v3`. Existing v1 bookings and v2 preparation/weather state remain intact. Previous bookings without snapshots are assigned the original catalog rules in memory. Refresh after deployment if an older tab is open.

## Earlier returning-customer and weather experiences

1. **Returning customer:** on the home page, select services in **Recently ordered**, then choose **Book again**. Unchanged services take the fast scheduling path. Changed selections or booking questions open scope review first. Property details and applicable saved answers are remembered; totals use the current campaign and require review before confirmation.
2. **Provider's working day:** choose **Try Joe's working day** or open **Joe's workspace → Try a sample day**. Two fictional visits appear on an available sample day without replacing existing bookings. Check the next departure, route details, job scopes, access, parking, combined tools/materials, and the missing-access attention item. Preview the customer's answer and save it. Complete a job and record the actual minutes to update that property's repeat-booking history.
3. **Rain delay:** with a sample day loaded, select **Plan a rain delay**. Review proposed new times and prices, then **Send demo change requests**. The original appointments remain confirmed and the proposed slots are reserved. Select the proposed date in Joe's workspace to see held proposals. Open **My bookings** to role-play each customer's acceptance or decline. Acceptance moves the visit and confirms the displayed new price; decline preserves the original and flags follow-up for Joe. New bookings on the rain day stay paused.

For new bookings, Dave’s gutter visit remains **$156** when moved from October to November, then becomes **$168** in December. Existing bookings made under the earlier October-only promotion still disclose any loss of that discount when moved into November.

## Scheduling and persistence

- Sample working days: October 29 through December 18, 2026, plus October 28 through November 5, 2027 for seasonal rebooking. Sample clock: **1 PM Eastern** on the chosen day.
- Joe's sample hours (`HOURS` in `model.js`) vary by day: Monday 9 AM–1 PM, Wednesday and Thursday 1–5 PM, Friday 8 AM–12 PM. Customers book from a week view, and start times appear after they pick a day. Earliest arrival is 15 minutes after opening, allowing the first drive. Each visit also reserves a 15-minute travel/setup buffer after service, which must finish by closing.
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

Tests additionally cover field progression, phone bookings, completion/stock consumption, approval holds, cancellations, payment summaries, and load-up shortages. Tests cover conditional rule effects, immutable price/scope snapshots, quotes, additional-work approval and conflicts, completion, partial payments, repeat-plan reservations and pausing, plus earlier departure buffers, weather holds, packing, and property history. No install or build step is required.

## Hosting

GitHub Pages source: **main / repository root**. Keep `index.html`, `styles.css`, `app.js`, `model.js`, `operations.js`, `experience.js`, `rules.js`, `workflow-model.js`, and `workflow-ui.js`, `calendar.js`, `readability.css`, `owner-model.js`, `owner-hq.js`, and `owner.css` together. `.nojekyll` disables Jekyll processing. Pushing to `main` publishes the static site through GitHub Pages.

## Demo limits

All properties, contact details, jobs, weather changes, travel times, and material quantities are fictional or illustrative. No real messages, payments, weather forecast, traffic routing, or inventory connection is made. Calendar downloads are one-way `.ics` files, not live calendar sync. Tax is illustrative at $0.

There is no shared customer database, authentication, or server-authoritative calendar. A production implementation needs verified addresses, route estimates, transactional capacity holds, secure customer approval links, real notifications, payments, and calendar integrations. The interface optionally loads Google Fonts, with system fonts as fallback.

This static sample is separate from the React contribution in `nullwavelabs/business-hq-web`.
