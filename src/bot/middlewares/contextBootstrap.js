import { userService } from '../../services/userService.js';
import { groupService } from '../../services/groupService.js';
import { roleService } from '../../services/roleService.js';

export const contextBootstrap = async (ctx, next) => {
  if (!ctx.from) return next();
  const user = userService.ensureTelegramUser(ctx.from);
  const group = ctx.chat ? groupService.ensureGroup(ctx.chat) : null;

  if (group) roleService.ensureDefaultRoles(group.id);

  ctx.state.user = user;
  ctx.state.group = group;
  return next();
};
