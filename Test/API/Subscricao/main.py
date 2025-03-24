from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from datetime import datetime
from passlib.context import CryptContext
from typing import List
import smtplib
from email.mime.text import MIMEText
from pydantic import BaseModel, EmailStr, constr
import ssl
import json
import os

app = FastAPI()

MAIL_SECRET = os.getenv("MAIL_SECRET")
MONGO_URI = os.getenv("MONGO_URI")

ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ssl_context.load_cert_chain('/data/live/dioguitoposeidon.com.br/fullchain.pem', keyfile='/data/live/dioguitoposeidon.com.br/privkey.pem')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SelectionRequest(BaseModel):
    email: str
    selectedItems: List[str]


class Praia(BaseModel):
    Id: str
    Praia: str
    Qualidade: str
    Municipio: str
    Local: str
    Data: str


class PraiasAlteradas(BaseModel):
    lista: List[Praia]
    

@app.post("/api/query-subscriptions")
async def smtpEmail(request: PraiasAlteradas):
    client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
    db = client['litoral_puro_rj'] 
    collection_subs = db['subscricao']

    subscricoes = list(collection_subs.find())

    alteradas = request.lista

    for subscricao in subscricoes:
        itens_alterados = []
        for index in subscricao['selectedItems']:
            for praia in alteradas:
                if(praia.Id == index):
                        documento_formatado = {
                            "Id": praia.Id,
                            "Praia": praia.Praia,
                            "Qualidade": praia.Qualidade,
                            "Municipio": praia.Municipio,
                            "Local": praia.Local,
                            "Data": praia.Data
                        }

                        itens_alterados.append(documento_formatado)

        if itens_alterados:
            sendEmail(itens_alterados, subscricao['email'])


def sendEmail(itens_alterados, email):
    subject = "Alteração no Status de Praias"
    sender = "litoralpurorj@gmail.com"
    body = "Olá, boa tarde!\n\nO status de balneabilidade das seguintes praias mudaram:\n\n"

    for item in itens_alterados:
        body = body + "•" + item["Praia"] + ", " + item["Municipio"] + ", " + item["Local"] + ": balneabilidade " + item["Qualidade"].lower() + ". Data de atualização: " + item["Data"] + ".\n"

    body = body + "\nObrigado por continuar utilizando o Litoral Puro RJ, a sua melhor consulta de balneabilidade para o Rio de Janeiro!"

    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = sender
    msg['To'] = email

    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp_server:
        smtp_server.login(sender, MAIL_SECRET)
        smtp_server.sendmail(sender, email, msg.as_string())


class SelectionRequest(BaseModel):
    email: str
    selectedItems: List[str]


@app.post("/api/save-selections")
async def save_selections(request: SelectionRequest):
    client = MongoClient(MONGO_URI, server_api=ServerApi('1'))

    db = client['litoral_puro_rj']
    collection = db['subscricao']
    
    email = request.email
    selected_items = request.selectedItems
    
    existing_entry = collection.find_one({"email": email})
    
    if existing_entry:
        collection.update_one({"email": email}, {"$set": {"selectedItems": selected_items}})
    else:
        collection.insert_one({"email": email, "selectedItems": selected_items})
    
    return JSONResponse(status_code=200, content={"message": "Seleções salvas com sucesso!"})

@app.get("/api/get-selections/{email}")
async def get_selections(email: str):
    client = MongoClient(MONGO_URI, server_api=ServerApi('1'))

    db = client['litoral_puro_rj']
    collection = db['subscricao']
    
    selections = collection.find_one({"email": email})

    if selections:
        selections["_id"] = str(selections["_id"]) 
        return selections
    else:
        return {"message": "Nenhuma seleção encontrada"}
