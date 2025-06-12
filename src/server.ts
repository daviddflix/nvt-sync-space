import express from 'express';
import authRoutes from './contexts/auth/presentation/routes';

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default app;

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`); // eslint-disable-line no-console
  });
}
