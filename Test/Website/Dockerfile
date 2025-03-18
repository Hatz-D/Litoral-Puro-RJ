FROM nginx:1.27.4-alpine

RUN apk add certbot certbot-nginx && \
    mkdir -p /etc/nginx/html/ && \
    rm /usr/share/nginx/html/index.html && \
    rm /etc/nginx/nginx.conf && \
    mkdir -p /var/www/certbot
    
# RUN mkdir -p /etc/nginx/html/

# RUN rm /usr/share/nginx/html/index.html

COPY . /etc/nginx/html

# RUN rm /etc/nginx/nginx.conf

COPY ./nginx.conf /etc/nginx/nginx.conf

# RUN mkdir -p /var/www/certbot

# RUN echo "0 0 * * * certbot renew --quiet --deploy-hook 'nginx -s reload'" > /etc/cron.d/certbot-renew
