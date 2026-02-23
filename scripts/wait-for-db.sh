#!/bin/sh
# wait-for-db.sh - wait for postgres to be ready
set -e
host="${DB_HOST:-db}"
port="${DB_PORT:-5432}"
user="${DB_USER:-vivaldi}"
shift

echo "Waiting for postgres at $host:$port..."
while ! pg_isready -h "$host" -p "$port" -U "$user" >/dev/null 2>&1; do
  echo "Postgres is unavailable - sleeping"
  sleep 3
done

echo "Postgres is up - continuing"
exec "$@"