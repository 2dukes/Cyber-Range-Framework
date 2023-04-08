FROM php:8.2-apache-buster

RUN apt-get update && apt-get install -y iproute2 python3

COPY index.php /var/www/html/index.php