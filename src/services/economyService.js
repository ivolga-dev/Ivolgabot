import { db } from './db.js';

export const economyService = {
  getBalance(userId) {
    const row = db.prepare('SELECT amount FROM balances WHERE user_id = ?').get(userId);
    return row?.amount ?? 0;
  },

  applyTransaction({ userId, groupId, type, amount, meta }) {
    db.prepare('UPDATE balances SET amount = amount + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?').run(
      amount,
      userId
    );
    db.prepare(
      'INSERT INTO transactions (user_id, group_id, type, amount, meta_json) VALUES (?, ?, ?, ?, ?)'
    ).run(userId, groupId ?? null, type, amount, JSON.stringify(meta ?? {}));
  },

  transfer({ fromUserId, toUserId, amount, groupId }) {
    const trx = db.transaction(() => {
      this.applyTransaction({
        userId: fromUserId,
        groupId,
        type: 'transfer_out',
        amount: -Math.abs(amount),
        meta: { toUserId }
      });
      this.applyTransaction({
        userId: toUserId,
        groupId,
        type: 'transfer_in',
        amount: Math.abs(amount),
        meta: { fromUserId }
      });
    });

    trx();
  }
};
