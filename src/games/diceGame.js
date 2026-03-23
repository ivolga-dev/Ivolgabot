import { GameEngine } from './gameEngine.js';

export const diceGame = new GameEngine({
  gameKey: 'dice',
  resolver: {
    baseWinProbability: ({ mode }) => (mode === 'exact' ? 0.17 : 0.48),
    resolve: ({ payload, dynamicWinChance }) => {
      const rolled = 1 + Math.floor(Math.random() * 6);
      let multiplier = 0;

      if (payload.mode === 'exact') {
        const won = rolled === payload.value && Math.random() < dynamicWinChance;
        multiplier = won ? 5.8 : 0;
      } else {
        const diff = payload.mode === 'over' ? rolled - payload.value : payload.value - rolled;
        if (diff > 0 && Math.random() < dynamicWinChance) {
          multiplier = Math.max(1.2, Math.min(3.5, 1 + diff * 0.7));
        }
      }

      return {
        multiplier,
        rolled,
        render: `🎲 Выпало: *${rolled}*`,
        details: `Режим: ${payload.mode}, цель: ${payload.value}`
      };
    }
  }
});
