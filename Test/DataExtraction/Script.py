import pandas as pd
from bs4 import BeautifulSoup as bs
import requests

def jenkins():
    return 1


def test():
    assert jenkins() == 1


def main():
    url = "https://praialimpa.net/"
    page = requests.get(url)

    df = pd.DataFrame({"Praia":[], "Local":[], "Qualidade":[], "Municipio":[], "Data":[]})
    soup = bs(page.content, "html.parser")
    sections = soup.find_all("section")

    for section in sections:        
        status = section.find_all(class_=["propria","impropria","amostragem-nao-realizada"])
        praias = section.find_all(class_="name")
        locais = section.find_all(class_="location")
        municipio = section.find("h1").get_text()
        lastupdate = section.find(class_="last-update").get_text()

        for i in range(0, len(praias)):
            new_line = {"Praia":praias[i].get_text(strip=True), "Local":locais[i].get_text(strip=True), "Qualidade":status[i].get_text(strip=True), "Municipio":municipio, "Data":lastupdate}
            df = df._append(new_line, ignore_index=True)

    df.to_json("./data.json")


main()

