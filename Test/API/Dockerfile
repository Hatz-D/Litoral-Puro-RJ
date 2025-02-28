FROM ubuntu:latest

COPY ../../../letsencrypt/live/dioguitoposeidon.com.br/privkey.pem ./privkey.pem
COPY ../../../letsencrypt/live/dioguitoposeidon.com.br/fullchain.pem ./fullchain.pem

RUN apt update && apt upgrade -y

RUN apt-get install pip git python3.12-venv -y

RUN python3 -m venv my-venv

RUN my-venv/bin/pip install fastapi[standard] passlib[bcrypt] pydantic requests pymongo beautifulsoup4 pandas unidecode uvicorn

RUN git clone https://github.com/Hatz-D/Litoral-Puro-RJ.git

COPY /var/lib/jenkins/workspace/Webscraping/letsencrypt/live/dioguitoposeidon.com.br/privkey.pem ./Litoral-Puro-RJ/Test/API/privkey.pem
COPY /var/lib/jenkins/workspace/Webscraping/letsencrypt/live/dioguitoposeidon.com.br/fullchain.pem ./Litoral-Puro-RJ/Test/API/fullchain.pem

ENTRYPOINT ["my-venv/bin/uvicorn", "Litoral-Puro-RJ/Test/API/data:app", "--host", "0.0.0.0", "--port", "8000", "--ssl-keyfile", "Litoral-Puro-RJ/Test/API/privkey.pem", "--ssl-certfile", "Litoral-Puro-RJ/Test/API/fullchain.pem"]
