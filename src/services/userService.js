import { db } from './db.js';

export const userService = {
  ensureTelegramUser(telegramUser) {
    const existing = db
      .prepare('SELECT * FROM users WHERE telegram_user_id = ?')
      .get(telegramUser.id);

    if (existing) return existing;

    const info = db
      .prepare(
        'INSERT INTO users (telegram_user_id, username, first_name) VALUES (?, ?, ?) RETURNING *'
      )
      .get(telegramUser.id, telegramUser.username ?? null, telegramUser.first_name ?? null);

    db.prepare('INSERT INTO balances (user_id, amount) VALUES (?, 1000)').run(info.id);
    return info;
  }
};
