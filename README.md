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

* User registration and authentication
* Multiple vehicle management
* Vehicle maintenance tracking
* Odometer tracking through the web and Telegram replies
* Mileage- and time-based maintenance reminders
* Telegram service reminders with Done / Not done buttons
* Maintenance history
* Arabic and English support
* Admin dashboard for vehicle maintenance presets

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
