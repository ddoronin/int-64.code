import puppeteer from 'puppeteer';

/**
 * Generate a PDF buffer from HTML or invoice payload.
 * For the POC, if html is provided as a string, render it; otherwise use a simple template.
 */
export async function generatePdfBuffer(htmlOrPayload: any): Promise<Buffer> {
  const html = typeof htmlOrPayload === 'string' ? htmlOrPayload : buildHtmlFromPayload(htmlOrPayload);
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const buf = await page.pdf({ format: 'A4', printBackground: true });
    return buf;
  } finally {
    await browser.close();
  }
}

function buildHtmlFromPayload(payload: any) {
  // Minimal template for POC
  const invoice = payload?.invoice || {};
  const html = `<!doctype html>
  <html>
  <head>
  <meta charset="utf-8" />
  <title>Invoice</title>
  <style>body{font-family: Arial, sans-serif; padding: 20px;} .total{font-weight:bold}</style>
  </head>
  <body>
  <h1>Invoice ${invoice.id || ''}</h1>
  <p>Date: ${invoice.date || ''}</p>
  <div>${invoice.items ? invoice.items.map((i: any) => `<div>${i.description} - $${i.amount}</div>`).join('') : ''}</div>
  <div class="total">Total: $${invoice.total || ''}</div>
  </body>
  </html>`;
  return html;
}

export default generatePdfBuffer;
