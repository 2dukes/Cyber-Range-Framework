FROM mongo:latest

RUN apt-get update && apt-get install -y iproute2 python3

COPY init.js /docker-entrypoint-initdb.d/init.js