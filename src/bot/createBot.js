import { Bot, webhookCallback } from 'grammy';
import { config } from '../config.js';
import { contextBootstrap } from './middlewares/contextBootstrap.js';
import { loggingMiddleware } from './middlewares/loggingMiddleware.js';
import { cooldownMiddleware } from './middlewares/cooldownMiddleware.js';
import { ensureBotAdmin, requirePermission } from './middlewares/permissionMiddleware.js';
import { registerCommands } from '../commands/index.js';

export const createBot = () => {
  const bot = new Bot(config.botToken);

  bot.use(contextBootstrap);
  bot.use(loggingMiddleware);
  bot.use(cooldownMiddleware);

  registerCommands(bot, { requirePermission, ensureBotAdmin });

  bot.catch((err) => {
    console.error('Bot error:', err.error);
  });

  const webhookPath = `/${config.webhookSecret}`;
  return {
    bot,
    webhookPath,
    webhookHandler: webhookCallback(bot, 'express')
  };
};
