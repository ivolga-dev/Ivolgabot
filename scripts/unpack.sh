#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"

if [[ -f "$ENV_FILE" ]]; then
  read -r -p ".env уже существует. Перезаписать? [y/N]: " overwrite
  if [[ ! "$overwrite" =~ ^[Yy]$ ]]; then
    echo "Отменено."
    exit 0
  fi
fi

echo "=== Ivolgabot setup / распаковка ==="
read -r -p "Домен (без https://, например bot.example.com): " domain
while [[ -z "${domain// }" ]]; do
  read -r -p "Домен обязателен. Введите домен: " domain
done

read -r -p "API ключ Telegram-бота (BOT_TOKEN): " bot_token
while [[ -z "${bot_token// }" ]]; do
  read -r -p "BOT_TOKEN обязателен. Введите BOT_TOKEN: " bot_token
done

read -r -p "Логин админ-панели [admin]: " admin_login
admin_login=${admin_login:-admin}

read -r -s -p "Пароль админ-панели: " admin_password
echo
while [[ -z "${admin_password// }" ]]; do
  read -r -s -p "Пароль обязателен. Введите пароль админ-панели: " admin_password
  echo
done

webhook_secret="$(openssl rand -hex 24 2>/dev/null || date +%s%N | sha256sum | head -c 48)"

cat > "$ENV_FILE" <<ENVVARS
BOT_TOKEN=$bot_token
WEBHOOK_URL=https://$domain
WEBHOOK_SECRET=$webhook_secret
PORT=3000
DB_PATH=./data/bot.db
GLOBAL_ADMIN_USER_IDS=
ADMIN_PANEL_LOGIN=$admin_login
ADMIN_PANEL_PASSWORD=$admin_password
ENVVARS

echo "✅ .env создан: $ENV_FILE"
echo "Следующие шаги:"
echo "  1) npm install"
echo "  2) npm start"
