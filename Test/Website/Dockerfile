FROM nginx:latest

RUN apt-get update && apt-get upgrade -y
RUN apt-get install git -y
RUN git clone https://github.com/Hatz-D/Litoral-Puro-RJ.git

RUN mv Litoral-Puro-RJ/Test/Website/website.html /usr/share/nginx/html/index.html
