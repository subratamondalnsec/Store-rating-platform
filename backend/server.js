const { PORT, NODE_ENV } = require('./src/config/env');
const app = require('./src/app');
const prisma = require('./src/config/db');

const server = app.listen(PORT, () => {
  console.log(`======================================================`);
  console.log(`  Store Rating Platform API Server`);
  console.log(`  Environment: ${NODE_ENV}`);
  console.log(`  Port:        ${PORT}`);
  console.log(`  Health:      http://localhost:${PORT}/api/health`);
  console.log(`======================================================`);
});

// Handle graceful shutdown
const shutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Gracefully shutting down...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log('Database connection closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error disconnecting database:', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});
