require('dotenv').config();
const express = require('express');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();

// Initialize Express app
const app = express();
app.use(express.json()); // For parsing application/json

// Configure SQLite database (in-memory by default)
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS invoices (
    invoice_id TEXT PRIMARY KEY,
    status TEXT,
    payload TEXT
  )`);
});

// PayPal configuration from environment variables
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  throw new Error('Missing PayPal API credentials. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET as env vars.');
}

/**
 * Get PayPal OAuth2 access token
 */
async function getPayPalAccessToken() {
  const res = await axios.post(
    `${PAYPAL_API_BASE}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      auth: {
        username: PAYPAL_CLIENT_ID,
        password: PAYPAL_CLIENT_SECRET
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }
  );
  return res.data.access_token;
}

/**
 * Format invoice payload for PayPal Invoicing API
 */
function formatInvoicePayload({ recipientEmail, amount, description, metadata }) {
  const payload = {
    detail: {
      invoice_number: `INV-${Date.now()}`,
      note: description || '',
      metadata: metadata && typeof metadata === 'object' ? metadata : undefined
    },
    invoicer: {
      email_address: 'merchant@example.com' // Hardcoded for PoC, change as needed
    },
    primary_recipients: [
      {
        billing_info: {
          email_address: recipientEmail
        }
      }
    ],
    items: [
      {
        name: 'Service',
        description: description || 'Invoice Item',
        quantity: '1',
        unit_amount: {
          currency_code: 'USD',
          value: amount ? String(amount) : '0.00'
        }
      }
    ]
  };
  // Remove undefined keys
  if (!payload.detail.metadata) delete payload.detail.metadata;
  return payload;
}

/**
 * POST /invoices/create
 * Creates and sends a PayPal invoice, saves record to DB
 */
app.post('/invoices/create', async (req, res) => {
  const { recipientEmail, amount, description, metadata } = req.body;
  if (!recipientEmail || !amount) {
    return res.status(400).json({ error: 'recipientEmail and amount are required' });
  }

  try {
    // Step 1: Get access token
    const accessToken = await getPayPalAccessToken();
    // Step 2: Prepare invoice payload
    const invoicePayload = formatInvoicePayload({ recipientEmail, amount, description, metadata });
    // Step 3: Create invoice
    const createRes = await axios.post(
      `${PAYPAL_API_BASE}/v2/invoicing/invoices`,
      invoicePayload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const invoiceId = createRes.data.id;
    // Step 4: Send invoice
    await axios.post(
      `${PAYPAL_API_BASE}/v2/invoicing/invoices/${invoiceId}/send`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    // Step 5: Save to DB
    db.run(
      `INSERT INTO invoices (invoice_id, status, payload) VALUES (?, ?, ?)` +
        ` ON CONFLICT(invoice_id) DO UPDATE SET status=excluded.status, payload=excluded.payload`,
      [invoiceId, 'SENT', JSON.stringify(invoicePayload)],
      (err) => {
        if (err) {
          console.error('DB error:', err);
        }
      }
    );

    // Step 6: Respond with ID and status
    res.json({
      invoiceId: invoiceId,
      status: 'SENT'
    });
  } catch (err) {
    // Pass PayPal/DB errors forward
    const status = err.response?.status || 500;
    const message = err.response?.data || err.message;
    res.status(status).json({ error: message });
  }
});

// Express app listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`PayPal invoicing API PoC listening on port ${PORT}`);
});
