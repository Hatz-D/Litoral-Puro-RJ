FROM nginx:latest

RUN apt-get update && apt-get upgrade -y
RUN apt-get install git -y
RUN git clone https://github.com/Hatz-D/Litoral-Puro-RJ.git

RUN rm /usr/share/nginx/html/index.html
RUN mv Litoral-Puro-RJ/Test/Website/* /usr/share/nginx/html/*

