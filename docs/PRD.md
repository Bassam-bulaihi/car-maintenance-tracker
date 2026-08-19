# Mini PRD — Car Maintenance Tracker(Car auto)

**Status:** Draft v0.3 — provider fixed to Meta WhatsApp Cloud API
**Owner:** Muhannad
**Audience:** Implementation agent (AI) + reviewing developer

---

## 0. Agent Constraints (Read First — Non-Negotiable)

These rules override any default behavior, preference, or "best practice" the agent may want to apply.

| # | Rule |
|---|------|
| 1 | The agent **MUST** follow `design.md`. It is the single source of truth for visual style, tokens, colors, spacing, and component behavior. |
| 2 | For layout, the agent **MUST** follow the **Figma frames**. Structure, hierarchy, and placement come from Figma — not from the agent's judgment. |
| 3 | If the agent needs to introduce anything not covered by `design.md` or the Figma frames (a new state, an edge-case screen, an empty state), it **MUST** derive it from Rules 1 and 2 — extending existing patterns, never inventing new ones. |
| 4 | Fonts: Arabic text uses **Noto Sans Arabic**; English text uses whatever `design.md` specifies. Icons: use the **Lucide** icon library exclusively for every icon in the product. The agent **MUST NOT** select, substitute, or add fonts (beyond this rule) or icons from any other icon set. |
| 5 | WhatsApp messaging goes through the **Meta WhatsApp Cloud API** (direct, no BSP/reseller). The agent **MUST NOT** substitute a BSP (Twilio, Wati, 360dialog, AiSensy, etc.), an unofficial library, or any other messaging channel (You don't have the connection right now so you need to work as we will it will all work in the future). |

**Escalation rule:** if a requirement is ambiguous or conflicts with the above, the agent stops and asks — it does not guess.

---

## 1. Overview

A web application that helps car owners **track vehicle maintenance** and reminds them — over **WhatsApp** — when a service is due.

The user signs up, registers their car, and provides the vehicle details the system needs. From there the system periodically asks the user for their current **odometer reading** over WhatsApp, compares it against the maintenance thresholds for that vehicle, and notifies the user when something is due (engine oil, transmission fluid, brake fluid, brake pads, etc.).

The user confirms or denies completion directly from WhatsApp, and the system updates the maintenance baseline accordingly.

---

## 2. Goals

- Let a user register an account and **multiple vehicles** (no single-car limit in v1).
- Store vehicle data and maintenance history reliably.
- Proactively collect odometer readings via WhatsApp on a recurring schedule.
- Trigger maintenance notifications based on **mileage thresholds and time-based intervals** (whichever comes first).
- Let the user reply from WhatsApp: **"تم التغيير"** or **"لم يتم التغيير"**.
- Update the maintenance baseline in the database when a service is confirmed.
- Ship presets per car model so the user isn't asked to configure intervals manually.
- Provide an **admin UI** for maintaining vehicle presets.
- Support **Arabic and English** across the web interface and the WhatsApp messages, with a language toggle and correct RTL/LTR handling.

## 3. Non-Goals (v1)

- No booking, workshop marketplace, or payments.
- No parts e-commerce.
- No mobile app — web only.
- No languages beyond Arabic and English.

---

## 4. Users

| User | Needs |
|------|-------|
| **Car owner** | Register, add a car, provide mileage updates (we ask, he replies with a number over WhatsApp), receive reminders, confirm work done, see maintenance status/history. |
| **Admin (internal)** | Manage vehicle presets (models, intervals, recommended oil/parts) through a dedicated **admin UI** — in scope for v1. |

---

## 5. Core Flows

### 5.1 Sign up / Log in / Log out
- Email + password (Supabase Auth).
- Phone number is **required** — it is the WhatsApp channel identity.
- Session persists; explicit logout available.

### 5.2 Register a vehicle
1. User selects make → model → year (e.g. *Accent 2025*).
2. System loads the matching **preset**: recommended oil type, recommended parts, and service intervals.
3. User enters current odometer reading.
4. Optional: user marks which services were recently done and at what mileage (to seed baselines).

### 5.3 Odometer collection (recurring)
- On a schedule, the system sends a WhatsApp message asking for the current odometer.
- **Cadence:** the agent picks a sensible default, but it **MUST** be stored as configuration (single constant / config table / env value) — not hardcoded across the codebase — so it can be changed later without touching logic.
- Example: *"ما هو عداد سيارتك الآن؟"*
- User replies with a number (e.g. `25000`).
- Reading is validated (must be ≥ last recorded reading, within a sane delta) and stored.
- **Entry channels:** the user can submit an odometer reading from **either the web dashboard or WhatsApp**. On WhatsApp, however, a reading is only accepted **as a reply to a notification we sent** — the system does not accept spontaneous, unprompted odometer messages. Web entry is always available on demand.
- A web-entered reading runs the same validation and triggers the same due-service evaluation as a WhatsApp one, and resets the odometer-request clock.

### 5.4 Due-service evaluation

A service item is due when **either** its mileage threshold **or** its time threshold is crossed — whichever comes first.

Evaluated on every new odometer reading, and on a recurring time check for date-based items:

```
mileage_due = (current_odometer - last_service_odometer) >= interval_km
time_due    = (today - last_service_date) >= interval_months

if mileage_due OR time_due:
        → service is DUE → send notification
```

- Either threshold may be null for a given item (some services are mileage-only, some are time-only).
- Example (mileage): engine oil interval = 5,000 km. Last change at 20,000. New reading 25,000 → **due**.
- Example (time): brake fluid interval = 24 months. Last change 25 months ago, mileage still under threshold → **due**.
- Confirming a service resets **both** baselines (`last_service_odometer` and `last_service_date`).

### 5.5 Notification + reply
- System sends a WhatsApp notification naming the due service.
  Example: *"هل تم تغيير زيت الفرامل؟"*
- User responds with one of two options:
  - **تم التغيير** → mark the service as completed; set `last_service_odometer` to the current reading and `last_service_date` to today; log to history.
  - **لم يتم التغيير** → keep the item due and re-remind.
- **Re-reminder rules:**
  - The re-reminder runs at a **higher frequency than the default odometer cadence** (an overdue service is chased more aggressively than a routine check-in). Like the default cadence, this value must be configurable.
  - Re-reminders are **independent per service item**. An unresolved engine-oil reminder must **not** block, pause, or delay reminders for any other item (brake fluid, filters, etc.) — each item tracks its own due state and reminder clock.
- All inbound replies are handled by a webhook from the WhatsApp provider.

### 5.6 Dashboard (web)
- List of the user's vehicles (a user may own several; the dashboard supports switching between them).
- Per vehicle: current odometer, upcoming/overdue services, and maintenance history.
- The user can submit an odometer reading directly from here (see 5.3).
- Layout and components strictly per Figma frames + `design.md`.

### 5.7 Admin UI (presets)
- Restricted to internal admin accounts.
- Create, edit, and retire `vehicle_presets` (make / model / year, recommended oil, recommended parts).
- Manage each preset's service items and their `interval_km` / `interval_months` values.
- Editing a preset affects **newly registered** vehicles; existing vehicles keep their current intervals unless explicitly re-synced.

---

## 6. Data Model (Indicative)

| Table | Key fields |
|-------|-----------|
| `users` | `id`, `name`, `email`, `phone_number`, `language` (ar/en), `role` (owner/admin), `created_at` |
| `vehicles` | `id`, `user_id`, `make`, `model`, `year`, `plate_no`, `current_odometer`, `odometer_updated_at` |
| `vehicle_presets` | `id`, `make`, `model`, `year`, `recommended_oil`, `recommended_parts` |
| `preset_service_items` | `id`, `preset_id`, `service_type`, `interval_km`, `interval_months` |
| `vehicle_service_items` | `id`, `vehicle_id`, `service_type`, `interval_km`, `interval_months`, `last_service_odometer`, `last_service_date`, `status` |
| `odometer_readings` | `id`, `vehicle_id`, `reading_km`, `source` (whatsapp/web), `recorded_at` |
| `notifications` | `id`, `vehicle_id`, `service_item_id`, `message_type`, `sent_at`, `response`, `responded_at` |
| `service_history` | `id`, `vehicle_id`, `service_type`, `odometer_at_service`, `confirmed_at` |

A user may have many `vehicles`; every vehicle-scoped query and screen must handle the multi-vehicle case.

Service types (v1): engine oil, transmission fluid, brake fluid, brake pads, air filter, oil filter, tires.

---

## 7. WhatsApp Integration

**Provider: Meta WhatsApp Cloud API — direct integration, no BSP** (see Rule 5).

### 7.1 Setup
- Meta Developer App + WhatsApp Business Account (WABA) + verified business phone number.
- Required config (all via environment variables, never hardcoded): `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`.
- Use a **System User token** (long-lived), not a temporary developer token.
- Development uses Meta's free test number before the production number is provisioned.

### 7.2 Outbound
- Sent via `POST https://graph.facebook.com/{version}/{phone-number-id}/messages`.
- All business-initiated messages must use **pre-approved message templates** in the **utility** category (odometer requests and service-due reminders are transactional, not marketing).
- Templates must be registered in **both Arabic and English**; the send picks the language matching `users.language`.
- Service-due notifications use **interactive reply buttons** (`تم التغيير` / `لم يتم التغيير`) rather than asking for free text — this gives a clean, unambiguous payload back.
- Handle Meta error codes explicitly: `131047` (24-hour window expired → must use a template), `131026` (undeliverable), `132000` (template param mismatch), and rate-limit responses. Failed sends are retried with backoff and logged.

### 7.3 Inbound
- A single webhook endpoint handles both the `GET` verification handshake (echo `hub.challenge` when `hub.verify_token` matches) and `POST` message events.
- **Every `POST` must verify the `X-Hub-Signature-256` HMAC header against `WHATSAPP_APP_SECRET`.** Unsigned or mismatched requests are rejected.
- The endpoint must **respond `200` immediately** and process the payload asynchronously — Meta retries on timeout and will duplicate messages otherwise.
- Payloads are **not guaranteed unique**; deduplicate on the message `id` (`wamid`) before processing.
- Parse both `interactive.button_reply.id` (preferred) and plain `text.body` (fallback), then map to the open notification for that phone number.
- `statuses` events (sent / delivered / read / failed) are stored against the notification record.

### 7.4 Cost model (informational)
- Inbound messages from users are free; only outbound utility templates are billed per delivery.
- Once a user replies, a **24-hour service window** opens in which free-form follow-ups are free — clarification and error messages should be sent inside this window rather than as new templates wherever possible.
### 7.5 Message behaviour
- Button replies are the primary path, but reply handling must still tolerate free-text variants of "تم / تم التغيير / نعم" and "لم يتم / لا", in both Arabic and English.
- **Invalid input handling:** if a reply can't be parsed (unrecognized text, a non-numeric odometer answer, a reading lower than the last one, or an implausible jump), the system replies with a short clarification asking the user to try again, and does **not** write anything to the database. After a defined number of failed attempts the thread is left open and flagged for follow-up rather than looping indefinitely.
- **Unsolicited or out-of-context messages** (a reply with no matching open notification) get a generic help response, not silence.
- **Message language:** every outbound message is sent in the user's saved language preference (`users.language`). There is no separate messaging-language setting — changing the language in the web app changes the WhatsApp messages too.
- Every inbound and outbound message is logged against the `notifications` record.

---

## 8. Tech Stack

| Layer | Choice |
|-------|--------|
| Hosting / Frontend | **Vercel** |
| Database / Auth / Storage | **Supabase** |
| Messaging | **Meta WhatsApp Cloud API** (Graph API, direct — no BSP) |
| Scheduling | Cron job (Vercel Cron or Supabase scheduled function) for recurring odometer requests |
| Typography | **Noto Sans Arabic** for Arabic text; whatever `design.md` specifies for English text — not otherwise chosen by the agent |
| Icons | **Lucide** — the standard icon library for the project; no other icon set is used |

---

## 9. Acceptance Criteria

- [ ] A user can sign up, log in, and log out.
- [ ] A user can register a vehicle and the correct preset loads automatically.
- [ ] The system sends a WhatsApp odometer request on schedule.
- [ ] A valid odometer reply is stored and reflected on the dashboard.
- [ ] A due service triggers a WhatsApp notification with two reply options.
- [ ] Replying "تم التغيير" updates the baseline and appends a history record.
- [ ] Replying "لم يتم التغيير" keeps the item due.
- [ ] A user can register and manage more than one vehicle.
- [ ] A service becomes due on mileage OR elapsed time, whichever comes first.
- [ ] An odometer reading can be submitted from the web dashboard as well as WhatsApp.
- [ ] A spontaneous WhatsApp odometer message with no open notification is not accepted as a reading.
- [ ] An admin can create and edit presets and their intervals from the admin UI.
- [ ] WhatsApp messages arrive in the user's saved language.
- [ ] The webhook rejects requests with an invalid `X-Hub-Signature-256` signature.
- [ ] A duplicated webhook delivery (same `wamid`) is processed only once.
- [ ] Service-due notifications render as tappable reply buttons, not free text prompts.
- [ ] All screens visually match the Figma frames and `design.md`.
- [ ] An unparseable or invalid reply triggers a clarification message and leaves the database unchanged.
- [ ] No font outside the provided set, and no icon outside the Lucide library, appears anywhere in the build.
- [ ] The interface renders correctly in both Arabic (RTL) and English (LTR), with no untranslated strings.

---

## 10. Decisions Log

All previously open questions are resolved:

| Question | Decision |
|----------|----------|
| Odometer request cadence | Agent picks the default; must be stored as configuration so it's easy to change later. |
| Re-reminder after "لم يتم التغيير" | Yes — more frequent than the default cadence, and independent per service item. |
| Multiple vehicles per user in v1 | Yes. |
| Who maintains presets | Admin UI, in scope for v1. |
| Time-based intervals | Yes — mileage OR time, whichever comes first. |
| WhatsApp message language | Follows the user's saved language preference. |
| WhatsApp provider | Meta WhatsApp Cloud API, direct — no BSP or reseller. |
| Odometer entry channel | Both web and WhatsApp — but WhatsApp readings must be replies to a notification we sent. |
| Font choice | Arabic text: **Noto Sans Arabic**. English text: whatever typeface `design.md` specifies. |
| Icon library | **Lucide**, downloaded as a standard dependency and used for every icon in the product — no other icon set. |
