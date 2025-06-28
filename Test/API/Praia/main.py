from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from datetime import datetime
from passlib.context import CryptContext
import pandas as pd
from bs4 import BeautifulSoup as bs
from unidecode import unidecode
import hashlib
import requests
import ssl
import json
import os

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

@app.get("/praia/data")
def getData():
    client = MongoClient(MONGO_URI, server_api=ServerApi('1'))

    db = client['litoral_puro_rj']  # Nome do banco de dados
    collection = db['praia']  # Nome da coleção

    # Buscar todos os documentos na coleção
    dados = collection.find()

    # Preparar os dados no formato original
    resultado = {
        "Id": {},
        "Praia": {},
        "Qualidade": {},
        "Municipio": {},
        "Local": {},
        "Data": {}
    }

    # Iterar sobre os documentos e organizar no formato JSON desejado
    for idx, documento in enumerate(dados):
        resultado["Id"][str(idx)] = documento["Id"]
        resultado["Praia"][str(idx)] = documento["Praia"]
        resultado["Qualidade"][str(idx)] = documento["Qualidade"]
        resultado["Municipio"][str(idx)] = documento["Municipio"]
        resultado["Local"][str(idx)] = documento["Local"]
        resultado["Data"][str(idx)] = documento["Data"]

    conteudo_string = json.dumps(resultado)

    return conteudo_string


@app.get("/praia/map")
def getMap():
    response = requests.get("https://maps.googleapis.com/maps/api/js?key="+MAPS_API+"&callback=console.debug&libraries=maps,marker&v=beta")
    return JSONResponse(content={"script": response.text}, status_code=200)


@app.get("/praia/coordinates")
def getCoordinates():
    with open("coordinates.json", 'r', encoding='utf-8') as arquivo:
        conteudo_json = json.load(arquivo)
        conteudo_string = json.dumps(conteudo_json)
    return conteudo_string


@app.get("/praia/webscrapping")
def webScrapping():
    url = "https://praialimpa.net/"
    page = requests.get(url)

    df = pd.DataFrame({"Id":[], "Praia":[], "Local":[], "Qualidade":[], "Municipio":[], "Data":[]})
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
            hash_input = (unidecode(praias[i].get_text(strip=True)) + unidecode(locais[i].get_text(strip=True))).encode("utf-8")
            idHash = hashlib.md5()
            idHash.update(hash_input)

            new_line = {
                "Id":idHash.hexdigest(),
                "Praia":unidecode(praias[i].get_text(strip=True)),
                "Local":unidecode(locais[i].get_text(strip=True)),
                "Qualidade":unidecode(status[i].get_text(strip=True)),
                "Municipio":municipio,
                "Data":lastupdate
            }

            df = df._append(new_line, ignore_index=True)


    novos_dados = json.loads(df.to_json())

    client = MongoClient(MONGO_URI, server_api=ServerApi('1'))

    # Preparar as coleções MongoDB
    db = client['litoral_puro_rj']  # Banco de dados
    collection = db['praia']  # Coleção principal
    historico = db['praia_historico']  # Coleção para o histórico

    alteradas = []

    for index in novos_dados['Id']:
        atual = collection.find_one({"Id": novos_dados['Id'][index]})

        if(atual and atual["Qualidade"] != novos_dados["Qualidade"][index]):
            documento = {
                "Id": novos_dados['Id'][index],
                "Praia": novos_dados['Praia'][index],
                "Qualidade": novos_dados['Qualidade'][index],
                "Municipio": novos_dados['Municipio'][index],
                "Local": novos_dados['Local'][index],
                "Data": novos_dados['Data'][index]
            }

            alteradas.append(documento)


    data = {
        "lista": alteradas
    }

    headers = {
        "Content-Type": "application/json",
    }

    response = requests.post("https://hatz-d.com.br/subscricao/query-subscriptions", json=data, headers=headers)

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
        for index in range(len(novos_dados['Id'])):
            documento = {
                "Id": novos_dados['Id'][str(index)],
                "Praia": novos_dados['Praia'][str(index)],
                "Qualidade": novos_dados['Qualidade'][str(index)],
                "Municipio": novos_dados['Municipio'][str(index)],
                "Local": novos_dados['Local'][str(index)],
                "Data": novos_dados['Data'][str(index)]
            }

            collection.insert_one(documento)

        return "Dados atualizados com sucesso e historico preservado!"

    except Exception as e:
        print("Erro:", e)
        return "Erro!"


@app.get("/praia/healthz")
def healthz():
    return "ok"

      
