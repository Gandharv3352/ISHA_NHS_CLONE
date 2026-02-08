FROM php:8.2-apache

# Enable Apache rewrite
RUN a2enmod rewrite

# Copy website files
COPY public/ /var/www/html/

EXPOSE 80
