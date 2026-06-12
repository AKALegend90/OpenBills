# OpenBills Project Instructions

## Project Goal

OpenBills is a free, open-source, privacy-first bill tracker desktop app.

The app is manual input only.

Never add:
- Bank connection
- Login
- Cloud sync
- Ads
- Tracking
- Analytics
- Selling data
- Required internet features

All data must stay local on the user's device.

## Tech Stack

Use:
- Tauri v2
- React
- TypeScript
- SQLite

## Code Style

- Use TypeScript types for all bill, income, and settings data.
- Keep components small and readable.
- Keep database logic inside src/db.
- Keep calculations inside src/utils/calculations.ts.
- Keep date helpers inside src/utils/dates.ts.
- Keep money formatting inside src/utils/money.ts.

## Testing

Add tests for:
- Monthly income calculation
- Weekly income conversion
- Biweekly income conversion
- Leftover money calculation
- Due soon calculation
- Overdue calculation

## Privacy Rules

Do not add any feature that sends user data outside the device.

## UI Rules

The app should be simple, friendly, and easy for non-technical users.

Use:
- Dashboard cards
- Clear buttons
- Paid/unpaid status
- Due soon warning
- Overdue warning
- Dark mode
