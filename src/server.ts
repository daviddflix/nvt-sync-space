import express from 'express';
import authRoutes from './contexts/auth/presentation/routes';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { requestLogger } from './shared/middleware/logger';
import { logger } from './shared/logger';
import config from './config';

const app = express();
app.use(express.json());
app.use(requestLogger);
const swaggerSpec = swaggerJsdoc({
  definition: { 
    openapi: '3.0.0', 
    info: { 
      title: 'NVT Sync API', 
      version: '1.0.0',
      description: 'API documentation for NVT Sync Service'
    } 
  },
  apis: ['./src/contexts/**/*.ts'],
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/auth', authRoutes);

app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok',
    environment: config.server.env
  });
});

export default app;

if (require.main === module) {
  app.listen(config.server.port, () => {
    console.log(`Server running on port ${config.server.port} in ${config.server.env} mode`); // eslint-disable-line no-console
  });
}
