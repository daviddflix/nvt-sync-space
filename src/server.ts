import express from 'express';
import { authenticate } from './shared/middleware/auth';
import { validate } from './shared/middleware/validate';
import { z } from 'zod';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/protected', authenticate, (req, res) => {
  res.json({ userId: req.user?.id });
});

const echoSchema = z.object({
  message: z.string(),
});

app.post('/echo', validate(echoSchema), (req, res) => {
  res.json({ message: req.body.message });
});

export default app;

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`); // eslint-disable-line no-console
  });
}
