# report-studio-desktop

**Status:** Runnable Electron scaffold (mock report data)  
**Kind:** Electron + Vite + React  
**Backend:** `all apps (read)` (ERPNext password login via Electron main; datasets/pivots/charts are local mock until report APIs exist)  
**Stack:** [FRONTEND_STACK](../../Docs/Foundation/FRONTEND_STACK.md)

Cross-app Report Studio: datasets, saved reports, pivot, charts, dashboards, and exports.

## Auth

Sign in with an ERPNext / Frappe **site URL + email/password**. Login runs in the Electron main process via `@zatgo/erpnext` (avoids CORS) and keeps the Frappe session cookie (`sid`) there.

Use **Continue offline** on the login screen to browse mock data without a site.

## Run

From the workspace root:

```bash
pnpm install
pnpm dev:report-studio
```

Or:

```bash
pnpm --filter @zatgo/report-studio-desktop dev
```

Optional env (picked up by Vite for the default base URL):

```bash
VITE_FRAPPE_BASE_URL=https://demo.zatgo.online pnpm dev:report-studio
```

Default site URL matches ERPNext development publish port (`8082`).

## Scripts

| Script | Description |
|--------|-------------|
| `dev` | Vite + Electron (port 5176) |
| `build` | Typecheck + production renderer/electron build |
| `typecheck` | `tsc` for renderer and electron/config |

## Workspace packages

```json
{
  "dependencies": {
    "@zatgo/ui": "workspace:*",
    "@zatgo/sdk": "workspace:*",
    "@zatgo/auth": "workspace:*",
    "@zatgo/erpnext": "workspace:*",
    "@zatgo/icons": "workspace:*"
  }
}
```

Feature pages stay on mock repositories until each app’s `api.v1.reports.*` methods are wired through `@zatgo/sdk`.
