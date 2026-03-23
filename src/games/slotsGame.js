import { GameEngine } from './gameEngine.js';

const symbols = ['🍒', '🍋', '🔔', '💎', '7️⃣'];
const payoutTable = {
  '🍒🍒🍒': 2,
  '🍋🍋🍋': 3,
  '🔔🔔🔔': 5,
  '💎💎💎': 10,
  '7️⃣7️⃣7️⃣': 50
};

export const slotsGame = new GameEngine({
  gameKey: 'slots',
  resolver: {
    baseWinProbability: () => 0.32,
    resolve: ({ dynamicWinChance }) => {
      const rolls = Array.from({ length: 3 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
      const combo = rolls.join('');
      let multiplier = payoutTable[combo] ?? 0;

      if (Math.random() > dynamicWinChance) multiplier = 0;
      if (multiplier > 0 && Math.random() < 0.05) multiplier *= 2;

      return {
        multiplier,
        render: `🎰 | ${rolls.join(' | ')} |`,
        details: `Комбинация: ${combo} | Множитель: x${multiplier}`
      };
    }
  }
});

export { payoutTable as slotsPayoutTable };
