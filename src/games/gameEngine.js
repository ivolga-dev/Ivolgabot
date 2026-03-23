import crypto from 'node:crypto';
import { economyService } from '../services/economyService.js';
import { chanceService } from '../services/chanceService.js';
import { gameStatsService } from '../services/gameStatsService.js';

export class GameEngine {
  constructor({ gameKey, resolver }) {
    this.gameKey = gameKey;
    this.resolver = resolver;
  }

  play({ groupId, userId, stake, payload }) {
    economyService.applyTransaction({
      userId,
      groupId,
      type: `game:${this.gameKey}:stake`,
      amount: -Math.abs(stake),
      meta: payload
    });

    const dynamicWinChance = chanceService.adjustedProbability({
      groupId,
      userId,
      gameKey: this.gameKey,
      baseWinProbability: this.resolver.baseWinProbability(payload)
    });

    const seed = crypto.randomInt(1, 1_000_000);
    const result = this.resolver.resolve({ payload, dynamicWinChance, seed });
    const payout = Math.round(stake * result.multiplier);
    const profit = payout;

    if (payout > 0) {
      economyService.applyTransaction({
        userId,
        groupId,
        type: `game:${this.gameKey}:payout`,
        amount: payout,
        meta: { ...payload, seed, multiplier: result.multiplier }
      });
    }

    gameStatsService.record({
      groupId,
      userId,
      gameKey: this.gameKey,
      profit: profit - stake,
      win: payout > 0
    });

    return { ...result, payout, profit: profit - stake, dynamicWinChance, seed };
  }
}
