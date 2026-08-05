#!/usr/bin/env bash
# Blocks until a TCP host:port accepts connections, then optionally executes a
# command. Same interface as the widely-used wait-for-it.sh the Module 7 lab
# uses:
#
#   ./wait-for-it.sh postgres:5432 --timeout=60 --strict -- echo "Postgres is up"
#
# Needed because docker-compose's depends_on waits for the container to start,
# not for the service inside it to be ready to accept connections.

set -e

HOST=""
PORT=""
TIMEOUT=15
STRICT=0
CMD=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    *:*)
      HOST="${1%%:*}"
      PORT="${1##*:}"
      shift
      ;;
    --timeout=*)
      TIMEOUT="${1#*=}"
      shift
      ;;
    -t)
      TIMEOUT="$2"
      shift 2
      ;;
    --strict)
      STRICT=1
      shift
      ;;
    --)
      shift
      CMD=("$@")
      break
      ;;
    *)
      echo "wait-for-it: unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

if [[ -z "$HOST" || -z "$PORT" ]]; then
  echo "wait-for-it: you need to provide a host:port to test" >&2
  exit 1
fi

start=$(date +%s)
while true; do
  # Bash's /dev/tcp pseudo-device — no netcat dependency in the image.
  if (echo > "/dev/tcp/$HOST/$PORT") >/dev/null 2>&1; then
    elapsed=$(( $(date +%s) - start ))
    echo "wait-for-it: $HOST:$PORT is available after ${elapsed}s"
    break
  fi

  elapsed=$(( $(date +%s) - start ))
  if [[ "$TIMEOUT" -gt 0 && "$elapsed" -ge "$TIMEOUT" ]]; then
    echo "wait-for-it: timeout after ${TIMEOUT}s waiting for $HOST:$PORT" >&2
    if [[ "$STRICT" -eq 1 ]]; then
      exit 1
    fi
    break
  fi

  sleep 1
done

if [[ ${#CMD[@]} -gt 0 ]]; then
  exec "${CMD[@]}"
fi
