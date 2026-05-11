#!/bin/sh
set -e

echo "=== HOST PRO API — Démarrage ==="

# ── Migrations Alembic (PostgreSQL uniquement) ─────────────────────────────
if echo "$DATABASE_URL" | grep -q "postgresql"; then
    echo "[1/2] Exécution des migrations Alembic..."
    # Construire DATABASE_URL_SYNC à partir de DATABASE_URL si absent
    if [ -z "$DATABASE_URL_SYNC" ]; then
        export DATABASE_URL_SYNC=$(echo "$DATABASE_URL" | sed 's/+asyncpg//' | sed 's/postgresql+asyncpg/postgresql/')
    fi
    alembic upgrade head
    echo "     Migrations OK ✓"
else
    echo "[1/2] SQLite détecté — init via db_init.py..."
    python app/db_init.py
    echo "     Tables créées OK ✓"
fi

# ── Lancement du serveur ───────────────────────────────────────────────────
PORT=${PORT:-8000}
WORKERS=${WEB_CONCURRENCY:-2}

echo "[2/2] Démarrage uvicorn sur 0.0.0.0:${PORT} (${WORKERS} workers)..."
exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port "$PORT" \
    --workers "$WORKERS" \
    --proxy-headers \
    --forwarded-allow-ips="*"
