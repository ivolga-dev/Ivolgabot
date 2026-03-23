const userCooldownMap = new Map();

export const cooldownMiddleware = async (ctx, next) => {
  const text = ctx.message?.text;
  if (!text?.startsWith('/')) return next();

  const key = `${ctx.chat?.id ?? 'pm'}:${ctx.from?.id}`;
  const cooldownSeconds = ctx.state.group?.command_cooldown_seconds ?? 3;
  const now = Date.now();
  const previous = userCooldownMap.get(key) ?? 0;
  const diff = now - previous;

  if (diff < cooldownSeconds * 1000) {
    const wait = ((cooldownSeconds * 1000 - diff) / 1000).toFixed(1);
    await ctx.reply(`⏱ Подожди ${wait} сек. перед следующей командой.`);
    return;
  }

  userCooldownMap.set(key, now);
  return next();
};
