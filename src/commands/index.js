import { registerBanCommand } from './ban.js';
import { registerBalanceCommand } from './balance.js';
import { registerDiceCommand } from './dice.js';
import { registerSlotsCommand } from './slots.js';
import { registerMineCommand } from './mine.js';

export const registerCommands = (bot, deps) => {
  registerBalanceCommand(bot);
  registerBanCommand(bot, deps);
  registerDiceCommand(bot);
  registerSlotsCommand(bot);
  registerMineCommand(bot);

  bot.command('start', async (ctx) => {
    await ctx.reply('🤖 Бот запущен. Доступно: /balance /dice /slots /mine /ban');
  });
};
