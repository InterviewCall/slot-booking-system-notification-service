# notification-service on the WorkR server (pm2)

On the WorkR server notification-service runs under pm2 (e.g. `/opt/workr/notification-service`), next to User-Service and a local Redis.
User-Service only *enqueues* jobs into that Redis; this service is the worker that sends the email / WhatsApp.

> This repo's GitHub Actions workflow (`.github/workflows/deploy.yml`) deploys the **booking** server with Docker.
> Nothing here touches it - this folder is the separate path for the WorkR server.

## Every deploy

```bash
ssh ubuntu@<server>
cd /opt/workr/notification-service
./deploy/workr-server/deploy.sh
```

What it does, in order - and stops safely at the first problem:

1. Checks `.env` (required keys, Redis reachable) - **fails before touching anything**.
2. `git pull --ff-only origin main`.
3. `npm ci` only when `package-lock.json` changed.
4. `npm run build` (prisma generate + tsc + email templates). A build error leaves the running app untouched.
5. `prisma migrate deploy`. A migration error leaves the running app untouched.
6. `pm2 restart <name> --update-env` - the pm2 process is found by script path, so your existing `workr-notification` is reused, never duplicated.
7. Waits for `http://127.0.0.1:$PORT/api/v1/ping`. If it never answers, it **rolls back automatically** to the previous build (`dist.prev`).
8. `pm2 save`.

Other commands: `./deploy/workr-server/deploy.sh status | logs | rollback`, options `--no-pull`, `--skip-migrate`, `--force-install`.
Rollback restores the previous *build*; migrations are not reverted. Deploy this service **before** User-Service when both change.
The very first run after adopting this script runs `npm ci` once.

## `.env` - the values that bite

| Key | Must be |
|---|---|
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_TLS` | `127.0.0.1` / `6379` / `false` (local Redis, no TLS, no password) |
| `DATABASE_URL` | used by `prisma migrate deploy`; URL-encode special characters in the password (`@`->`%40`, `#`->`%23`) |
| `DB_HOST` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | the RDS host and the notification DB user (`ic_notifications`) |
| `WORKR_LOOKUP_API_KEY` | equal to `NOTIFICATION_LOOKUP_API_KEY` in User-Service's `.env` |
| `WORKR_SES_FROM_*` | sender for WorkR mails (falls back to `SES_FROM_*` when empty) |

`deploy.sh` warns about `.env` lines that are not `KEY=VALUE` - dotenv ignores them silently, and a stray pasted secret
sitting in `.env` is worth removing.

## Redis (one-time per server)

```bash
./deploy/workr-server/setup-redis.sh
```

Installs `redis-server` if missing and sets: loopback only, AOF persistence (queued jobs survive a restart), `noeviction`, 512 MB cap
(`REDIS_MAXMEMORY=1gb ./deploy/workr-server/setup-redis.sh` for another size). Safe to re-run. Never open port 6379 in the security group.

## Queue dashboard

Bull Board (`/ui/queue-dashboard`) has **no authentication**. Keep port 3005 closed in the security group and use a tunnel:
`ssh -L 3005:localhost:3005 ubuntu@<server>` then open http://localhost:3005/ui/queue-dashboard.

## First time on a NEW server

```bash
# Node 22, pm2, git
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt-get install -y nodejs git
sudo npm i -g pm2

sudo mkdir -p /opt/workr && sudo chown $USER /opt/workr && cd /opt/workr
git clone <notification-service repo url> notification-service && cd notification-service
./deploy/workr-server/setup-redis.sh
nano .env                      # fill it in (see the table above); chmod 600 .env
# create the database once:  CREATE DATABASE ic_notifications CHARACTER SET utf8mb4;  + a user with ALL on it
./deploy/workr-server/deploy.sh    # builds, migrates and starts pm2 process "workr-notification"

pm2 startup                    # prints one sudo command - run it, so pm2 starts on reboot
pm2 save
```

The RDS security group must allow 3306 from this server's security group.
