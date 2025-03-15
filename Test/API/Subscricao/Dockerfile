FROM ubuntu:latest

RUN apt update && apt upgrade -y

RUN apt-get install pip git python3.12-venv -y

RUN python3 -m venv my-venv

RUN my-venv/bin/pip install fastapi[standard] passlib[bcrypt] pydantic requests pymongo uvicorn

RUN git clone https://github.com/Hatz-D/Litoral-Puro-RJ.git

COPY ../privkey.pem ./privkey.pem
COPY ../fullchain.pem ./fullchain.pem

RUN cp ./Litoral-Puro-RJ/Test/API/Subscricao/main.py ./main.py

ENTRYPOINT ["my-venv/bin/uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002", "--ssl-keyfile", "./privkey.pem", "--ssl-certfile", "./fullchain.pem"]
