import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import contactsRouter from './routers/contacts.js';
import authRouter from './routers/auth.js';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import yaml from 'js-yaml';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';

export function setupServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.get('/', (req, res) => {
    res.send('API is running!');
  });

  app.use('/contacts', contactsRouter);
  app.use('/auth', authRouter);

  const swaggerDocument = yaml.load(
    fs.readFileSync('./docs/openapi.yaml', 'utf8'),
  );
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.use(notFoundHandler);
  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
  });
}
