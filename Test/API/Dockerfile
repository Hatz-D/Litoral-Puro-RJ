FROM ubuntu:latest

RUN apt update && apt upgrade -y

RUN apt-get install pip git python3.12-venv -y

RUN python3 -m venv my-venv

RUN my-venv/bin/pip install fastapi[standard]

RUN my-venv/bin/pip install requests

RUN git clone https://github.com/Hatz-D/Litoral-Puro-RJ.git

ENTRYPOINT ["my-venv/bin/fastapi", "run", "Litoral-Puro-RJ/Test/API/data.py"]
