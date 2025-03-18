FROM alpine:3.21.3

# RUN apt update && apt upgrade -y

RUN apk add py3-pip py3-virtualenv && \
    python3 -m venv my-venv && \
    my-venv/bin/pip install fastapi[standard] passlib[bcrypt] pydantic requests pymongo uvicorn
    
# RUN python3 -m venv my-venv

# RUN my-venv/bin/pip install fastapi[standard] passlib[bcrypt] pydantic requests pymongo uvicorn

# RUN git clone https://github.com/Hatz-D/Litoral-Puro-RJ.git

# COPY ./privkey.pem ./privkey.pem
# COPY ./fullchain.pem ./fullchain.pem

COPY . .

ENTRYPOINT ["my-venv/bin/uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002", "--ssl-keyfile", "/data/live/dioguitoposeidon.com.br/privkey.pem", "--ssl-certfile", "/data/live/dioguitoposeidon.com.br/fullchain.pem"]
