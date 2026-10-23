# Этап 1: сборка. Образы закреплены по тегу и digest; обновлять вручную после проверки.
FROM rust:1.93.1-slim-bookworm@sha256:5b9332190bb3b9ece73b810cd1f1e9f06343b294ce184bcb067f0747d7d333ea AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential pkg-config && rm -rf /var/lib/apt/lists/*

WORKDIR /build
COPY Cargo.toml Cargo.lock main.rs ./
RUN cargo build --release --locked

# Этап 2: минимальный образ. Только бинарь, index.html и static; без apt-пакетов, curl и wget.
FROM debian:bookworm-20261005-slim@sha256:7c7b2c966bc9ee8cedfeef67e0e279108992c77681fa595db4a9d65c06ccc587

# Непривилегированный пользователь; реальные UID/GID можно переопределить через user: в compose
RUN groupadd --system --gid 1000 app \
    && useradd --system --uid 1000 --gid app --no-create-home --shell /usr/sbin/nologin app \
    && mkdir -p /app/data && chown app:app /app/data && chmod 700 /app/data

WORKDIR /app
COPY --from=builder /build/target/release/fravashi /app/fravashi
COPY index.html /app/index.html
COPY static /app/static

ENV DB_PATH=/app/data/vault-v2.db
EXPOSE 8000
USER app

# В образе нет curl и wget: проверку делает сам бинарь
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD ["/app/fravashi", "--healthcheck"]

CMD ["/app/fravashi"]
