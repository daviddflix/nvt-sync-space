import express from 'express';
import projectRoutes from './contexts/project/presentation/projectRoutes';

const app = express();

app.use(express.json());

app.use('/v1', projectRoutes);

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
