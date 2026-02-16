# int-64.code

This repository contains small, production-grade integrations.

## PayPal (Sandbox): Create Draft Invoice (minimal)

Client implementation:
- `src/postman/paypal-apis/invoices/create-draft-invoice/client.js`

Docs:
- `src/postman/paypal-apis/invoices/create-draft-invoice/README.md`

### Quick start

```bash
export PAYPAL_ACCESS_TOKEN='...'
node -e "import('./src/postman/paypal-apis/invoices/create-draft-invoice/client.js').then(async (m)=>{ const inv = await m.createDraftInvoiceMinimal({ baseUrl: 'https://api-m.sandbox.paypal.com', accessToken: process.env.PAYPAL_ACCESS_TOKEN, input: { invoiceDate: '2026-02-16', currencyCode: 'USD' } }); console.log(inv.id, inv.status); })"
```

Notes:
- This creates a `DRAFT` invoice. To make it payable/sent, use the `Send invoice` endpoint.
- No secrets are committed.
