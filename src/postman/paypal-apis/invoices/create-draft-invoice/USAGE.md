# Create a PayPal draft invoice

This project already contains a generated Node.js client for the **PayPal Invoicing – Create draft invoice** endpoint.

Client implementation: `src/postman/paypal-apis/invoices/create-draft-invoice/client.js`

```js
import { createDraftInvoiceMinimal } from './src/postman/paypal-apis/invoices/create-draft-invoice/client.js';

async function main() {
  const baseUrl = process.env.PAYPAL_BASE_URL ?? 'https://api-m.sandbox.paypal.com';
  const accessToken = process.env.PAYPAL_ACCESS_TOKEN; // obtain via PayPal OAuth2 client_credentials

  const invoice = await createDraftInvoiceMinimal({
    baseUrl,
    accessToken,
    input: {
      invoiceDate: '2018-11-12',
      currencyCode: 'USD',
    },
    // Optional idempotency key (PayPal-Request-Id). If omitted, a UUID is generated.
    // payPalRequestId: 'your-unique-key',
    // prefer: 'return=minimal', // default: 'return=representation'
  });

  console.log('Created draft invoice', invoice.id, 'status:', invoice.status);
}

main().catch((err) => {
  console.error('Error creating invoice:', err);
  process.exitCode = 1;
});
```

## Steps

1. Create a REST app in the [PayPal Developer Dashboard](https://developer.paypal.com/).
2. Use `client_id` and `client_secret` to obtain an OAuth2 access token with the `client_credentials` grant against `https://api-m.sandbox.paypal.com/v1/oauth2/token`.
3. Export the token as `PAYPAL_ACCESS_TOKEN` (and optionally override `PAYPAL_BASE_URL`).
4. Call `createDraftInvoiceMinimal` as shown above.

The helper will throw with a detailed error that includes the `PayPal-Debug-Id` header when available.