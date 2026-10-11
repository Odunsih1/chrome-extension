# Aria-Ease Chrome extension MVP

This Manifest V3 extension selects a `combobox` on the active HTTP(S) page and
submits its URL and generated CSS selector to the existing local audit service.
The service then performs a fresh Playwright navigation. It does not inspect
the live Chrome tab or reuse its cookies, authentication, or transient state.

## Load in Chrome

1. Start the harness if auditing the repository fixture:
   `cd exprmnts && npm run dev -- --host 127.0.0.1`
2. Start the service:
   `npm --prefix extension run service`
3. Open `chrome://extensions`, enable Developer mode, choose **Load unpacked**,
   and select `extension/chrome-mvp`.
4. Copy the bearer token printed by the service into the popup.
5. Enter the approved project root, normally `/Users/macx/aria-ease/exprmnts`.

The service must allow the exact unpacked extension origin:

```bash
ARIA_EASE_EXTENSION_ORIGINS=chrome-extension://YOUR_EXTENSION_ID npm --prefix extension run service
```

If Chrome assigns a new ID after reloading the unpacked directory, restart the
service with the new exact origin. Never use `*` and never put the token in
page content or source files.

## Use

Open an HTTP(S) page containing a combobox, open the extension popup, choose
**Select component**, hover and click the combobox, then choose **Run audit**.
The popup displays the actual `status`, `passes`, `failures`, `skipped`, and
`warnings` fields returned by the service.
