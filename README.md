# Aria-Ease local audit service (Experimental V1)

The CLI and service reuse the existing Aria-Ease DSL compiler and Playwright
contract runner. The service is intended for local development and does not
replace the browser runner or the component test harness.

## Start the harness

```bash
cd exprmnts
npm run dev -- --host 127.0.0.1
```

## Start the service

From the repository root:

```bash
npm --prefix extension run service
```

The service binds to `127.0.0.1:4317` by default. Set `PORT` to use another
local port. The startup output contains a bearer token; keep it local.

By default, a new random token is generated each time the service starts. To
use a deliberate local token instead, provide it at startup:

```bash
ARIA_EASE_AUTH_TOKEN='your-local-token' \
  npm --prefix extension run service
```

The extension must contain that exact token. For temporary troubleshooting,
`ARIA_EASE_AUTH_DIAGNOSTICS=1` logs only whether an authorization token was
present, its length, and the request method; it never logs the token or
authorization header.

## Check health

```bash
curl http://127.0.0.1:4317/health
```

The response is:

```json
{ "status": "ok" }
```

The health response never includes the authentication token.

## Submit an audit

```bash
curl -X POST http://127.0.0.1:4317/api/audits \
  -H "Authorization: Bearer YOUR_STARTUP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "http://127.0.0.1:5173/test-harness?component=combobox",
    "component": "combobox",
    "root": "/Users/macx/aria-ease/exprmnts",
    "targetSelector": "#fruit"
  }'
```

`targetSelector` is optional and currently supported only for `combobox`. The
Playwright page must contain exactly one matching element with
`role="combobox"`, matching the contract's `main` selector, and an
`aria-controls` value pointing to exactly one matching listbox. The associated
popup is resolved through that relationship even when it is outside the
combobox subtree.

Passing audits return HTTP 200. Contract failures and skipped checks return
HTTP 422 with the structured runner result. Invalid requests return HTTP 400;
missing or invalid tokens return HTTP 401; a concurrent audit is rejected with
HTTP 409.

## Run tests

With the harness running:

```bash
npm --prefix extension test
```

## Load the Chrome extension MVP

The unpacked Manifest V3 client is in
[`extension/chrome-mvp`](./chrome-mvp). Load that directory from
`chrome://extensions` with Developer mode enabled. Start the service with the
exact extension origin allowlisted:

```bash
ARIA_EASE_EXTENSION_ORIGINS=chrome-extension://YOUR_EXTENSION_ID \
  npm --prefix extension run service
```

Paste the startup bearer token into the popup settings, keep the approved root
set to the local `exprmnts` directory, and use **Select component** on an
HTTP(S) page. The extension supports comboboxes only. It sends the active tab
URL and a unique `targetSelector`; the service performs a fresh Playwright
navigation, so live-tab cookies, login state, transient DOM state, and unsaved
changes are not included. Chrome may assign a different ID to an unpacked
extension after its directory or key changes; update the exact allowlist value
and restart the service in that case. Never use a wildcard origin or expose
the bearer token to the inspected page.

The popup rejects browser-internal, `data:`, `javascript:`, and `file:` target
URLs before making a request. CORS is only an origin restriction; bearer
authentication remains mandatory.

The service only accepts project roots under the approved local `exprmnts`
root, permits HTTP/HTTPS/data target URLs, and does not accept JavaScript,
filesystem instructions outside approved roots, scenarios, or arbitrary
Playwright actions. The current runner uses one shared browser, so the service
serializes audits and rejects concurrent requests. Target pages must expose
selectors expected by the selected contract. A targeted audit navigates to the
URL in a separate Playwright browser context; it does not inspect or preserve
the live DOM state, cookies, authentication, or transient state of a Chrome
tab. Login flows and authenticated external pages are not automated by this
service.

# chrome-extension

# chrome-extension
