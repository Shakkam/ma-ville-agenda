import { config } from 'dotenv';

config();

import { prisma } from './db/prisma.js';
import app from './app.js';

const PORT = parseInt(process.env.PORT || '3000');

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
