import { diceGame } from '../games/diceGame.js';

export const registerDiceCommand = (bot) => {
  bot.command('dice', async (ctx) => {
    const args = ctx.match?.trim().split(/\s+/).filter(Boolean) ?? [];
    const [modeRaw, targetRaw, stakeRaw] = args;

    const stake = Number(stakeRaw ?? targetRaw ?? modeRaw);
    let mode = 'exact';
    let value = 1;

    if (['over', 'under', 'exact'].includes(modeRaw)) {
      mode = modeRaw;
      value = Number(targetRaw);
    } else {
      value = Number(modeRaw);
    }

    if (!Number.isFinite(stake) || stake <= 0 || !Number.isFinite(value) || value < 1 || value > 6) {
      await ctx.reply('Использование: /dice exact 3 100 | /dice over 3 100 | /dice 4 100');
      return;
    }

    const result = diceGame.play({
      groupId: ctx.state.group?.id ?? null,
      userId: ctx.state.user.id,
      stake,
      payload: { mode, value }
    });

    await ctx.reply(
      [
        `${result.render}`,
        `🎯 ${result.details}`,
        `💸 Ставка: ${stake}`,
        `🏆 Выплата: ${result.payout}`,
        `📊 Шанс(win): ${(result.dynamicWinChance * 100).toFixed(1)}%`
      ].join('\n'),
      { parse_mode: 'Markdown' }
    );
  });
};
