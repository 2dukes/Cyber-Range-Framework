FROM node:lts-alpine

RUN apk update \
    && apk upgrade \
    && apk add --no-cache bash openrc openssh \
    && ssh-keygen -A \
    && echo 'PasswordAuthentication yes' >> /etc/ssh/sshd_config \
    && adduser -h /home/dukes -s /bin/sh -D dukes \
    && echo -n 'dukes:some_password_here' | chpasswd \
    && mkdir -p /run/openrc \
    && touch /run/openrc/softlevel

EXPOSE 22

# -D in CMD below prevents sshd from becoming a daemon. -e is to log everything to stderr.
ENTRYPOINT ["sh", "-c", "/usr/sbin/sshd -e; tail -f /dev/null"]