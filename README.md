# KesariX Delivery Club — Partner Recruitment Site

A single-page delivery-partner recruitment landing page. Dark, cinematic
brand styling with an application form that feeds submissions straight into
a Google Sheet.

## Files

| File | Purpose |
|------|---------|
| `index.html` | The full landing page (HTML + CSS + JS, self-contained). |
| `logo.png` / `site-logo.ico` | Brand lion mark (favicon + on-page logo). |
| `google-apps-script.gs` | Google Apps Script that receives form submissions and appends them to the recruitment sheet. |

## Form → Google Sheet setup

1. Open the target Google Sheet → **Extensions → Apps Script**.
2. Paste all of `google-apps-script.gs`, then **Deploy → New deployment → Web app**
   (Execute as: *Me*, Who has access: *Anyone*). Authorize when prompted.
3. Copy the resulting `/exec` Web App URL.
4. In `index.html`, set `SHEET_ENDPOINT` to that URL.

Until the endpoint is set, the form runs in **demo mode** (validates and shows
the success screen, logging the payload to the console).

## Ads

Google AdSense slots (leaderboard, sidebar rectangle, footer) are included.
Replace the `ca-pub-XXXXXXXXXXXXXXXX` publisher ID and `data-ad-slot` values
with your own before publishing.

## Local preview

```bash
python -m http.server 8765
# then open http://localhost:8765/index.html
```
