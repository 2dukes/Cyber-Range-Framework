FROM nginx:latest

COPY nginx.conf /etc/nginx/nginx.conf
COPY server.crt /etc/ssl/certs/my-site.crt
COPY server.key /etc/ssl/private/my-site.key

EXPOSE 80 443
ENTRYPOINT [ "/usr/sbin/nginx", "-g", "daemon off;" ]