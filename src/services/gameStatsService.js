import { db } from './db.js';

export const gameStatsService = {
  ensure(groupId, userId, gameKey) {
    db.prepare(
      'INSERT INTO game_stats (group_id, user_id, game_key) VALUES (?, ?, ?) ON CONFLICT(group_id, user_id, game_key) DO NOTHING'
    ).run(groupId ?? null, userId, gameKey);

    return db
      .prepare('SELECT * FROM game_stats WHERE group_id IS ? AND user_id = ? AND game_key = ?')
      .get(groupId ?? null, userId, gameKey);
  },

  record({ groupId, userId, gameKey, profit, win }) {
    const row = this.ensure(groupId, userId, gameKey);
    const wins = row.wins + (win ? 1 : 0);
    const losses = row.losses + (win ? 0 : 1);
    const winStreak = win ? row.win_streak + 1 : 0;
    const loseStreak = win ? 0 : row.lose_streak + 1;
    const biasDelta = win ? 0.025 : -0.02;
    const adjustedWinBias = Math.max(-0.15, Math.min(0.15, row.adjusted_win_bias + biasDelta));

    db.prepare(
      `UPDATE game_stats
       SET games_played = games_played + 1,
           wins = ?,
           losses = ?,
           total_profit = total_profit + ?,
           max_win = CASE WHEN ? > max_win THEN ? ELSE max_win END,
           win_streak = ?,
           lose_streak = ?,
           adjusted_win_bias = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).run(wins, losses, profit, profit, profit, winStreak, loseStreak, adjustedWinBias, row.id);

    return db.prepare('SELECT * FROM game_stats WHERE id = ?').get(row.id);
  }
};
