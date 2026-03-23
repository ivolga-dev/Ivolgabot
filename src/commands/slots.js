import { slotsGame, slotsPayoutTable } from '../games/slotsGame.js';

export const registerSlotsCommand = (bot) => {
  bot.command('slots', async (ctx) => {
    const stake = Number(ctx.match?.trim() || 0);
    if (!Number.isFinite(stake) || stake <= 0) {
      const payouts = Object.entries(slotsPayoutTable)
        .map(([combo, mul]) => `${combo} → x${mul}`)
        .join('\n');
      await ctx.reply(`Использование: /slots <ставка>\n\nТаблица выплат:\n${payouts}`);
      return;
    }

    const result = slotsGame.play({
      groupId: ctx.state.group?.id ?? null,
      userId: ctx.state.user.id,
      stake,
      payload: {}
    });

    await ctx.reply(
      [`${result.render}`, `${result.details}`, `💸 Ставка: ${stake}`, `🏆 Выплата: ${result.payout}`].join('\n')
    );
  });
};
