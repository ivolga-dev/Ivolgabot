import { gameStatsService } from './gameStatsService.js';

export const chanceService = {
  adjustedProbability({ groupId, userId, gameKey, baseWinProbability }) {
    const stats = gameStatsService.ensure(groupId, userId, gameKey);

    const streakPenalty = Math.min(0.1, stats.win_streak * 0.01);
    const streakProtection = Math.min(0.1, stats.lose_streak * 0.01);
    const adjusted = baseWinProbability - streakPenalty + streakProtection - stats.adjusted_win_bias;

    return Math.max(0.05, Math.min(0.95, adjusted));
  }
};
