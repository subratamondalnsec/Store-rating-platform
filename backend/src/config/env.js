const dotenv = require('dotenv');
const path = require('path');

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredEnvVars = [
  'DATABASE_URL',
  'DIRECT_URL',
  'JWT_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(varName => {
  const val = process.env[varName];
  return !val || val.includes('YOUR_NEON') || val.includes('YOUR_PASSWORD');
});

if (missingEnvVars.length > 0) {
  console.error('\n======================================================');
  console.error('FATAL CONFIGURATION ERROR: Missing or unconfigured environment variable(s):');
  missingEnvVars.forEach(v => console.error(`  - ${v}`));
  console.error('\nPlease populate your Neon PostgreSQL connection strings in backend/.env:');
  console.error('  DATABASE_URL="postgresql://user:pass@ep-pooler.neon.tech/neondb?sslmode=require"');
  console.error('  DIRECT_URL="postgresql://user:pass@ep-direct.neon.tech/neondb?sslmode=require"');
  console.error('======================================================\n');
  process.exit(1);
}

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  ADMIN_NAME: process.env.ADMIN_NAME || 'System Administrator Account',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@storerating.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@123456',
  ADMIN_ADDRESS: process.env.ADMIN_ADDRESS || '100 Headquarters Boulevard, Suite 400, New York, NY 10001'
};
