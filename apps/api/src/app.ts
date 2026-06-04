import express from 'express';
import cors from 'cors';
import 'express-async-errors';

import { errorHandler } from './middleware/errorHandler.js';
import { eventsRouter } from './routes/events.js';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { pushRouter } from './routes/push.js';
import { uploadRouter, UPLOADS_DIR } from './routes/upload.js';

// Allowed CORS origins are configurable so the deployed backoffice domain
// can be added in production via CORS_ORIGINS (comma-separated).
const DEFAULT_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://localhost:8081',
  'http://127.0.0.1:8081',
];
const allowedOrigins = (process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
  : DEFAULT_ORIGINS);

export const app = express();

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/events', eventsRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/push', pushRouter);
app.use('/api/upload', uploadRouter);

// Local-only static serving of disk uploads. In production images live in
// Vercel Blob (absolute URLs), so this route is harmless/no-op there.
app.use(
  '/uploads',
  express.static(UPLOADS_DIR, {
    setHeaders: (res) => res.setHeader('Access-Control-Allow-Origin', '*'),
  })
);

app.use(errorHandler);

export default app;
