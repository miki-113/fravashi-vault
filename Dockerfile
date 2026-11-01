# Этап 1: сборка. Образы закреплены по тегу и digest; обновлять вручную после проверки.
FROM rust:1.99.1-slim-bookworm@sha256:24707e70a4f1e23d9a7b25202ec43126d28a52294b96aad5c670df1fd1f1d400 AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential pkg-config && rm -rf /var/lib/apt/lists/*

WORKDIR /build
COPY Cargo.toml Cargo.lock main.rs ./
RUN cargo build --release --locked

# Этап 2: минимальный образ. Только бинарь, index.html и static; без apt-пакетов, curl и wget.
FROM debian:bookworm-20261020-slim@sha256:7ff6ba31527b9e336162fa061746c366c4b2032f4d2cff2078bea43f78efe3f8

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
