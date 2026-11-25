#!/usr/bin/env bash
# One-time (idempotent): install Redis and configure it the way BullMQ needs it:
#   loopback only, AOF persistence (queued jobs survive a restart), noeviction (never drop jobs), memory cap.
# Safe to re-run. Usage:  ./deploy/workr-server/setup-redis.sh
set -euo pipefail

CONF="${REDIS_CONF:-/etc/redis/redis.conf}"
MAXMEM="${REDIS_MAXMEMORY:-512mb}"
SKIP_SERVICE="${SKIP_SERVICE:-0}"      # 1 = only edit the config file (used for testing)

if [[ "$SKIP_SERVICE" != "1" && $EUID -ne 0 ]]; then exec sudo -E bash "$0" "$@"; fi

if [[ "$SKIP_SERVICE" != "1" ]] && ! command -v redis-server >/dev/null 2>&1; then
  apt-get update
  DEBIAN_FRONTEND=noninteractive apt-get install -y redis-server
fi
[[ -f "$CONF" ]] || { echo "xx  $CONF not found" >&2; exit 1; }

cp -n "$CONF" "$CONF.orig" 2>/dev/null || true     # keep the untouched original once

# Replace "key ..." if present (uncommented), otherwise append it (a later line wins in redis.conf)
set_conf() {
  local key="$1" value="$2"
  if grep -qE "^${key}[[:space:]]" "$CONF"; then
    sed -i -E "s|^${key}[[:space:]].*|${key} ${value}|" "$CONF"
  else
    printf '%s %s\n' "$key" "$value" >> "$CONF"
  fi
}

set_conf bind "127.0.0.1 -::1"
set_conf protected-mode yes
set_conf appendonly yes
set_conf appendfsync everysec
set_conf maxmemory "$MAXMEM"
set_conf maxmemory-policy noeviction

if [[ "$SKIP_SERVICE" == "1" ]]; then echo "config written to $CONF (service steps skipped)"; exit 0; fi

systemctl enable redis-server
systemctl restart redis-server
sleep 1

echo "ping           : $(redis-cli ping)"
for k in bind appendonly appendfsync maxmemory maxmemory-policy; do
  printf '%-15s: %s\n' "$k" "$(redis-cli CONFIG GET "$k" | tail -n 1)"
done
echo
echo "Expected: PONG, '127.0.0.1 -::1', yes, everysec, $(numfmt --from=iec "${MAXMEM^^}" 2>/dev/null || echo "$MAXMEM"), noeviction"
echo "Redis listens on localhost only, so no REDIS_PASSWORD is needed (leave it empty in both .env files)."
