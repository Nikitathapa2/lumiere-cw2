import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

async function start() {
  await connectDB();
  const app = createApp();

  app.listen(env.port, '0.0.0.0', () => {
    console.log(`✓ LUMIÈRE API running on http://localhost:${env.port} [${env.nodeEnv}]`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
