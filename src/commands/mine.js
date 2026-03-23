import { mineGame } from '../games/mineGame.js';

export const registerMineCommand = (bot) => {
  bot.command('mine', async (ctx) => {
    const stake = Number(ctx.match?.trim() || 0);
    if (!Number.isFinite(stake) || stake <= 0) {
      await ctx.reply('Использование: /mine <ставка>');
      return;
    }

    const session = mineGame.start({
      groupId: ctx.state.group?.id ?? null,
      userId: ctx.state.user.id,
      stake
    });

    const view = mineGame.renderMessage(session);
    await ctx.reply(view.text, { parse_mode: 'Markdown', reply_markup: view.keyboard });
  });

  bot.callbackQuery(/mine:open:([^:]+):(\d+)/, async (ctx) => {
    const [, sessionKey, cellRaw] = ctx.match;
    const session = mineGame.get(sessionKey);

    if (!session || session.user_id !== ctx.state.user.id) {
      await ctx.answerCallbackQuery({ text: 'Это не твоя игра', show_alert: true });
      return;
    }

    const result = mineGame.openCell(sessionKey, Number(cellRaw));
    if (result.error) {
      await ctx.answerCallbackQuery({ text: 'Сессия завершена', show_alert: true });
      return;
    }

    if (result.exploded) {
      const view = mineGame.renderMessage(result.session, { revealAll: true });
      await ctx.editMessageText(`💥 БУМ!\n${view.text}`, {
        parse_mode: 'Markdown',
        reply_markup: view.keyboard
      });
      await ctx.answerCallbackQuery({ text: 'Ты проиграл ставку' });
      return;
    }

    const view = mineGame.renderMessage(result.session);
    await ctx.editMessageText(view.text, { parse_mode: 'Markdown', reply_markup: view.keyboard });
    await ctx.answerCallbackQuery({ text: 'Безопасно ✅' });
  });

  bot.callbackQuery(/mine:cashout:(.+)/, async (ctx) => {
    const [, sessionKey] = ctx.match;
    const session = mineGame.get(sessionKey);

    if (!session || session.user_id !== ctx.state.user.id) {
      await ctx.answerCallbackQuery({ text: 'Это не твоя игра', show_alert: true });
      return;
    }

    const result = mineGame.cashout(sessionKey);
    if (result.error) {
      await ctx.answerCallbackQuery({ text: 'Сессия завершена', show_alert: true });
      return;
    }

    const view = mineGame.renderMessage(result.session, { revealAll: true });
    await ctx.editMessageText(`💰 Забрано: ${result.payout} (x${result.multiplier})\n\n${view.text}`, {
      parse_mode: 'Markdown',
      reply_markup: view.keyboard
    });
    await ctx.answerCallbackQuery({ text: 'Победа!' });
  });
};
