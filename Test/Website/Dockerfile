FROM nginx:latest

RUN apt-get update && apt-get upgrade -y
RUN apt-get install git -y
RUN git clone https://github.com/Hatz-D/Litoral-Puro-RJ.git

RUN rm /usr/share/nginx/html/index.html
RUN mv Litoral-Puro-RJ/Test/Website/* /usr/share/nginx/html/
#RUN sed -i "/index.html;/a\    add_header 'Access-Control-Allow-Origin' '*';" /etc/nginx/conf.d/default.conf
RUN sed -i "s/localhost/dioguitoposeidon.com.br/g" /etc/nginx/conf.d/default.conf
