import { config } from './config.js';
import { runSchema } from './services/db.js';
import { createBot } from './bot/createBot.js';
import { createServer } from './web/server.js';

const bootstrap = async () => {
  runSchema();

  const { bot, webhookPath, webhookHandler } = createBot();
  const app = createServer({ webhookPath, webhookHandler });

  await bot.api.setWebhook(`${config.webhookUrl}${webhookPath}`);
  app.listen(config.port, () => {
    console.log(`HTTP server is running on :${config.port}`);
    console.log(`Webhook path: ${webhookPath}`);
  });
};

bootstrap().catch((error) => {
  console.error('Fatal startup error:', error);
  process.exit(1);
});
