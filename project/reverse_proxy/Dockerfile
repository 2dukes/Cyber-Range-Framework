FROM nginx:latest

# COPY nginx.conf /etc/nginx/nginx.conf
# COPY server.crt /etc/ssl/certs/my-site.crt
# COPY server.key /etc/ssl/private/my-site.key

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y iproute2 python3

EXPOSE 80 443

ENTRYPOINT [ "sleep", "infinity" ]
# ENTRYPOINT [ "/usr/sbin/nginx", "-g", "daemon off;" ]