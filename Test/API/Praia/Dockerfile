FROM alpine:3.21.3

RUN apk add py3-pip py3-virtualenv && \
    python3 -m venv my-venv && \
    my-venv/bin/pip install fastapi[standard] passlib[bcrypt] requests pymongo beautifulsoup4 pandas unidecode uvicorn

COPY . .

ENTRYPOINT ["my-venv/bin/uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--ssl-keyfile", "/data/live/dioguitoposeidon.com.br/privkey.pem", "--ssl-certfile", "/data/live/dioguitoposeidon.com.br/fullchain.pem"]
