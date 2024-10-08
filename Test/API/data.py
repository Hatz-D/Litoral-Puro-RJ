from fastapi import FastAPI
import json

app = FastAPI()

@app.get("/api/data")
def getData():
    with open("../DataExtraction/data.json", 'r', encoding='utf-8') as arquivo:
        conteudo_json = json.load(arquivo)  # Carrega o JSON
        conteudo_string = json.dumps(conteudo_json, indent=4)  # Converte em string com formatação
    return conteudo_string
