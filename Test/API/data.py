from fastapi import FastAPI, HTTPException, status
import json
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
from fastapi.responses import JSONResponse
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import pandas as pd
from bs4 import BeautifulSoup as bs
from unidecode import unidecode
from datetime import datetime
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, constr
import ssl
from typing import List
import smtplib                                                                                                                 
from email.mime.text import MIMEText 

app = FastAPI()

MAPS_API = os.getenv("MAPS_API")
MONGO_URI = os.getenv("MONGO_URI")
MAIL_SECRET = os.getenv("MAIL_SECRET")

ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ssl_context.load_cert_chain('./fullchain.pem', keyfile='./privkey.pem')

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

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: constr(min_length=6)

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

    class Config:
        orm_mode = True

# Função para criptografar a senha
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_user(user: UserCreate, collection):
    if collection.find_one({"email": user.email}):
        raise ValueError("Email já cadastrado")

    hashed_password = hash_password(user.password)
    created_at = datetime.utcnow()  # Objeto datetime

    new_user = {
        "name": user.name,
        "email": user.email,
        "hashed_password": hashed_password,
        "created_at": created_at
    }

    collection.insert_one(new_user)

    return {
        "name": user.name,
        "email": user.email,
        "created_at": created_at.isoformat()  # Convertendo datetime para string
    }


def verify_user_credentials(email: str, password: str, collection):
    user = collection.find_one({"email": email})
    if user is None:
        return None
    if verify_password(password, user["hashed_password"]):
        return {
            "name": user["name"],
            "email": user["email"]
        }
    return None

@app.get("/api/data")
def getData():
    client = MongoClient(MONGO_URI, server_api=ServerApi('1'))

    db = client['litoral_puro_rj']  # Nome do banco de dados
    collection = db['praia']  # Nome da coleção

    # Buscar todos os documentos na coleção
    dados = collection.find()

    # Preparar os dados no formato original
    resultado = {
        "Praia": {},
        "Qualidade": {},
        "Municipio": {},
        "Local": {},
        "Data": {}
    }

    # Iterar sobre os documentos e organizar no formato JSON desejado
    for idx, documento in enumerate(dados):
        resultado["Praia"][str(idx)] = documento["Praia"]
        resultado["Qualidade"][str(idx)] = documento["Qualidade"]
        resultado["Municipio"][str(idx)] = documento["Municipio"]
        resultado["Local"][str(idx)] = documento["Local"]
        resultado["Data"][str(idx)] = documento["Data"]

    conteudo_string = json.dumps(resultado)

    return conteudo_string


@app.get("/api/map")
def getMap():
    response = requests.get("https://maps.googleapis.com/maps/api/js?key="+MAPS_API+"&callback=console.debug&libraries=maps,marker&v=beta")
    return JSONResponse(content={"script": response.text}, status_code=200)


@app.get("/api/coordinates")
def getCoordinates():
    with open("/Litoral-Puro-RJ/Test/API/coordinates.json", 'r', encoding='utf-8') as arquivo:
        conteudo_json = json.load(arquivo)
        conteudo_string = json.dumps(conteudo_json)
    return conteudo_string


