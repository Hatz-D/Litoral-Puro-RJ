FROM alpine:3.21.3

# RUN apt update && apt upgrade -y

RUN apk add pip python3.12-venv 

RUN python3 -m venv my-venv

RUN my-venv/bin/pip install fastapi[standard] passlib[bcrypt] requests pymongo beautifulsoup4 pandas unidecode uvicorn

# RUN git clone https://github.com/Hatz-D/Litoral-Puro-RJ.git

# COPY ./privkey.pem ./privkey.pem
# COPY ./fullchain.pem ./fullchain.pem

# RUN cp ./Litoral-Puro-RJ/Test/API/Praia/main.py ./main.py

COPY . .

RUN cp /data/live/dioguitoposeidon.com.br/privkey.pem ./privkey.pem

RUN cp /data/live/dioguitoposeidon.com.br/fullchain.pem ./fullchain.pem

ENTRYPOINT ["my-venv/bin/uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--ssl-keyfile", "./privkey.pem", "--ssl-certfile", "./fullchain.pem"]
