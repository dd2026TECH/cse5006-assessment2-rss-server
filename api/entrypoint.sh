#!/bin/sh
set -e

# Startup sequence for the API container, per the Module 7 lab.
#
# depends_on only guarantees the Postgres *container* has started, not that the
# database is accepting connections — so wait for the port before doing anything
# that needs it.
echo "Waiting for Postgres..."
/app/wait-for-it.sh postgres:5432 --timeout=60 --strict -- echo "Postgres is up"

# migrate deploy (not migrate dev): applies the committed migrations exactly as
# they are, never generates new ones. That is the correct command for a
# non-interactive environment.
echo "Applying migrations..."
npx prisma migrate deploy

# The seed is idempotent (upserts throughout), so running it on every start is
# safe and means a fresh volume comes up already populated with Assessment 1's
# content rather than an empty site.
echo "Seeding..."
npm run db:seed

echo "Starting API..."
exec npm run dev
