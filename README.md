# DriveDB Console

DriveDB Console is an enterprise-style responsive frontend project that treats Google Drive links as data sources and XLSX/Sheets tabs as relational-style tables.

## Highlights

- **Credential vault** with browser-side AES-GCM encryption for private keys.
- **Drive link registry** with URL validation and spreadsheet ID extraction.
- **Table discovery workflow** that simulates scanning XLSX-backed tabs.
- **Query studio** that generates execution plan previews.
- **Audit timeline** for change tracking.
- **Responsive layout** optimized for desktop, tablet, and mobile breakpoints.

## Architecture

- `src/state/store.js`: app state container with local persistence.
- `src/services/credentialVault.js`: encryption helpers (Web Crypto API).
- `src/services/driveGateway.js`: service adapter for table discovery/query plans.
- `src/utils/validators.js`: URL and field validation helpers.
- `src/components/templates.js`: UI templates for dashboard composition.
- `src/styles/app.css`: design system + responsive styling.

## Run locally

Because this project is dependency-free, you can serve it with any static file server.

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>.

## Production hardening suggestions

1. Replace mock `driveGateway` with real Google Drive + Sheets integrations.
2. Add OAuth PKCE and role-based access control.
3. Move secrets to a backend token broker and avoid storing encrypted keys in localStorage.
4. Add unit/integration tests and CI policy checks.
5. Wire telemetry (OpenTelemetry) and centralized audit export.
