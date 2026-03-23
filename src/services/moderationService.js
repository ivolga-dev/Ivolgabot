import { db } from './db.js';
import { toIsoAfterSeconds } from '../utils/time.js';

export const moderationService = {
  async ban(ctx, targetTelegramUserId, actorUserId, durationSeconds, reason) {
    const until = toIsoAfterSeconds(durationSeconds);
    await ctx.api.banChatMember(ctx.chat.id, targetTelegramUserId, {
      until_date: durationSeconds ? Math.floor(Date.now() / 1000) + durationSeconds : undefined
    });

    db.prepare(
      'INSERT INTO moderation_actions (group_id, target_user_id, actor_user_id, action_type, reason, until_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(ctx.state.group.id, targetTelegramUserId, actorUserId, 'ban', reason ?? null, until);
  }
};
