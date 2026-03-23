import crypto from 'node:crypto';
import { InlineKeyboard } from 'grammy';
import { db } from '../services/db.js';
import { economyService } from '../services/economyService.js';
import { gameStatsService } from '../services/gameStatsService.js';

const GRID_SIZE = 16;

const multiplierForStep = (step, mineCount) => {
  const risk = 1 + mineCount / 10;
  return Number((1 + step * 0.22 * risk).toFixed(2));
};

const buildKeyboard = (session, revealAll = false) => {
  const mines = new Set(JSON.parse(session.mines_json));
  const opened = new Set(JSON.parse(session.opened_json));
  const keyboard = new InlineKeyboard();

  for (let i = 0; i < GRID_SIZE; i += 1) {
    const isMine = mines.has(i);
    const isOpened = opened.has(i);
    const text = revealAll
      ? isMine
        ? '💣'
        : isOpened
          ? '✅'
          : '▫️'
      : isOpened
        ? '✅'
        : '❓';

    keyboard.text(text, `mine:open:${session.session_key}:${i}`);
    if ((i + 1) % 4 === 0) keyboard.row();
  }

  if (!revealAll) keyboard.text('💰 Забрать', `mine:cashout:${session.session_key}`);
  return keyboard;
};

export const mineGame = {
  start({ groupId, userId, stake }) {
    economyService.applyTransaction({
      userId,
      groupId,
      type: 'game:mine:stake',
      amount: -Math.abs(stake),
      meta: { stake }
    });

    const mineCount = 2 + Math.floor(Math.random() * 3);
    const mines = new Set();
    while (mines.size < mineCount) mines.add(Math.floor(Math.random() * GRID_SIZE));

    const sessionKey = crypto.randomUUID();
    db.prepare(
      'INSERT INTO mine_sessions (session_key, group_id, user_id, stake, mines_json, opened_json) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(sessionKey, groupId ?? null, userId, stake, JSON.stringify([...mines]), JSON.stringify([]));

    return this.get(sessionKey);
  },

  get(sessionKey) {
    return db.prepare('SELECT * FROM mine_sessions WHERE session_key = ?').get(sessionKey);
  },

  openCell(sessionKey, cell) {
    const session = this.get(sessionKey);
    if (!session || session.status !== 'active') return { error: 'inactive' };

    const mines = new Set(JSON.parse(session.mines_json));
    const opened = new Set(JSON.parse(session.opened_json));
    if (opened.has(cell)) return { session, alreadyOpened: true };

    if (mines.has(cell)) {
      db.prepare('UPDATE mine_sessions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
        'lost',
        session.id
      );
      gameStatsService.record({
        groupId: session.group_id,
        userId: session.user_id,
        gameKey: 'mine',
        profit: -session.stake,
        win: false
      });
      return { session: this.get(sessionKey), exploded: true };
    }

    opened.add(cell);
    const safeSteps = opened.size;
    db.prepare(
      'UPDATE mine_sessions SET opened_json = ?, safe_steps = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(JSON.stringify([...opened]), safeSteps, session.id);

    return { session: this.get(sessionKey), exploded: false };
  },

  cashout(sessionKey) {
    const session = this.get(sessionKey);
    if (!session || session.status !== 'active') return { error: 'inactive' };

    const mineCount = JSON.parse(session.mines_json).length;
    const multiplier = multiplierForStep(session.safe_steps, mineCount);
    const payout = Math.round(session.stake * multiplier);

    db.prepare('UPDATE mine_sessions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
      'cashed_out',
      session.id
    );

    economyService.applyTransaction({
      userId: session.user_id,
      groupId: session.group_id,
      type: 'game:mine:payout',
      amount: payout,
      meta: { sessionKey, multiplier }
    });

    gameStatsService.record({
      groupId: session.group_id,
      userId: session.user_id,
      gameKey: 'mine',
      profit: payout - session.stake,
      win: true
    });

    return { session: this.get(sessionKey), payout, multiplier };
  },

  renderMessage(session, { revealAll = false } = {}) {
    const mineCount = JSON.parse(session.mines_json).length;
    const mul = multiplierForStep(session.safe_steps, mineCount);
    const text = [
      '💣 *MINE 4x4*',
      `Ставка: *${session.stake}*`,
      `Шагов: *${session.safe_steps}*`,
      `Текущий множитель: *x${mul}*`,
      `Мин на поле: *${mineCount}*`
    ].join('\n');

    return { text, keyboard: buildKeyboard(session, revealAll) };
  }
};
