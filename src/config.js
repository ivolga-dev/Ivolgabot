import dotenv from 'dotenv';

dotenv.config();

const must = (value, key) => {
  if (!value) throw new Error(`Missing required env: ${key}`);
  return value;
};

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'production',
  port: Number(process.env.PORT ?? 3000),
  botToken: must(process.env.BOT_TOKEN, 'BOT_TOKEN'),
  webhookUrl: must(process.env.WEBHOOK_URL, 'WEBHOOK_URL'),
  webhookSecret: process.env.WEBHOOK_SECRET ?? 'webhook',
  dbPath: process.env.DB_PATH ?? './data/bot.db',
  globalAdminIds: (process.env.GLOBAL_ADMIN_USER_IDS ?? '')
    .split(',')
    .map((item) => Number(item.trim()))
    .filter(Boolean),
  adminPanelLogin: process.env.ADMIN_PANEL_LOGIN ?? 'admin',
  adminPanelPassword: must(process.env.ADMIN_PANEL_PASSWORD, 'ADMIN_PANEL_PASSWORD')
};
