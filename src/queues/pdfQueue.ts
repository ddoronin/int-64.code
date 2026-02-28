import Queue from 'bull';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
export const pdfQueue = new Queue('invoice-pdf-queue', redisUrl);

export async function enqueuePdfGeneration(data: { invoiceId: string; payload?: any }) {
  return pdfQueue.add(data.invoiceId, data, { removeOnComplete: true, attempts: 3, backoff: 5000 });
}

export default pdfQueue;
