from fastapi import FastAPI
import json
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
from fastapi.responses import JSONResponse

app = FastAPI()

MAPS_API = os.getenv("MAPS_API")

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
    with open("/Litoral-Puro-RJ/Test/DataExtraction/data.json", 'r', encoding='utf-8') as arquivo:
        conteudo_json = json.load(arquivo)  # Carrega o JSON
        conteudo_string = json.dumps(conteudo_json)  # Converte em string com formatação
    return conteudo_string


@app.get("/api/map")
def getMap():
    response = requests.get("https://maps.googleapis.com/maps/api/js?key="+MAPS_API+"&callback=console.debug&libraries=maps,marker&v=beta")
    return JSONResponse(content={"script": response.text}, status_code=200)
    
