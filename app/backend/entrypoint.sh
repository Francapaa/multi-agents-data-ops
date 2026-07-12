#!/bin/sh
set -e

_term() {
  echo "Shutting down gracefully..."
  kill -TERM "$child" 2>/dev/null
  wait "$child"
}

if [ "$1" = "worker" ]; then
  shift
  trap _term TERM INT
  celery -A tasks worker --loglevel=info "$@" &
  child=$!
  wait "$child"
  exit $?
fi

exec uvicorn main:app --host 0.0.0.0 --port 8000 "$@"
