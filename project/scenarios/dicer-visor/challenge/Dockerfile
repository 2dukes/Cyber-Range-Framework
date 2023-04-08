FROM debian:bookworm-20230109-slim AS app
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

FROM 2dukes/pwnred_jail
COPY --from=app / /srv
COPY hook.sh /jail
COPY flag.txt bzImage dicer-visor run /srv/app/
ENV JAIL_CPU=1000 JAIL_DEV=kvm JAIL_TMP_SIZE=10M JAIL_MEM=300M JAIL_TIME=450
