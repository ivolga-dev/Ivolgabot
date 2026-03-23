import { roleService } from '../../services/roleService.js';
import { config } from '../../config.js';

export const requirePermission = (permission) => async (ctx, next) => {
  if (!ctx.state.group) return next();

  const isGlobal = config.globalAdminIds.includes(ctx.from.id);
  if (isGlobal) return next();

  const member = await ctx.api.getChatMember(ctx.chat.id, ctx.from.id);
  const isTgAdmin = ['administrator', 'creator'].includes(member.status);

  const hasRole = roleService.hasPermission(ctx.state.group.id, ctx.state.user.id, permission);
  if (!isTgAdmin && !hasRole) {
    await ctx.reply('🚫 Недостаточно прав для этой команды.');
    return;
  }
  return next();
};

export const ensureBotAdmin = async (ctx, next) => {
  if (!ctx.state.group) return next();
  const me = await ctx.api.getMe();
  const member = await ctx.api.getChatMember(ctx.chat.id, me.id);
  if (!['administrator', 'creator'].includes(member.status)) {
    await ctx.reply('⚠️ Для работы модерации выдай мне права администратора.');
    return;
  }
  return next();
};
