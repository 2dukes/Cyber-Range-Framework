FROM node:lts-alpine

RUN apk update \
    && apk upgrade \
    && apk add --no-cache bash openrc openssh python3 openresolv nano \
    && ssh-keygen -A \
    # && adduser -h /home/dukes -s /bin/sh -D dukes \
    && mkdir ~/.ssh \
    && chmod 0700 ~/.ssh \
    && sed -i s/^#PasswordAuthentication\ yes/PasswordAuthentication\ no/ /etc/ssh/sshd_config \
    && mkdir -p /run/openrc \
    && touch /run/openrc/softlevel

COPY keys/id_key.pub /
RUN cat /id_key.pub > ~/.ssh/authorized_keys \
    && chmod 600 ~/.ssh/authorized_keys

EXPOSE 22

ENTRYPOINT ["sh", "-c", "rc-status; rc-service sshd start; tail -f /dev/null"]