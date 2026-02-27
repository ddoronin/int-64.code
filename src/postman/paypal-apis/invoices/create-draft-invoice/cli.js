#!/usr/bin/env node

/**
 * Simple CLI wrapper to create a PayPal draft invoice using createDraftInvoiceMinimal.
 *
 * Usage:
 *   PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com \
 *   PAYPAL_ACCESS_TOKEN=... \
 *   node src/postman/paypal-apis/invoices/create-draft-invoice/cli.js 2025-12-31 USD
 */

import { createDraftInvoiceMinimal } from './client.js';

async function main() {
  const [invoiceDate, currencyCode] = process.argv.slice(2);

  if (!invoiceDate || !currencyCode) {
    console.error('Usage: node cli.js <invoiceDate:YYYY-MM-DD> <currencyCode>');
    process.exitCode = 1;
    return;
  }

  const baseUrl = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';
  const accessToken = process.env.PAYPAL_ACCESS_TOKEN;

  if (!accessToken) {
    console.error('PAYPAL_ACCESS_TOKEN env var is required');
    process.exitCode = 1;
    return;
  }

  try {
    const invoice = await createDraftInvoiceMinimal({
      baseUrl,
      accessToken,
      input: {
        invoiceDate,
        currencyCode,
      },
    });

    console.log(JSON.stringify(invoice, null, 2));
  } catch (err) {
    console.error('Failed to create PayPal draft invoice');
    console.error(err.message);
    if (err.cause) {
      console.error(typeof err.cause === 'string' ? err.cause : JSON.stringify(err.cause, null, 2));
    }
    process.exitCode = 1;
  }
}

main();
