FROM nginx:latest

ENV HOME=/home/appuser
ENV GROUP_ID=1003
ENV GROUP_NAME=appuser
ENV USER_ID=1003
ENV USER_NAME=appuser

RUN mkdir -m 550 ${HOME} && groupadd -g ${GROUP_ID} ${GROUP_NAME} && useradd -u ${USER_ID} -g ${GROUP_ID} ${USER_NAME}

RUN cd ${HOME}

RUN apt-get update && apt-get upgrade -y
RUN apt-get install git certbot python3-certbot-nginx -y
RUN git clone https://github.com/Hatz-D/Litoral-Puro-RJ.git

RUN mkdir -p /etc/nginx/html/
RUN rm /usr/share/nginx/html/index.html
RUN mv Litoral-Puro-RJ/Test/Website/* /etc/nginx/html/

RUN rm /etc/nginx/nginx.conf
COPY ./nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /var/www/certbot

RUN echo "0 0 * * * certbot renew --quiet --deploy-hook 'nginx -s reload'" > /etc/cron.d/certbot-renew

VOLUME ["/etc/letsencrypt", "/var/www/certbot"]
