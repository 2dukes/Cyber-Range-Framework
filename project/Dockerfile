FROM node:lts-alpine

RUN apk update \
    && apk upgrade \
    && apk add --no-cache bash openrc openssh python3 openresolv nano iptables \
    && mkdir -p /run/openrc \
    && touch /run/openrc/softlevel

ENTRYPOINT ["sh", "-c", "rc-status; tail -f /dev/null"]