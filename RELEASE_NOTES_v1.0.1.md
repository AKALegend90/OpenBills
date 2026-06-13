# OpenBills v1.0.1

Patch release for Windows startup reliability.

## Fixed

- Start with Windows now uses the standard per-user Windows Run registry key.
- OpenBills re-syncs desktop startup settings when the app opens.
- Startup can launch OpenBills minimized with `--minimized`.

## Validation

- Calculation tests: 6/6 passing
- Windows `.exe` rebuilt successfully
- Minimized launch check passed
