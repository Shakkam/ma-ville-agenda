import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import { config } from 'dotenv';

config();

import { prisma } from './db/prisma.js';
import { errorHandler } from './middleware/errorHandler.js';
import { eventsRouter } from './routes/events.js';
import { authRouter } from './routes/auth.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3000');

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/events', eventsRouter);
app.use('/api/auth', authRouter);

app.use(errorHandler);

const start = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`🚀 API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

start();
