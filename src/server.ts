import express from 'express';
import invoicesRouter from './routes/invoices';

const app = express();
app.use(express.json());

app.use('/invoices', invoicesRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on ${port}`);
});

export default app;
