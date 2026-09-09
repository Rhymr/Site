/**
 * Rhymr — Stripe Checkout backend.
 *
 * Two endpoints:
 *   POST /api/create-checkout-session  → returns { url } to redirect the buyer to
 *   POST /api/webhook                  → Stripe calls this; we fulfil the order here
 *   GET  /health                       → liveness
 *
 * Pay-what-you-want with a $5 floor is done with Checkout's `custom_unit_amount`
 * (no pre-made Price object needed). A bought build and a `cargo build` are the
 * same program — this service just funds the work; it issues no licence key.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';

import { fulfil } from './fulfil.js';

const {
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  PORT = 4242,
  SITE_URL = 'http://localhost:8000',
  SUCCESS_PATH = '/thanks.html?s={CHECKOUT_SESSION_ID}',
  CANCEL_PATH = '/#pricing',
  MIN_AMOUNT_CENTS = 500,
  PRESET_AMOUNT_CENTS = 500,
} = process.env;

if (!STRIPE_SECRET_KEY) {
  console.error('Missing STRIPE_SECRET_KEY — copy .env.example to .env and fill it in.');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY);
const app = express();

// CORS: only the site may call the checkout endpoint from the browser.
app.use(cors({ origin: SITE_URL, methods: ['POST'] }));

/* ---------------------------------------------------------------------------
 * Webhook — MUST see the raw body to verify Stripe's signature, so it is
 * registered before express.json().
 * ------------------------------------------------------------------------- */
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    try {
      await fulfil(session);
    } catch (err) {
      // Return 500 so Stripe retries rather than dropping the sale.
      console.error('Fulfilment failed for', session.id, err);
      return res.status(500).send('fulfilment failed');
    }
  }

  res.json({ received: true });
});

app.use(express.json());

/* ---------------------------------------------------------------------------
 * Create Checkout Session
 * ------------------------------------------------------------------------- */
app.post('/api/create-checkout-session', async (_req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Rhymr — macOS build',
              description:
                'Pay what you want, $5 minimum. Own it forever, every update included. No licence key.',
            },
            // Pay-what-you-want with a floor.
            custom_unit_amount: {
              enabled: true,
              minimum: Number(MIN_AMOUNT_CENTS),
              preset: Number(PRESET_AMOUNT_CENTS),
            },
          },
        },
      ],
      // Checkout collects the email; we use it for the download link.
      customer_creation: 'always',
      allow_promotion_codes: true,
      success_url: `${SITE_URL}${SUCCESS_PATH}`,
      cancel_url: `${SITE_URL}${CANCEL_PATH}`,
      metadata: { product: 'rhymr-macos' },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('create-checkout-session:', err.message);
    res.status(500).json({ error: 'Could not start checkout.' });
  }
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`rhymr-checkout listening on :${PORT} (site: ${SITE_URL})`);
  if (!STRIPE_WEBHOOK_SECRET) {
    console.warn('STRIPE_WEBHOOK_SECRET not set — /api/webhook will reject events.');
  }
});
