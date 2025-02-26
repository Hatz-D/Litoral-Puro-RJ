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

app = FastAPI()

MAPS_API = os.getenv("MAPS_API")
MONGO_URI = os.getenv("MONGO_URI")

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

# Função para hash da senha
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Função para verificar se a senha corresponde ao hash
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Função para criar o usuário no MongoDB
def create_user(user: UserCreate):
    # Verifica se o e-mail já existe no banco de dados
    if collection.find_one({"email": user.email}):
        raise ValueError("Email já cadastrado")

    # Criptografa a senha do usuário
    hashed_password = hash_password(user.password)

    # Criação do documento de usuário
    new_user = {
        "name": user.name,
        "email": user.email,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow()
    }

    # Inserção no MongoDB
    collection.insert_one(new_user)

    # Retorna os dados do usuário com o campo 'hashed_password' excluído
    return {
        "name": user.name,
        "email": user.email,
        "created_at": new_user["created_at"]
    }

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

        for i in range(0, len(praias)):
            new_line = {"Praia":unidecode(praias[i].get_text(strip=True)), "Local":unidecode(locais[i].get_text(strip=True)), "Qualidade":unidecode(status[i].get_text(strip=True)), "Municipio":municipio, "Data":lastupdate}
            df = df._append(new_line, ignore_index=True)

    novos_dados = json.loads(df.to_json())

    client = MongoClient(MONGO_URI, server_api=ServerApi('1'))

    # Preparar as coleções MongoDB
    db = client['litoral_puro_rj']  # Banco de dados
    collection = db['praia']  # Coleção principal
    historico = db['praia_historico']  # Coleção para o histórico

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


@app.post("/api/register", response_model=UserCreate)
async def register(user: UserCreate):
    try:
        # Tenta criar o usuário no banco de dados
        created_user = create_user(user)
        return JSONResponse(
            content={"message": "Usuário criado com sucesso!", "user": created_user},
            status_code=status.HTTP_201_CREATED
        )
    except ValueError as ve:
        # Caso o email já esteja cadastrado
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        # Caso ocorra qualquer outro erro
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro no servidor. Tente novamente mais tarde."
        )


@app.post("/api/login")
def login():
    client = MongoClient(MONGO_URI, server_api=ServerApi('1'))

    db = client['litoral_puro_rj']
    collection = db['usuario']

    try:
        return "Usuário logado com sucesso!"

    except Exception as e:
        print("Erro:", e)
        return "Erro!"
