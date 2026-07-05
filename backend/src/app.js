/**
 * Express application
 * ------------------------------------------------------------------
 * Assembles the HTTP pipeline:
 *   security middleware → logging → JSON parsing → CORS →
 *   routes → 404 handler → centralized error handler.
 *
 * The app is created here and exported so it can be imported by tests
 * without binding to a port (server.js owns the port binding).
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';

import config from './config/index.js';
import logger from './utils/logger.js';
import router from './routes/index.js';
import notFoundHandler from './middlewares/notFoundHandler.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

/* ----------------------------- Security ----------------------------- */
app.disable('x-powered-by');
app.use(helmet());

/* ------------------------------ CORS -------------------------------- */
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  }),
);

/* --------------------------- Rate limiting -------------------------- */
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: config.isProduction ? 300 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: { message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' },
    },
  }),
);

/* ------------------------ Request parsing --------------------------- */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ------------------------------ Logging ----------------------------- */
app.use(pinoHttp({ logger }));

/* ------------------------------ Routes ------------------------------ */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      service: 'jobhub-api',
      status: 'ok',
      env: config.env,
    },
  });
});

app.use('/api', router);

/* --------------------------- Error handling ------------------------- */
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
