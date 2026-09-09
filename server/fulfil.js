/**
 * Hand the build over to a paid customer.
 *
 * Called once per successful `checkout.session.completed`. Stripe retries on a
 * thrown error, so this must be safe to run more than once for the same
 * session (idempotent) once you wire real delivery.
 *
 * Right now it just logs the sale. When there's a macOS build to ship, do one
 * of:
 *   - email the buyer a time-limited signed URL (S3/R2/Bunny) to the .dmg
 *   - create a single-use download token row and email a link to it
 * using `session.customer_details.email` and `process.env.DOWNLOAD_URL`.
 */

export async function fulfil(session) {
  const email = session.customer_details?.email ?? 'unknown';
  const paid = (session.amount_total ?? 0) / 100;
  const currency = (session.currency ?? 'usd').toUpperCase();

  console.log(
    `[sale] ${session.id} — ${email} paid ${currency} ${paid.toFixed(2)} for rhymr-macos`,
  );

  const downloadUrl = process.env.DOWNLOAD_URL;
  if (!downloadUrl) {
    console.log('[sale] DOWNLOAD_URL not set — nothing delivered yet. Sale recorded above.');
    return;
  }

  // TODO: send `downloadUrl` (ideally a freshly-signed, short-lived URL) to
  // `email`. Plug in your mailer of choice here (Resend, Postmark, SES…).
  console.log(`[sale] would email ${email} -> ${downloadUrl}`);
}
