import { parseDurationToSeconds } from '../utils/time.js';
import { moderationService } from '../services/moderationService.js';

export const registerBanCommand = (bot, { requirePermission, ensureBotAdmin }) => {
  bot.command('ban', ensureBotAdmin, requirePermission('moderation.ban'), async (ctx) => {
    if (!ctx.chat || ctx.chat.type === 'private') {
      await ctx.reply('Команда доступна только в группе.');
      return;
    }

    const args = ctx.match?.trim().split(/\s+/).filter(Boolean) ?? [];
    if (!ctx.message?.reply_to_message?.from) {
      await ctx.reply('Используй /ban в ответ на сообщение пользователя.');
      return;
    }

    const duration = parseDurationToSeconds(args[0]);
    const reason = args.slice(duration ? 1 : 0).join(' ') || 'Без причины';
    const target = ctx.message.reply_to_message.from;

    await moderationService.ban(ctx, target.id, ctx.state.user.id, duration, reason);

    await ctx.reply(
      `🔨 ${target.first_name} забанен ${duration ? `на ${args[0]}` : 'навсегда'}\nПричина: ${reason}`
    );
  });
};
