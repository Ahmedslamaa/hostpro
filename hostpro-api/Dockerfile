# ─── Stage 1 : builder ────────────────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev gcc && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install --no-cache-dir --prefix=/install -r requirements.txt


# ─── Stage 2 : runtime ────────────────────────────────────────────────────────
FROM python:3.11-slim AS runtime

WORKDIR /app

# Runtime libs pour asyncpg / psycopg2 / curl healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 curl && rm -rf /var/lib/apt/lists/*

# Packages Python depuis le builder
COPY --from=builder /install /usr/local

# Code source (sans venv ni __pycache__)
COPY --chown=appuser:appuser . .

# Utilisateur non-root
RUN adduser --disabled-password --gecos "" appuser \
    && chown -R appuser:appuser /app \
    && chmod +x /app/startup.sh
USER appuser

ENV PORT=8000
EXPOSE 8000

# Healthcheck pour Azure Container Apps / App Service
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

CMD ["/app/startup.sh"]
