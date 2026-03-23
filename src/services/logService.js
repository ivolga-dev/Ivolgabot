import { db } from './db.js';

export const logService = {
  command({ updateId, chatId, userId, command, status, message }) {
    db.prepare(
      'INSERT INTO command_logs (telegram_update_id, telegram_chat_id, telegram_user_id, command, status, message) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(updateId ?? null, chatId ?? null, userId ?? null, command ?? null, status, message ?? null);
  },

  suspicious({ groupId, userId, eventType, payload }) {
    db.prepare(
      'INSERT INTO suspicious_events (group_id, user_id, event_type, payload_json) VALUES (?, ?, ?, ?)'
    ).run(groupId ?? null, userId ?? null, eventType, JSON.stringify(payload ?? {}));
  }
};