@app.get("/api/webscrapping")
def webScrapping():
    url = "https://praialimpa.net/"
    page = requests.get(url)

    df = pd.DataFrame({"Praia":[], "Local":[], "Qualidade":[], "Municipio":[], "Data":[]})
    soup = bs(page.content, "html.parser")
    sections = soup.find_all("section")

    for section in sections:
        if(section.get("id") == "search"):
            continue

        status = section.find_all(class_=["propria","impropria","amostragem-nao-realizada"])
        praias = section.find_all(class_="name")
        locais = section.find_all(class_="location")
        municipio = unidecode(section.find("h1").get_text())
        lastupdate = unidecode(section.find(class_="last-update").get_text())
        lastupdate = lastupdate.replace("Atualizado em ", "")
        if(lastupdate == ""):
            lastupdate = "n/a"

        for i in range(0, len(praias)):
            new_line = {"Praia":unidecode(praias[i].get_text(strip=True)), "Local":unidecode(locais[i].get_text(strip=True)), "Qualidade":unidecode(status[i].get_text(strip=True)), "Municipio":municipio, "Data":lastupdate}
            df = df._append(new_line, ignore_index=True)

    novos_dados = json.loads(df.to_json())

    if(novos_dados['Praia']['0'] != "Arpoador" or novos_dados['Praia']['266'] != 'Cepilho'):
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Houve uma mudança nos índices das praias!"
        )

    client = MongoClient(MONGO_URI, server_api=ServerApi('1'))

    # Preparar as coleções MongoDB
    db = client['litoral_puro_rj']  # Banco de dados
    collection = db['praia']  # Coleção principal
    historico = db['praia_historico']  # Coleção para o histórico

    alteradas = []

    for index in novos_dados['Praia']:
        atual = collection.find_one({"Id": index})
        if(atual["Qualidade"] != novos_dados["Qualidade"][index]):
            documento = {
                "Id": index,
                "Praia": novos_dados['Praia'][index],
                "Qualidade": novos_dados['Qualidade'][index],
                "Municipio": novos_dados['Municipio'][index],
                "Local": novos_dados['Local'][index],
                "Data": novos_dados['Data'][index]
            }

            alteradas.append(documento)

    smtpEmail(alteradas)

    # Mover os dados atuais para o histórico com timestamp
    try:
        dados_atual = list(collection.find())
        if dados_atual:
            for doc in dados_atual:
                doc['data_movimentacao'] = datetime.now()  # Timestamp para controle de histórico
                historico.insert_one(doc)

        # Limpar a coleção principal antes de inserir os novos dados
        collection.delete_many({})

        # Inserir os novos dados na coleção 'praia'
        for index in novos_dados['Praia']:
            documento = {
                "Id": index,
                "Praia": novos_dados['Praia'][index],
                "Qualidade": novos_dados['Qualidade'][index],
                "Municipio": novos_dados['Municipio'][index],
                "Local": novos_dados['Local'][index],
                "Data": novos_dados['Data'][index]
            }
            collection.insert_one(documento)

        return "Dados atualizados com sucesso e historico preservado!"

    except Exception as e:
        print("Erro:", e)
        return "Erro!"


def smtpEmail(alteradas):
    client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
    db = client['litoral_puro_rj'] 
    collection_subs = db['subscricao']

    subscricoes = list(collection_subs.find())

    for subscricao in subscricoes:
        itens_alterados = []
        for index in subscricao['selectedItems']:
            for praia in alteradas:
                if(praia['Id'] == index):
                    documento_formatado = {
                        "Id": index,
                        "Praia": praia['Praia'],
                        "Qualidade": praia['Qualidade'],
                        "Municipio": praia['Municipio'],
                        "Local": praia['Local'],
                        "Data": praia['Data']
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


@app.post("/api/register")
async def register(user: UserCreate):
    client = MongoClient(MONGO_URI, server_api=ServerApi('1'))

    db = client['litoral_puro_rj']
    collection = db['usuario']

    try:
        created_user = create_user(user, collection)
        return JSONResponse(
            content={"message": "Usuário criado com sucesso!", "user": created_user},
            status_code=status.HTTP_201_CREATED
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro no servidor. Tente novamente mais tarde."
        )


@app.post("/api/login")
async def login(user: UserLogin):
    client = MongoClient(MONGO_URI, server_api=ServerApi('1'))

    db = client['litoral_puro_rj']
    collection = db['usuario']

    authenticated_user = verify_user_credentials(user.email, user.password, collection)
    if authenticated_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas"
        )
    return JSONResponse(
        content={"message": "Login bem-sucedido", "user": authenticated_user},
        status_code=status.HTTP_200_OK
    )


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
        selections["_id"] = str(selections["_id"])  # ✅ Converte o ObjectId para string
        return selections
    else:
        return {"message": "Nenhuma seleção encontrada"}
