import express, { Request, Response } from 'express';
import { enqueuePdfGeneration } from '../queues/pdfQueue';
import path from 'path';
import fs from 'fs/promises';

const router = express.Router();

// POST /invoices/:id/generate-pdf - enqueue PDF generation
router.post('/:id/generate-pdf', async (req: Request, res: Response) => {
  const invoiceId = req.params.id;
  if (!invoiceId) {
    return res.status(400).json({ error: 'invoice id required' });
  }

  try {
    const job = await enqueuePdfGeneration({ invoiceId, payload: req.body });
    return res.status(202).json({ jobId: job.id });
  } catch (err: any) {
    console.error('enqueue error', err);
    return res.status(500).json({ error: 'failed to enqueue PDF generation' });
  }
});

// GET /invoices/:id/pdf - download generated PDF
router.get('/:id/pdf', async (req: Request, res: Response) => {
  const invoiceId = req.params.id;
  if (!invoiceId) return res.status(400).json({ error: 'invoice id required' });

  // For the POC, support local storage download via env var
  const storageBackend = process.env.PDF_STORAGE_BACKEND || 'local';

  try {
    if (storageBackend === 'local') {
      const base = process.env.PDF_LOCAL_PATH || './tmp/pdfs';
      const filePath = path.join(base, `${invoiceId}.pdf`);
      try {
        const stat = await fs.stat(filePath);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Length', stat.size);
        const readStream = await fs.readFile(filePath);
        return res.send(readStream);
      } catch (e) {
        return res.status(404).json({ error: 'pdf not found' });
      }
    }

    // For S3, redirect to signed URL or proxy (not implemented in POC)
    return res.status(501).json({ error: 'S3 download not implemented in POC' });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: 'failed to fetch pdf' });
  }
});

export default router;
