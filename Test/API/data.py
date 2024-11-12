from fastapi import FastAPI
import json
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
from fastapi.responses import JSONResponse
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

app = FastAPI()

MAPS_API = os.getenv("MAPS_API")
MONGO_URI = os.getenv("MONGO_URI")

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
