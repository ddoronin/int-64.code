# Invoice PDF Generator (POC)

This branch contains a Proof-of-Concept for generating invoice PDFs using a worker, Redis/Bull queue, storage adapters (local & S3), and an Express API.

Environment variables
- PORT - HTTP server port (default 3000)
- REDIS_URL - Redis connection string (default redis://127.0.0.1:6379)
- PDF_STORAGE_BACKEND - 'local' or 's3' (default 'local')
- PDF_LOCAL_PATH - local path to store pdfs (default ./tmp/pdfs)
- S3_BUCKET - S3 bucket name (if using s3)
- S3_REGION - S3 region (optional)
- AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY - AWS credentials when using S3 (do NOT commit secrets)

How to run locally
1. Install dependencies: npm install
2. Start Redis locally (e.g., docker run -p 6379:6379 redis)
3. Start server: npm run dev
4. Start worker in another terminal: npm run worker

How to run tests
- npm test

Database
- This POC expects an invoices table. For this POC we do not run migrations automatically.
- Add the following columns in your invoices table for tracking PDF generation (example SQL):

-- Add columns to invoices table
ALTER TABLE invoices
  ADD COLUMN pdf_url TEXT,
  ADD COLUMN pdf_generated_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN pdf_generation_error TEXT;

Sample curl commands

# Enqueue PDF generation (POST invoice payload or HTML)
curl -X POST http://localhost:3000/invoices/123/generate-pdf -H "Content-Type: application/json" -d '{"invoice": {"id":"123","date":"2026-02-28","items":[{"description":"Service","amount":100}],"total":100}}'

# Download generated PDF (local backend)
curl http://localhost:3000/invoices/123/pdf --output invoice-123.pdf

Notes
- Do NOT commit secrets. Use environment variables for AWS credentials and other secrets.
- The POC uses Puppeteer; in CI you may need additional flags or a Chromium binary.

Template & sample
- src/templates/invoice.html - HTML/CSS template
- sample-invoice.json - example invoice payload
