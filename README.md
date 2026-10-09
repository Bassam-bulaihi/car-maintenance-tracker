# Auto Car


## Project Overview

Car Maintenance Tracker is a web application that helps car owners track vehicle maintenance and receive reminders through a Telegram bot. Users can register multiple vehicles, track odometer readings, view maintenance status and history, and receive service reminders based on mileage or time intervals.

## Training Program

**Training Program Name:** SDAIA
**GitHub:** https://github.com/SDAIAAcademy

## Team Members

* Danah Aljughayman
* Rama Almutairi
* Bassam Albulaihi
* Abrar Alsharafi
* Layan Alotaiby

## Core Features

* User registration and authentication (Clerk, email code verification)
* Multiple vehicle management — pick from a catalog of 400+ presets (make → model → year) or add a custom car with your own schedule
* Per-service progress (km / time left), early logging, and adjustable baselines and intervals
* Odometer tracking through the web and Telegram replies, with a time-scaled plausibility check that asks for confirmation instead of rejecting
* Mileage- and time-based maintenance reminders, re-reminded per service item
* Telegram bot: odometer requests, Done / Not done buttons, `/status`, tolerant Arabic/English replies
* Maintenance and odometer history
* Arabic (RTL) and English, with the bot following the site language
* Public model catalog at `/models`
* Admin console: preset search, editing, re-sync to registered cars, and a follow-up queue for stuck Telegram threads

## Technology

* **Frontend / Hosting:** Vercel
* **Database:** Supabase
* **Authentication:** Clerk
* **Messaging:** Telegram Bot API
* **Scheduling:** Vercel Cron
* **Icons:** Lucide
* **Arabic Font:** Noto Sans Arabic

## Project Documentation

The complete requirements and specifications are defined in the Mini PRD.

## Testing

`npm run build && npm run test:telegram` runs every Telegram message and reply scenario end to end (webhook auth, account linking, odometer validation, service confirmations, dedupe, cron cadence) against the real database and a local mock of the Bot API.
