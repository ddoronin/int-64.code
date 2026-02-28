import pdfQueue from '../queues/pdfQueue';
import { generatePdfBuffer } from '../services/pdfGenerator';
import { S3Adapter } from '../adapters/storage/s3Adapter';
import { LocalAdapter } from '../adapters/storage/localAdapter';

const storageBackend = process.env.PDF_STORAGE_BACKEND || 'local';
let storage: { upload: (key: string, buf: Buffer, contentType?: string) => Promise<string> };

if (storageBackend === 's3') {
  storage = new S3Adapter({
    bucket: process.env.S3_BUCKET || '',
    region: process.env.S3_REGION || undefined,
  });
} else {
  storage = new LocalAdapter({ basePath: process.env.PDF_LOCAL_PATH || './tmp/pdfs' });
}

pdfQueue.process(async (job: any) => {
  const { invoiceId, payload } = job.data;
  console.log('Processing invoice PDF', invoiceId);

  try {
    const html = payload?.html || ''; // In POC user may pass html; otherwise generator may build from payload
    const buffer = await generatePdfBuffer(html || payload);
    const key = `${invoiceId}.pdf`;
    const url = await storage.upload(key, buffer, 'application/pdf');

    // Persist url in DB or emit event - POC logs
    console.log('PDF generated', { invoiceId, url });

    return { url };
  } catch (err: any) {
    console.error('pdf generation error', err.message || err);
    throw err;
  }
});

console.log('Invoice PDF worker started');

process.on('SIGINT', async () => {
  await pdfQueue.close();
  process.exit(0);
});
