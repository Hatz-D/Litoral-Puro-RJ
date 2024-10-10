FROM ubuntu:latest

RUN apt update && apt-upgrade -y

RUN pip install fastapi[standard]

RUN pip install requests

RUN apt-get install git -y

RUN git clone https://github.com/Hatz-D/Litoral-Puro-RJ.git

RUN fastapi run Litoral-Puro-RJ/Test/API/data.py
