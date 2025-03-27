from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from datetime import datetime
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, constr
import ssl
import json
import os

app = FastAPI()

MONGO_URI = os.getenv("MONGO_URI")
MAIL_SECRET = os.getenv("MAIL_SECRET")

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

# Função para criar o usuário
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


@app.get("/healthz")
def healthz():
    return "ok"
