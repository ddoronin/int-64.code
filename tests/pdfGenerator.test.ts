import { generatePdfBuffer } from '../src/services/pdfGenerator';

jest.setTimeout(20000);

test('generatePdfBuffer returns a PDF buffer from html string', async () => {
  const html = '<html><body><h1>Test</h1></body></html>';
  const buf = await generatePdfBuffer(html);
  expect(buf).toBeDefined();
  expect(Buffer.isBuffer(buf)).toBe(true);
  expect(buf.length).toBeGreaterThan(100);
});
