import express from 'express';
import organizationRouter from './contexts/organization/presentation/router';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/organizations', organizationRouter);

export default app;

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`); // eslint-disable-line no-console
  });
}
