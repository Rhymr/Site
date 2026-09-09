# rhymr-checkout

Tiny Stripe Checkout backend for the Rhymr macOS build. Pay-what-you-want with a
$5 floor, one-time payment, no licence key issued — it exists only to fund the
work.

## Endpoints

| method | path | purpose |
|---|---|---|
| `POST` | `/api/create-checkout-session` | returns `{ url }`; the site redirects the buyer there |
| `POST` | `/api/webhook` | Stripe calls this; `checkout.session.completed` → `fulfil()` |
| `GET`  | `/health` | liveness |

## Run locally

```bash
cd server
npm install
cp .env.example .env          # fill in STRIPE_SECRET_KEY when you can reach Stripe

# terminal 1
npm run dev

# terminal 2 — forwards Stripe events and prints STRIPE_WEBHOOK_SECRET
npm run stripe:listen         # needs the Stripe CLI: https://stripe.com/docs/stripe-cli
# put the printed whsec_... into .env, restart terminal 1

# smoke test
curl -XPOST localhost:4242/api/create-checkout-session   # -> {"url":"https://checkout.stripe.com/..."}
```

Use Stripe **test** keys and card `4242 4242 4242 4242` until launch.

## Wiring the site

`index.html` has buy buttons marked with `data-checkout`. A small inline script
(search `CHECKOUT_API` in `index.html`) POSTs to
`CHECKOUT_API + '/api/create-checkout-session'` and follows the returned `url`.
Set `CHECKOUT_API` to this service's public origin. Until it's set, the buttons
just scroll to `#pricing`.

## Deploy

Plain Node + Express — runs as-is on Render, Railway, Fly, or a VPS behind
nginx. Set the env vars from `.env.example` in the host's dashboard. Add a
webhook endpoint in Stripe (`https://<this-service>/api/webhook`,
event `checkout.session.completed`) and copy its signing secret into
`STRIPE_WEBHOOK_SECRET`. Set `SITE_URL` to the real site origin so CORS and the
success/cancel redirects are correct.

For Vercel/Netlify Functions you'd split the two handlers into separate function
files and keep the webhook on the raw body — the logic in `index.js` /
`fulfil.js` ports directly.

## Fulfilment

`fulfil.js` currently just logs each sale. When there's a build to ship, set
`DOWNLOAD_URL` and add a mailer call there (send a short-lived signed URL to
`session.customer_details.email`). Keep it idempotent — Stripe retries.
