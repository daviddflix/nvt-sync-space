import express from 'express';
import authRoutes from './contexts/auth/presentation/routes';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { requestLogger } from './shared/middleware/logger';
import { logger } from './shared/logger';

const app = express();
app.use(express.json());
app.use(requestLogger);
const swaggerSpec = swaggerJsdoc({
  definition: { openapi: '3.0.0', info: { title: 'API', version: '1.0.0' } },
  apis: ['./src/contexts/**/*.ts'],
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/auth', authRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default app;

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
  });
}
