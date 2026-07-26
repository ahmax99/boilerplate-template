#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL is required}"

command -v psql >/dev/null 2>&1 || {
  echo "::error::psql is not installed on this runner — install postgresql-client before this step."
  exit 1
}

base_url="${DATABASE_URL%%\?*}"
export PGSSLMODE="${PGSSLMODE:-require}"
export PGCONNECT_TIMEOUT="${PGCONNECT_TIMEOUT:-30}"

psql "$base_url" --no-psqlrc --quiet -v ON_ERROR_STOP=1 <<'SQL'
DO $$
DECLARE
  targets text;
BEGIN
  SELECT string_agg(format('public.%I', tablename), ', ')
    INTO targets
    FROM pg_tables
   WHERE schemaname = 'public'
     AND tablename <> '_prisma_migrations';

  IF targets IS NULL THEN
    RAISE NOTICE 'No application tables in public — nothing to truncate.';
  ELSE
    RAISE NOTICE 'Truncating %', targets;
    EXECUTE format('TRUNCATE TABLE %s CASCADE', targets);
  END IF;
END
$$;
SQL

echo "Database emptied — branch, endpoint, schema and migration history preserved."
