import { economyService } from '../services/economyService.js';

export const registerBalanceCommand = (bot) => {
  bot.command('balance', async (ctx) => {
    const balance = economyService.getBalance(ctx.state.user.id);
    await ctx.reply(`💰 Баланс: *${balance}* монет`, { parse_mode: 'Markdown' });
  });
};
