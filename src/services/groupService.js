import { db } from './db.js';

export const groupService = {
  ensureGroup(chat) {
    if (chat.type === 'private') return null;

    const existing = db.prepare('SELECT * FROM groups WHERE telegram_chat_id = ?').get(chat.id);
    if (existing) return existing;

    return db
      .prepare('INSERT INTO groups (telegram_chat_id, title) VALUES (?, ?) RETURNING *')
      .get(chat.id, chat.title ?? null);
  },

  byChatId(chatId) {
    return db.prepare('SELECT * FROM groups WHERE telegram_chat_id = ?').get(chatId);
  },

  updateCooldown(chatId, seconds) {
    return db
      .prepare('UPDATE groups SET command_cooldown_seconds = ? WHERE telegram_chat_id = ?')
      .run(seconds, chatId);
  }
};
