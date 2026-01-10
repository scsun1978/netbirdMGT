import { registerAs } from '@nestjs/config';

export default registerAs('netbird', () => ({
  baseUrl: process.env.NETBIRD_BASE_URL || 'https://netbird.scsun.qzz.io',
  apiBase: process.env.NETBIRD_API_BASE || 'https://netbird.scsun.qzz.io/api',
  apiToken: process.env.NETBIRD_API_TOKEN || '',
  authType: process.env.NETBIRD_AUTH_TYPE || 'token',
  mode: process.env.NETBIRD_MODE || 'real',
  timeout: parseInt(process.env.NETBIRD_API_TIMEOUT || '10000', 10),
  retryAttempts: parseInt(process.env.NETBIRD_RETRY_ATTEMPTS || '3', 10),
  retryDelay: parseInt(process.env.NETBIRD_RETRY_DELAY || '1000', 10),
}));