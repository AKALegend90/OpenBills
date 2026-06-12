# OpenBills

OpenBills is a free, open-source, privacy-first bill tracker app.

Created by [AKALegend90](https://github.com/AKALegend90).

It helps users manually track:
- Bills
- Due dates
- Subscriptions
- Income
- Paid/unpaid status
- Money left after bills

No account required.
No bank connection.
No cloud sync.
No ads.
All data stays on your device.

## Features

- Manual bill tracking
- Manual income tracking
- Due date tracking
- Paid/unpaid status
- Monthly leftover money calculator
- Local-first storage
- Dark mode
- CSV import/export
- Calendar view
- Monthly reset for recurring bills
- Payment history
- Due today, due soon, and overdue views
- Stronger bill filters and sorting
- Undo for deletes

## Privacy

OpenBills does not connect to your bank account.
OpenBills does not require an account.
OpenBills does not upload your data.
OpenBills does not track you.
All data is stored locally on your device.

## Setup

Install Node.js and Rust, then install dependencies:

```bash
npm install
```

Run the web app:

```bash
npm run dev
```

Run the Tauri desktop app:

```bash
npm run tauri dev
```

This repository also includes `openbills.html`, a self-contained local preview that can be served locally for immediate testing.

```bash
node scripts/local-preview-server.mjs
```

Then open `http://127.0.0.1:4173/`.

## Development

- React and TypeScript app source lives in `src`.
- Tauri desktop configuration lives in `src-tauri`.
- Database and storage logic belongs in `src/db`.
- Calculation helpers belong in `src/utils/calculations.ts`.
- Date helpers belong in `src/utils/dates.ts`.
- Money formatting belongs in `src/utils/money.ts`.

## Testing

Run calculation tests:

```bash
npm test
```

## Screenshots

Add screenshots later.

## License

MIT License
