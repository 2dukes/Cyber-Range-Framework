# build phase
FROM rust:slim AS builder

WORKDIR /app
COPY ./app .
RUN cargo build --release

# final image
FROM debian:bullseye-slim

RUN apt-get update && apt-get install -y iproute2 python3

WORKDIR /app
COPY --from=builder /app/target/release/app ./
COPY --from=builder /app/static .//static/

RUN useradd -ms /bin/bash user
USER user

CMD ["/app/app"]