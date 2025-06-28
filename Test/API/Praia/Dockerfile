FROM alpine:3.21.3

RUN apk add py3-pip py3-virtualenv && \
    python3 -m venv my-venv && \
    my-venv/bin/pip install fastapi[standard] passlib[bcrypt] requests pymongo beautifulsoup4 pandas unidecode

COPY . .

ENTRYPOINT ["my-venv/bin/fastapi", "run", "main.py", "--port", "80"]
