import pandas as pd
from bs4 import BeautifulSoup as bs
import requests
import pytest
import json
from unidecode import unidecode


@pytest.fixture
def main():
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

    df.to_json("./data2.json")
    return df.to_json()


def test_estrutura(main):
    assert "Praia" in main
    assert "Local" in main
    assert "Qualidade" in main
    assert "Municipio" in main
    assert "Data" in main


def test_tamanho(main):
    main = json.loads(main)
    assert len(main["Praia"]) == 266
    assert len(main["Local"]) == 266
    assert len(main["Qualidade"]) == 266
    assert len(main["Municipio"]) == 266
    assert len(main["Data"]) == 266


def test_status(main):
    validos = {"Propria", "Impropria", "n/a"}
    main = json.loads(main)
    for i in range(len(main)):
        status = main["Qualidade"][str(i)]
        assert status in validos


