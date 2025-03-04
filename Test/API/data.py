from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import json
from jose import JWTError, jwt
from starlette.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
from fastapi.responses import JSONResponse
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import pandas as pd
from bs4 import BeautifulSoup as bs
from unidecode import unidecode
from datetime import datetime, timedelta
from passlib.context import CryptContext
import bcrypt
from pydantic import BaseModel, EmailStr, constr
import ssl

app = FastAPI()

MAPS_API = os.getenv("MAPS_API")
MONGO_URI = os.getenv("MONGO_URI")
SECRET_KEY = str(os.getenv("SECRET_KEY"))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ssl_context.load_cert_chain('./fullchain.pem', keyfile='./privkey.pem')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

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

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenData(BaseModel):
    email: str

def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Função para criptografar a senha
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_user(user: UserCreate, collection):
    if collection.find_one({"email": user.email}):
        raise ValueError("Email já cadastrado")

    hashed_password = hash_password(user.password)
    created_at = datetime.utcnow()

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
        "created_at": created_at.isoformat()
    }


def verify_user_credentials(email: str, password: str, collection):
    user = collection.find_one({"email": email})
    if user is None:
        return None

    hashed_password = hash_password(password)  # 🔹 Aplica o segundo hash antes de verificar

    if verify_password(hashed_password, user["hashed_password"]):  
        return {"name": user["name"], "email": user["email"]}
    
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


@app.post("/api/register")
async def register(user: UserCreate):
    client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
    db = client['litoral_puro_rj']
    collection = db['usuario']

    try:
        created_user = create_user(user, collection)

        # Gerar token JWT
        token_data = {"sub": created_user["email"]}
        access_token = create_access_token(token_data, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

        return JSONResponse(
            content={
                "message": "Usuário criado com sucesso!",
                "user": created_user,
                "access_token": access_token,
                "token_type": "bearer"
            },
            status_code=status.HTTP_201_CREATED
        )
  except ValueError as ve:
        raise HTTPException(
            print(e)
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
    
    stored_user = collection.find_one({"email": user.email})
    
    if not stored_user or not pwd_context.verify(user.password, stored_user["hashed_password"]):
        print(e)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas")
    
    # Cria um token JWT
    token = create_access_token({"sub": user.email}, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

    return JSONResponse(content={"token": token, "user": stored_user}, status_code=status.HTTP_200_OK)

@app.get("/api/me")
async def get_user_info(token: str = Depends(oauth2_scheme)):
    client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
    db = client['litoral_puro_rj']
    collection = db['usuario']
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Token inválido")
        user = collection.find_one({"email": email}, {"_id": 0, "name": 1})
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")
