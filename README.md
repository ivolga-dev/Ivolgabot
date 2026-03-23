# Ivolgabot — Telegram Bot (Webhook, Node.js)

Production-ready scaffold для управления группами + игровая система.

## Быстрый старт

```bash
npm run unpack
npm install
npm start
```

`npm run unpack` запускает интерактивную распаковку проекта и запрашивает:
- домен (для `WEBHOOK_URL`),
- API ключ бота (`BOT_TOKEN`),
- логин/пароль админ-панели.

После ввода создаётся `.env` со всеми нужными параметрами.

## Что реализовано

- Модульная архитектура (`commands`, `services`, `games`, `middlewares`).
- Webhook-сервер на Express.
- Middleware: bootstrap контекста, логирование, cooldown, проверки прав.
- Команды:
  - `/ban` (в группе, в ответ на сообщение, временный или перманентный бан)
  - `/balance`
  - `/dice`
  - `/slots`
  - `/mine` (inline-кнопки, cashout)
- Единая экономика + история транзакций.
- Игровая статистика + динамическая анти-удача (адаптация win chance).

## Структура проекта

```text
scripts/
  unpack.sh
src/
  bot/
    createBot.js
    middlewares/
      contextBootstrap.js
      cooldownMiddleware.js
      loggingMiddleware.js
      permissionMiddleware.js
  commands/
    index.js
    ban.js
    balance.js
    dice.js
    mine.js
    slots.js
  games/
    gameEngine.js
    diceGame.js
    mineGame.js
    slotsGame.js
  services/
    chanceService.js
    db.js
    economyService.js
    gameStatsService.js
    groupService.js
    logService.js
    moderationService.js
    roleService.js
    userService.js
  db/
    schema.sql
  utils/
    time.js
  web/
    server.js
  config.js
  index.js
```

## Модель данных

Основные таблицы: `users`, `groups`, `group_roles`, `group_user_roles`, `balances`, `transactions`, `moderation_actions`, `warns`, `command_logs`, `suspicious_events`, `game_stats`, `mine_sessions`.

## Дальше (roadmap)

- Добавить `/roulette`, `/plane`, `/beerpong` и общий реестр включения/выключения игр на группу.
- Реализовать `/daily`, `/transfer`.
- Добавить автомодерацию, banned words, warn policy.
- Подключить глобальную web-панель (auth + 2FA через Telegram).
- Backup cron + ротация логов.
